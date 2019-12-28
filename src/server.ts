
import 'reflect-metadata'
import 'dotenv/config'
import { ApolloError, ApolloServer } from 'apollo-server-express'
import express from 'express'
import { buildSchema } from 'type-graphql'
import resolvers from './resolvers'
import authChecker from './middlewares/authChecker'

// Get the neccesary env variables
const { PORT, NODE_ENV } = process.env;

(async () => {
  try {
    // Create express app
    const app = express()

    // Create Schema
    const schema = await buildSchema({
      resolvers,
      authChecker
    })

    // Create apollo server
    const server = new ApolloServer({
      context: ({ req, res }) => {
        return { req, res }
      },
      playground: NODE_ENV !== 'production',
      schema
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
