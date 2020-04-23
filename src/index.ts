import { createServer } from './Server'
import { createBot } from './Bot'
import { config } from 'dotenv'
import { InMemory, emptyMemory } from './SharedMemory'

config()

var sharedMemory: InMemory = emptyMemory()
const port = parseInt(process.env.PORT)
const discordToken = process.env.DISCORD_TOKEN
const authorized = process.env.AUTHORIZED.split(",")

createBot(discordToken, sharedMemory, authorized)
createServer(port, sharedMemory)
