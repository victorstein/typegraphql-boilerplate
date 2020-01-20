import { Resolver, Mutation, Args, Query, Authorized, Ctx, FieldResolver, Root, Arg } from "type-graphql";
import { User, userModel } from "../../models/user";
import createUserInterface from "./interfaces/createUser";
import { ApolloError, AuthenticationError } from "apollo-server-express";
import Token from "./outputTypes/token";
import loginInterface from "./interfaces/loginInterface";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { permissionModel, Permission } from "../../models/permission";
import { roleModel, Role } from "../../models/role";

const {
  TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
  TOKEN_SECRET_EXPIRATION,
  REFRESH_TOKEN_SECRET_EXPIRATION
} = process.env

interface createUser {
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  confirmPassword: string
}

const createUser = (
  { email, password, firstName, lastName, confirmPassword }: createUser
  ): Promise<User> => {
  return new Promise(async (resolve, reject) => {
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
      const newUser = await userModel.create({
        firstName,
        lastName,
        password,
        email
      })

      resolve(newUser)
    } catch(e) {
      reject(e)
    }
  })
}

@Resolver(() => User)
export default class userResolvers {

  @Mutation(() => User)
  @Authorized('createUsers')
  createUser(
    @Args() { email, password, confirmPassword, firstName, lastName }: createUserInterface
  ): Promise<User> {
    try {
      return createUser({ email, password, confirmPassword, firstName, lastName })
    } catch (e) {
      throw new ApolloError(e)
    }
  }

  @Mutation(() => User)
  async signUp(
    @Args() { email, password, confirmPassword, firstName, lastName }: createUserInterface
  ): Promise<User> {
    try {
      // Check if the admin role was already created
      if (await userModel.estimatedDocumentCount() === 0) {
        throw new Error('Unable to process your request')
      }

      return createUser({ email, password, confirmPassword, firstName, lastName })
    } catch (e) {
      throw new ApolloError(e)
    }
  }

  @Mutation(() => User)
  async createAdmin (
    @Args() { email, password, confirmPassword, firstName, lastName }: createUserInterface
  ): Promise<User> {
    try {
      // Check if the admin role was already created
      if (await userModel.estimatedDocumentCount() > 0) {
        throw new Error('Unable to process your request')
      }

      return createUser({ email, password, confirmPassword, firstName, lastName })
    } catch (e) {
      throw new ApolloError(e)
    }
  }

  @Query(() => Token)
  async login (
    @Args() { email, password }: loginInterface
  ): Promise<Token> {
    try {
      // Check if the user exists on the Db
      const user = await userModel.findOne({ email })

      // Throw error if user doesnt exists
      if (!user) { throw new Error('The provided email or password is invalid') }

      // Check if the password matches the hash
      const valid = await bcrypt.compare(password, user.password)

      // If invalid return error
      if (!valid) { throw new Error('The provided email or password is invalid') }

      // If the login is valid proceed to check if the user has been verified
      if (!user.verified) { throw new Error('The account has not yet been verified. Please check your email and verify your account.') }

      // Create the payload
      const payload = {
        id: user._id,
        role: user.role,
        permissions: user.permissions,
        tokenVersion: user.tokenVersion
      }

      // If the account is verified then proceed to create the hashes
      const token = jwt.sign(payload, TOKEN_SECRET!, { expiresIn: TOKEN_SECRET_EXPIRATION! })
      const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET!, { expiresIn: REFRESH_TOKEN_SECRET_EXPIRATION! })

      return { token, refreshToken }
    } catch (e) {
      throw new AuthenticationError(e)
    }
  }

  @Query(() => String)
  async refreshToken (
    @Arg('refreshToken', { nullable: false }) refreshToken: string
  ): Promise<String> {
    try {
      // Verify the token is valid
      const payload: any = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!)

      // Look up the user in the DB
      const user = await userModel.findById({ _id: payload.id })

      // If the user doesnt exist return error
      if (!user) { throw new Error('Invalid token') }

      // Verify the token version
      if (user.tokenVersion !== payload.tokenVersion) {
        throw new Error('Invalid token')
      }

      // Create new payload
      const newPayload = {
        id: user._id,
        role: user.role,
        permissions: user.permissions,
        tokenVersion: user.tokenVersion
      }

      // If the token is valid create a new token for the user
      const newToken = jwt.sign(newPayload, REFRESH_TOKEN_SECRET!, {
        expiresIn: REFRESH_TOKEN_SECRET_EXPIRATION
      })

      return newToken
    } catch (e) {
      console.log(e)
      throw new ApolloError(e)
    }
  }

  @Query(() => User)
  @Authorized()
  me (
    @Ctx() { user }: any
  ): User {
    // Return the user collected from the context
    return user
  }

  @FieldResolver(() => String)
  fullName (
    @Root() root:any
  ): string {
    return `${root.firstName} ${root.lastName}`
  }

  @FieldResolver(() => String)
  async role (
    @Root() root:any
  ): Promise<Role> {
    try {
      // Look for the role
      const role = await roleModel.findById(root.role)

      // If theres no role throw error (users should always have a role)
      if (!role) { throw new Error('There was an error while processing your request') }

      return role
    } catch(e) {
      throw new ApolloError(e)
    }
  }
  
  @FieldResolver(() => String)
  async permissions (
    @Root() root:any
  ): Promise<Permission[]> {
    try {
      const permissions = await permissionModel.find({
        $or: [
          { usedByRole: root.role },
          { _id: { $in: root.permissions } }
        ]
      })

      return permissions
    } catch (e) {
      throw new ApolloError(e)
    }
  }
}
