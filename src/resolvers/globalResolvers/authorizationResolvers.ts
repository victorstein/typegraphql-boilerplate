import { Resolver, Query, Authorized, Ctx, Args, Arg, Mutation } from "type-graphql";
import passwordResetInterface from "./interfaces/passwordResetInterface";
import requestPasswordResetInterface from "./interfaces/requestPasswordResetInterface";
import EmailProvider from "../../utils/emailProvider";
import jwt from 'jsonwebtoken'
import Token from "./outputTypes/token";
import loginInterface from "./interfaces/loginInterface";
import bcrypt from 'bcryptjs'
import { User, userModel } from "../../models/user";
import LimitRate from "../../middlewares/rateLimiter";
import Error from '../../middlewares/errorHandler'
import createUserInterface from "../userResolvers/interfaces/createUser";

interface createUser {
  email: string,
  password: string,
  firstName: string,
  lastName: string
}

export const createUser = (
  { email, password, firstName, lastName }: createUser
  ): Promise<User> => {
  return new Promise(async (resolve, reject) => {
    try {
      // Check if the user exists in the DB
      const user = await userModel.findOne({ email })

      // Throw error if user already exists
      if (user) { throw new Error('Unable to process your request with the provided email', 400) }

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

const {
  TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
  TOKEN_SECRET_EXPIRATION,
  REFRESH_TOKEN_SECRET_EXPIRATION,
  PASSWORD_RESET_REQUEST_EXPIRY,
  EMAIL_VERIFICATION_EXPIRY,
  GLOBAL_SECRET
} = process.env

@Resolver()
export default class AuthorizationResolvers {
  @Query(() => User)
  @Authorized()
  me (
    @Ctx() { user }: any
  ): User {
    // Return the user collected from the context
    return user
  }

  @Query(() => Boolean)
  async resendVerificationEmail (
    @Args() { email }: requestPasswordResetInterface
  ): Promise<Boolean> {
    try {
      // Look for the user using the email
      const user = await userModel.findOne({ email })

      // Return error if no user
      if (!user) { throw new Error('The provided email is invalid', 400) }

      // If the user was found check if is not verified
      if (user.verified) { throw new Error('User is already verified', 400) }

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
    } catch ({ message, code }) {
      throw new Error(message, code)
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
      if (!user) { throw new Error('The provided email or password is invalid', 401) }

      // Check if the password matches the hash
      const valid = await bcrypt.compare(password, user.password)

      // If invalid return error
      if (!valid) { throw new Error('The provided email or password is invalid', 401) }

      // If the login is valid proceed to check if the user has been verified
      if (!user.verified) { throw new Error('The account has not yet been verified. Please check your email and verify your account.', 403) }

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
    } catch ({ message, code }) {
      throw new Error(message, code)
    }
  }

  
  @Mutation(() => User)
  @LimitRate('login', 30)
  async signUp(
    @Args() { email, password, firstName, lastName }: createUserInterface
  ): Promise<User> {
    try {
      // Check if the admin role was already created
      if (await userModel.estimatedDocumentCount() === 0) {
        throw new Error('Unable to process your request', 400)
      }

      return createUser({ email, password, firstName, lastName })
    } catch ({ message, code }) {
      throw new Error(message, code)
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
      if (!user) { throw new Error('Invalid token', 400) }

      // Verify the token version
      if (user.tokenVersion !== payload.tokenVersion) {
        throw new Error('Invalid token', 400)
      }

      // Create new payload
      const newPayload = {
        id: user._id,
        role: user.role,
        permissions: user.permissions,
        tokenVersion: user.tokenVersion
      }

      // If the token is valid create a new token for the user
      const newToken = jwt.sign(newPayload, TOKEN_SECRET!, {
        expiresIn: TOKEN_SECRET_EXPIRATION
      })

      return newToken
    } catch ({ message, code }) {
      throw new Error(message, code)
    }
  }

  @Query(() => Boolean)
  @LimitRate('email_verification', 5)
  async emailVerification(
    @Arg('hash', { nullable: false }) hash: string
  ): Promise<Boolean> {
    try {
      // Decrypt the hash
      const payload:any = jwt.verify(hash, GLOBAL_SECRET!)

      // If no user in the payload return false
      if (!payload.id) { throw new Error('Invalid payload', 400) }

      // Get the id from the payload and locate user
      let user = await userModel.findById(payload.id)

      // If no user return error
      if (!user) { throw new Error('The link is invalid or may have expired', 403) }

      if (user.verified) {
        throw new Error('The user has already been verified', 400)
      }

      // If the user was found update the verified param
      user.set({ verified: true })

      // save the data
      await user.save()

      // return true for successful operation
      return true
    } catch ({ message, code }) {
      throw new Error(message, code)
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

  @Mutation(() => Boolean)
  async passwordReset (
    @Args() { password, confirmPassword, hash }: passwordResetInterface
  ): Promise<boolean> {
    try {
      // Check if passwords match
      if (password !== confirmPassword) { throw new Error('Passwords provided do not match', 400) }

      // retreive the id of the requester from the hash
      const { id, version }: any = jwt.verify(hash, GLOBAL_SECRET!)

      // If no id then return error
      if (!id) { throw new Error('The reset password link provided has been used or it has expired', 403) }

      // Retreive the user using the id
      const user = await userModel.findById(id)

      // If user not found return error
      if (!user) { throw new Error('Invalid request', 400) }

      // If the versions dont match return error
      if (version !== user.passwordRecoveryVersion) {
        throw new Error('The reset password link provided has been used or it has expired', 403)
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
    } catch ({ message, code }) {
      throw new Error(message, code)
    }
  }
}