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
import { createUser } from "../../utils/reusableSnippets";
import passwordResetInterface from "./interfaces/passwordResetInterface";
import requestPasswordResetInterface from "./interfaces/requestPasswordResetInterface";
import EmailProvider from "../../utils/emailProvider";
import byIdInterface from "../globalInterfaces/input/byIdInterface";

const {
  TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
  TOKEN_SECRET_EXPIRATION,
  REFRESH_TOKEN_SECRET_EXPIRATION,
  PASSWORD_RESET_REQUEST_EXPIRY,
  EMAIL_VERIFICATION_EXPIRY,
  GLOBAL_SECRET
} = process.env

@Resolver(() => User)
export default class userResolvers {
  
  @Query(() => User)
  @Authorized()
  me (
    @Ctx() { user }: any
  ): User {
    // Return the user collected from the context
    return user
  }

  @Query(() => User)
  @Authorized('readUsers')
  async userById(
    @Args() { id }: byIdInterface
  ): Promise<User> {
    try {
      // Find the user in the DB
      const user = await userModel.findById(id)

      // If no user then return error
      if (!user) { throw new Error('Unable to find the requested user') }

      return user
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

      // Create token refresh expiration data
      const refreshTokenData: any = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET!)
      const refreshTokenExpiration = { createdAt: refreshTokenData.iat, expiresAt: refreshTokenData.exp }

      return { token, refreshToken, refreshTokenExpiration }
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

  @Query(() => Boolean)
  async emailVerification(
    @Arg('hash', { nullable: false }) hash: string
  ): Promise<Boolean> {
    try {
      // Decrypt the hash
      const payload:any = jwt.verify(hash, GLOBAL_SECRET!)

      // If no user in the payload return false
      if (!payload.id) { throw new Error('Invalid payload') }

      // Get the id from the payload and locate user
      let user = await userModel.findById(payload.id)

      // If no user return error
      if (!user) { throw new Error('The link is invalid or may have expired') }

      if (user.verified) {
        throw new Error('The user has already been verified')
      }

      // If the user was found update the verified param
      user.set({ verified: true })

      // save the data
      await user.save()

      // return true for successful operation
      return true
    } catch (e) {
      console.log(e)
      throw new ApolloError(e)
    }
  }

  @Query(() => Boolean)
  async requestPasswordReset (
    @Args() { email }: requestPasswordResetInterface
  ): Promise<Boolean> {
    // locate the user within the database
    const user = await userModel.findOne({ email })

    // If no user end operations and return true
    if (!user) { return true }

    // Create a hash that will ensure the user is requesting a pw reset
    const hash = jwt.sign({
      id: user._id,
      version: user.passwordRecoveryVersion
    }, GLOBAL_SECRET!, { expiresIn: PASSWORD_RESET_REQUEST_EXPIRY })

    // Setup email constructor
    const emailProvider = new EmailProvider({
      template: 'reset_password',
      subject: 'Password Recovery',
      to: email,
      data: { hash, firstName: user.firstName, lastName: user.lastName }
    })

    // Send Email to validate account
    await emailProvider.sendEmail()

    // Return true no matter the outcome
    return true
  }

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

  @Mutation(() => Boolean)
  async passwordReset (
    @Args() { password, confirmPassword, hash }: passwordResetInterface
  ): Promise<boolean> {
    try {
      // Check if passwords match
      if (password !== confirmPassword) { throw new Error('Passwords provided do not match') }

      // retreive the id of the requester from the hash
      const { id, version }: any = jwt.verify(hash, GLOBAL_SECRET!)

      // If no id then return error
      if (!id) { throw new Error('The reset password link provided has been used or it has expired') }

      // Retreive the user using the id
      const user = await userModel.findById(id)

      // If user not found return error
      if (!user) { throw new Error('Invalid request') }

      // If the versions dont match return error
      if (version !== user.passwordRecoveryVersion) {
        throw new Error('The reset password link provided has been used or it has expired')
      }

      // If user found proceed to hash the new password
      const hashedPassword = await bcrypt.hash(password, 12)

      // Set the new password to the user
      user.set({
        password: hashedPassword,
        tokenVersion: user.tokenVersion + 1,
        passwordRecoveryVersion: user.passwordRecoveryVersion + 1
      })

      // save the data
      await user.save()

      return true
    } catch (e) {
      console.log(e)
      throw new ApolloError(e)
    }
  }

  @Mutation(() => Boolean)
  async resendVerificationEmail (
    @Args() { email }: requestPasswordResetInterface
  ): Promise<Boolean> {
    try {
      // Look for the user using the email
      const user = await userModel.findOne({ email })

      // Return error if no user
      if (!user) { throw new Error('The provided email is invalid') }

      // If the user was found check if is not verified
      if (user.verified) { throw new Error('User is already verified') }

      // Use jsonwebtoken to create a unique hash with the user info
      const hash = jwt.sign({ id: user._id }, GLOBAL_SECRET!, { expiresIn: EMAIL_VERIFICATION_EXPIRY })

      // Setup email constructor
      const emailProvider = new EmailProvider({
        to: email,
        subject: 'Verify your account',
        template: "welcome_email",
        data: {
          firstName: user.firstName,
          lastName: user.lastName,
          hash
        }
      })

      // Send Email to validate account
      await emailProvider.sendEmail()

      return true
    } catch (e) {
      console.log(e)
      throw new ApolloError(e)
    }
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
