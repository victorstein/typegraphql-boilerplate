import { Resolver, Mutation, Args, Authorized, Ctx, FieldResolver, Root } from "type-graphql";
import { User, userModel } from "../../models/user";
import createUserInterface from "./interfaces/createUser";
import { permissionModel, Permission } from "../../models/permission";
import { roleModel, Role } from "../../models/role";
import { createUser } from "../../utils/reusableSnippets";
import createCRUDResolver from "../globalResolvers/crudBaseResolver"
import { createFilters } from "../../utils/reusableSnippets";
import LimitRate from "../../middlewares/rateLimiter";
import Error from '../../middlewares/errorHandler'
import updateUserInterface from "./interfaces/updateUserInterface";
import { mongoose } from "@typegoose/typegoose";

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
    findById: [`read_all_${resolverName}s`, 'read_owned'],
    readAll: [`read_all_${resolverName}s`, 'read_owned'],
    deleteById: [`delete_all_${resolverName}s`]
  }
})

@Resolver(() => User)
export default class userResolvers extends CRUDUser {
  @Mutation(() => User)
  @Authorized({ permissions: 'create_users' })
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

  @Mutation(() => User)
  @Authorized({ permissions: ['update_all_users', 'update_owned'] })
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
      } else if (!newPermissions.length && newPermissions !== undefined) {
        await userModel.findOneAndUpdate(filter, { $set: { permissions: [] } })
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
          { _id: { $in: role!.permissions } },
          { _id: { $in: root.permissions } }
        ]
      })

      return permissions
    } catch ({ message, code }) {
      throw new Error(message, code)
    }
  }
}
