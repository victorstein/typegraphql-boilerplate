import { Resolver, Mutation, Args, Query, Authorized, Ctx, FieldResolver, Root, Arg } from "type-graphql";
import { User, userModel } from "../../models/user";
import createUserInterface from "./interfaces/createUser";
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
import createCRUDResolver from "../globalResolvers/crudBaseResolver"
import { createFilters } from "../../utils/reusableSnippets";
import LimitRate from "../../middlewares/rateLimiter";
import Error from '../../middlewares/errorHandler'
import updateUserInterface from "./interfaces/updateUserInterface";
import { mongoose } from "@typegoose/typegoose";

const {
  TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
  TOKEN_SECRET_EXPIRATION,
  REFRESH_TOKEN_SECRET_EXPIRATION,
  PASSWORD_RESET_REQUEST_EXPIRY,
  EMAIL_VERIFICATION_EXPIRY,
  GLOBAL_SECRET
} = process.env

// Define the prefix of the resolvers
const resolverName = 'User'

// Create an enum based on the model indexes
const { textIndexes, regularIndexes } = createFilters(userModel, resolverName)

// Initialize base CRUD factory
const CRUDUser = createCRUDResolver({
  prefix: resolverName,
  returnType: User,
  model: userModel,
  allowedSearchCriterias: textIndexes,
  allowedSortCriterias: regularIndexes,
  permissions: {
    findById: [`read_all_${resolverName}s`],
    readAll: [`read_all_${resolverName}s`],
    deleteById: [`delete_all_${resolverName}s`]
  }
})

@Resolver(() => User)
export default class userResolvers extends CRUDUser {
  
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

  @Mutation(() => User)
  @Authorized('create_users')
  createUser(
    @Args() { email, password, confirmPassword, firstName, lastName }: createUserInterface
  ): Promise<User> {
    try {
      return createUser({ email, password, confirmPassword, firstName, lastName })
    } catch ({ message, code }) {
      throw new Error(message, code)
    }
  }

  @Mutation(() => User)
  @LimitRate('login', 30)
  async signUp(
    @Args() { email, password, confirmPassword, firstName, lastName }: createUserInterface
  ): Promise<User> {
    try {
      // Check if the admin role was already created
      if (await userModel.estimatedDocumentCount() === 0) {
        throw new Error('Unable to process your request', 400)
      }

      return createUser({ email, password, confirmPassword, firstName, lastName })
    } catch ({ message, code }) {
      throw new Error(message, code)
    }
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

  @Mutation(() => User)
  @Authorized(['update_all_users', 'update_owned'])
  async updateUser (
    @Args() { id, firstName, lastName, newPermissions, role }: updateUserInterface,
    @Ctx() { user, permissions }: any
  ): Promise<User> {
    try {
      // create a filter to look for the user and an update object
      const filter: any = { _id: id ? id : user._id }
      const update: any = {}

      // If the petitioner doesnt have the update all permission search if the user created the permission
      if (!permissions.includes('update_all_users')) {
        if (id !== user._id) { throw new Error('You do not have enough permissions to permform this action', 403) }
      }

      // Locate the role
      const foundUser = await userModel.findOne(filter)

      // If the user was not found then return error
      if (!foundUser) { throw new Error('Unable to find a user with the provided Id', 400) }

      // If the user exits update the neccesary data
      if (firstName) { update.firstName = firstName }
      if (lastName) { update.lastName = lastName }

      // Check if the permissions are to be updated and validate them agains the db
      if (newPermissions.length) {
        const foundPermissions = await permissionModel.find({ _id: { $in: newPermissions } }, { _id: 1 })

        // If a permission is not found return error
        if (foundPermissions.length !== newPermissions.length) {
          throw new Error('You provided one or more invalid permission', 400)
        }

        // Inset the data in the permissions
        update.permissions = newPermissions.map(u => mongoose.Types.ObjectId(u))
      }

      // Check if the role is to be updated
      if (role) {
        const foundRole = await roleModel.findById(role)

        // If the role was not found return error
        if (!foundRole) { throw new Error('You provided an invalid role', 400) }

        update.role = mongoose.Types.ObjectId(role)
      }

      // asssign all the data to the user
      foundUser.set(update)

      // save and return the data
      return foundUser.save()
    } catch ({ message, code }) {
      throw new Error(message, code)
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
      if (!role) { throw new Error('There was an error while processing your request', 400) }

      return role
    } catch({ message, code }) {
      throw new Error(message, code)
    }
  }
  
  @FieldResolver(() => String)
  async permissions (
    @Root() root:any
  ): Promise<Permission[]> {
    try {
      const  role = await roleModel.findById(root.role, { permissions: 1, _id: 0 })

      const permissions = await permissionModel.find({
        $or: [
          { _id: { $in: role?.permissions } },
          { _id: { $in: root.permissions } }
        ]
      })

      return permissions
    } catch ({ message, code }) {
      throw new Error(message, code)
    }
  }
}
