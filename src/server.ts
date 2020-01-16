
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

    // Create apollo server
    const server = new ApolloServer({
      context: ({ req, res }) => {
        return { req, res }
      },
      playground: NODE_ENV !== 'production',
      schema,
      debug: NODE_ENV !== 'production'
    })

    // Create middleware
    server.applyMiddleware({ app })

    // listen to port
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}/graphql`))
  } catch (e) {
    console.log(e)
    throw new ApolloError(e)
  }
})()
