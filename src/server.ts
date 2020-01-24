
import 'reflect-metadata'
import 'dotenv/config'
import { ApolloError, ApolloServer } from 'apollo-server-express'
import express, { json } from 'express'
import { buildSchema } from 'type-graphql'
import resolvers from './resolvers'
import authChecker from './middlewares/authChecker'
import { mongoose } from '@typegoose/typegoose'
import helmet from 'helmet'
import enforce from 'express-sslify'
import setup from './utils/setup'
import { cyan, red } from 'chalk'

// Clear the console
// console.clear()

// Get the neccesary env variables
const { PORT, NODE_ENV, DB_USER, DB_PASS, DB_URI } = process.env;

(async () => {
  try {
    // Create express app
    const app = express()

    // Create Schema
    const schema = await buildSchema({
      resolvers,
      authChecker
    })

    // Create production basic security
    if (NODE_ENV === 'production') {
      app.use(json({ limit: '10mb' }))
      app.use(enforce.HTTPS({ trustProtoHeader: true }))
      app.use(helmet())
      app.disable('x-powered-by')
    }

    // Create database connection
    await mongoose.connect(`mongodb+srv://${DB_USER}:${DB_PASS}${DB_URI}`, {
      useNewUrlParser: true,
      dbName: 'forge',
      useUnifiedTopology: true,
      useCreateIndex: true
    })

    // Once connection was stablished procced to run the setup
    await setup()

    // Create apollo server once setup has completed
    const server = new ApolloServer({
      context: ({ req, res }) => {
        return { req, res }
      },
      playground: NODE_ENV !== 'production',
      schema,
      debug: NODE_ENV !== 'production',
      formatError: (err) => {
        const message = err.message.toLowerCase()
        if (message.includes('argument validation error')) {
          const error = err.extensions!.exception.validationErrors.map((u: any) => u.constraints)
          err.message = error.map((u : any) => Object.values(u))
        } else if (message.includes('invalid signature') || message.includes('invalid token')) {
          err.message = 'Invalid request'
        }
        console.log(red(err.message))
        return err
      }
    })

    // Create middleware
    server.applyMiddleware({ app })

    // listen to port
    app.listen(PORT, () => console.log(cyan(`Server running on http://localhost:${PORT}/graphql`)))
  } catch (e) {
    console.log(red(e))
    throw new ApolloError(e)
  }
})()
