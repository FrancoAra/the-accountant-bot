"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
function createServer(port, database) {
    const server = express();
    const router = express.Router();
    router.get('/', (req, res) => {
        res.json({
            message: 'Hello! This is The Accountant'
        });
    });
    router.get('/ledger', (req, res) => {
        res.json(database.ledger);
    });
    server.use('/', router);
    server.listen(port, (err) => {
        if (err) {
            return console.log(err);
        }
        console.log(`Server is listening on port ${port}...`);
    });
}
exports.createServer = createServer;
//# sourceMappingURL=Server.js.map