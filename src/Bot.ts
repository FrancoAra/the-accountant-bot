import { Client, Message, Snowflake } from 'discord.js'
import { InMemory, LedgerRow } from './SharedMemory'
import * as _ from 'underscore'

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

class Extractor<A> {

    run: (state: string) => [string, A | null]

    constructor (r: (state: string) => [string, A | null]) {
        this.run = r
    }

    map<B>(f: (a: A) => B): Extractor<B> {
        return new Extractor((state: string) => {
            const [newState, a] = this.run(state)
            if(a === null) return [newState, null]
            else return [newState, f(a)]
        })
    }

    andThen<B>(f: (a: A) => Extractor<B>): Extractor<B> {
        return new Extractor((state: string) => {
            const [newState0, a] = this.run(state)
            if(a === null) return [newState0, null]
            else return f(a).run(newState0)
        })
    }

    orElse(other: Extractor<A>): Extractor<A> {
        return new Extractor((state: string) => {
            const [newState, a] = this.run(state)
            if(a === null) return other.run(state)
            else return [newState, a]
        })
    }
}

function justMatch(reg: RegExp): Extractor<RegExpMatchArray> {
    return new Extractor((state) => {
        const result = state.match(reg)
        if(result === null) return [state, null]
        else return [state, result]
    })
}

function setFirst(reg: RegExp): Extractor<string> {
    return new Extractor((state) => {
        const result = state.match(reg)
        if(result === null || result[1] === null) return [state, null]
        else return [result[1], result[1]]
    })
}

function takeFirst(reg: RegExp): Extractor<string> {
    return new Extractor((state) => {
        const result = state.match(reg)
        if(result === null || result[1] === null) return [state, null]
        else return [state, result[1]]
    })
}

function takeFirstSetSecond(reg: RegExp): Extractor<string> {
    return new Extractor((state) => {
        const result = state.match(reg)
        console.log(result)
        if(result === null || result[1] === null || result[2] === null) return [state, null]
        else return [result[2], result[1]]
    })
}

function addTransaction(_logger: Snowflake): Extractor<LedgerRow> {
    return setFirst(/transaction:\s?(.+)/im)
        .andThen(() => takeFirstSetSecond(/(\d+)\s?(.+)/i))
        .andThen((amountRaw: string) => {
            return takeFirst(/(.+)\s?/i).map((pilotsRaw: string) => {
                return {
                    id: uuidv4(),
                    crew: pilotsRaw.split(',').map(x => x.trim()),
                    profit: parseInt(amountRaw),
                    logger: _logger
                }
            })
        })
}

function getTransactions(): Extractor<void> {
    return justMatch(/list-transactions/im).map(() => {})
}

function getEarnings(): Extractor<void> {
    return justMatch(/earnings/im).map(() => {})
}

export function createBot(discordToken: string, database: InMemory, authorized: string[]) {
    const client = new Client();

    function authorize(then: (message: Message) => void ): (message: Message) => void {
        return (message: Message) => {
            if(_.contains(authorized, message.author.id)) return then(message);
            else return (() => {})
        }
    }

    function opAddTransaction(message: Message): (row: LedgerRow) => void {
        return (row: LedgerRow) => {
            database.ledger.push(row)
            message.react('💵')
        }
    }

    function opReplyTransactions(message: Message): void {
        message.reply(JSON.stringify(database.ledger))
    }

    function opReplyBank(message: Message): void {
        message.reply(database.ledger.map(x => x.profit).reduce((current, x) => current + x, 0))
    }

    client.on('ready', () => {
        console.log(`Logged in as ${client.user.tag}!`);
    });

    client.on('message', authorize(message => {
        addTransaction(message.author.id).map(opAddTransaction(message))
            .orElse(getTransactions().map(() => opReplyTransactions(message)))
            .orElse(getEarnings().map(() => opReplyBank(message)))
            .run(message.content)
    }));

    client.login(discordToken);
}
