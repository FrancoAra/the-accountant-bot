"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Server_1 = require("./Server");
const Bot_1 = require("./Bot");
const dotenv_1 = require("dotenv");
const SharedMemory_1 = require("./SharedMemory");
dotenv_1.config();
var sharedMemory = SharedMemory_1.emptyMemory();
const port = parseInt(process.env.PORT);
const discordToken = process.env.DISCORD_TOKEN;
const authorized = process.env.AUTHORIZED.split(",");
Bot_1.createBot(discordToken, sharedMemory, authorized);
Server_1.createServer(port, sharedMemory);
//# sourceMappingURL=index.js.map