import { Snowflake } from "discord.js";

export interface LedgerRow {
  id: string
  crew: string[]
  profit: number
  logger: Snowflake
}

export interface InMemory {
  ledger: LedgerRow[]
}

export function emptyMemory(): InMemory { 
  return { 
    ledger: []
  } 
} 