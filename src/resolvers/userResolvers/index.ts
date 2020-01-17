import { Resolver, Mutation, Args, Query } from "type-graphql";
import { User, userModel } from "../../models/user";
import createUserInterface from "./interfaces/createUser";
import { ApolloError } from "apollo-server-express";

@Resolver(() => User)
export default class userResolvers {
  @Query(() => String)
  hello () {
    return 'hello world'
  }

  @Mutation(() => User)
  async createUser(
    @Args() { email, password, confirmPassword, firstName, lastName }: createUserInterface
  ): Promise<User> {
    try {
      // Check if the user exists in the DB
      const user = await userModel.findOne({ email })

      // Throw error if user already exists
      if (user) { throw new Error('Unable to process your request with the provided email') }

      // if user does not exist proceed to chech that the passwords match
      if (password !== confirmPassword) {
        throw new Error('The passwords do not match')
      }

      // If the passwords match proceed to create the user
      return userModel.create({
        firstName,
        lastName,
        password,
        email
      })
    } catch (e) {
      console.log(e)
      throw new ApolloError(e)
    }
  }
}
