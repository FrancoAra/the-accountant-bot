import * as express from 'express'
import { InMemory } from './SharedMemory'

export function createServer (port: number, database: InMemory) {

  const server = express()
  const router = express.Router()

  router.get('/', (req, res) => {
    res.json({
      message: 'Hello! This is The Accountant'
    })
  })

  router.get('/ledger', (req, res) => {
    res.json(database.ledger)
  })

  server.use('/', router)

  server.listen(port, (err) => {
    if (err) { return console.log(err) }
    console.log(`Server is listening on port ${port}...`)
  })


}