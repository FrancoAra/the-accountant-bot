"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const _ = require("underscore");
function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
class Extractor {
    constructor(r) {
        this.run = r;
    }
    map(f) {
        return new Extractor((state) => {
            const [newState, a] = this.run(state);
            if (a === null)
                return [newState, null];
            else
                return [newState, f(a)];
        });
    }
    andThen(f) {
        return new Extractor((state) => {
            const [newState0, a] = this.run(state);
            if (a === null)
                return [newState0, null];
            else
                return f(a).run(newState0);
        });
    }
    orElse(other) {
        return new Extractor((state) => {
            const [newState, a] = this.run(state);
            if (a === null)
                return other.run(state);
            else
                return [newState, a];
        });
    }
}
function justMatch(reg) {
    return new Extractor((state) => {
        const result = state.match(reg);
        if (result === null)
            return [state, null];
        else
            return [state, result];
    });
}
function setFirst(reg) {
    return new Extractor((state) => {
        const result = state.match(reg);
        if (result === null || result[1] === null)
            return [state, null];
        else
            return [result[1], result[1]];
    });
}
function takeFirst(reg) {
    return new Extractor((state) => {
        const result = state.match(reg);
        if (result === null || result[1] === null)
            return [state, null];
        else
            return [state, result[1]];
    });
}
function takeFirstSetSecond(reg) {
    return new Extractor((state) => {
        const result = state.match(reg);
        console.log(result);
        if (result === null || result[1] === null || result[2] === null)
            return [state, null];
        else
            return [result[2], result[1]];
    });
}
function addTransaction(_logger) {
    return setFirst(/transaction:\s?(.+)/im)
        .andThen(() => takeFirstSetSecond(/(\d+)\s?(.+)/i))
        .andThen((amountRaw) => {
        return takeFirst(/(.+)\s?/i).map((pilotsRaw) => {
            return {
                id: uuidv4(),
                crew: pilotsRaw.split(',').map(x => x.trim()),
                profit: parseInt(amountRaw),
                logger: _logger
            };
        });
    });
}
function getTransactions() {
    return justMatch(/list-transactions/im).map(() => { });
}
function getEarnings() {
    return justMatch(/earnings/im).map(() => { });
}
function createBot(discordToken, database, authorized) {
    const client = new discord_js_1.Client();
    function authorize(then) {
        return (message) => {
            if (_.contains(authorized, message.author.id))
                return then(message);
            else
                return (() => { });
        };
    }
    function opAddTransaction(message) {
        return (row) => {
            database.ledger.push(row);
            message.react('💵');
        };
    }
    function opReplyTransactions(message) {
        message.reply(JSON.stringify(database.ledger));
    }
    function opReplyBank(message) {
        message.reply(database.ledger.map(x => x.profit).reduce((current, x) => current + x, 0));
    }
    client.on('ready', () => {
        console.log(`Logged in as ${client.user.tag}!`);
    });
    client.on('message', authorize(message => {
        addTransaction(message.author.id).map(opAddTransaction(message))
            .orElse(getTransactions().map(() => opReplyTransactions(message)))
            .orElse(getEarnings().map(() => opReplyBank(message)))
            .run(message.content);
    }));
    client.login(discordToken);
}
exports.createBot = createBot;
//# sourceMappingURL=Bot.js.map