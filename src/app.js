import express from 'express'
import morgan from 'morgan'
import cors from 'cors'
import * as fs from 'fs'
import swaggerJSDoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import router from './routes/index.js'
import swaggerOptions from './swagger/swagger.js'
import { config } from './config.js'
import { stream } from './config/winston.js'
import rateLimit from './middleware/rate-limiter.js'

// express configuration
const app = express()

//parse JSON and url-encoded query
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(cors({
  origin: [
    'http://localhost:3050',
    'http://10.18.245.57:3050',
    'http://10.19.230.111:3050',
    'https://together42.github.io',
  ],
  credentials: true,
}))
app.use(morgan('combined', { stream }))
app.use(rateLimit)

//Swagger 연결
const specs = swaggerJSDoc(swaggerOptions)
app.use(
  '/swagger',
  swaggerUi.serve,
  swaggerUi.setup(specs, { explorer: true }),
)

//route
app.use('/api', router)

console.log('host local')
app.listen(config.host.port)
console.log('Listening on', config.host.port)

