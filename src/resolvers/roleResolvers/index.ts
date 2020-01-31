import { Mutation, Resolver, Args, Authorized, Ctx } from "type-graphql"
import { Role, roleModel } from "../../models/role"
import createRoleInterface from './interfaces/createRoleInterface'
import createCRUDResolver from "../globalResolvers/crudBaseResolver"
import { createFilters } from "../../utils/reusableSnippets"
import Error from '../../middlewares/errorHandler'
import updateRoleInterface from "./interfaces/updateRoleInterface"
import { permissionModel } from "../../models/permission"
import { mongoose } from "@typegoose/typegoose"

// Define the prefix of the resolvers
const resolverName = 'Role'

// Create an enum based on the model indexes
const { textIndexes, regularIndexes } = createFilters(roleModel, resolverName)

// Initialize base CRUD factory
const CRUDRole = createCRUDResolver({
  prefix: resolverName,
  returnType: Role,
  model: roleModel,
  allowedSearchCriterias: textIndexes,
  allowedSortCriterias: regularIndexes,
  permissions: {
    findById: [`read_all_${resolverName}s`, `read_${resolverName}s`],
    readAll: [`read_all_${resolverName}s`, `read_${resolverName}s`],
    deleteById: [`delete_${resolverName}s`]
  }
})

@Resolver(() => Role)
export default class roleResolvers extends CRUDRole {
  @Mutation(() => Role)
  @Authorized(['create_roles'])
  createRole (
    @Args() { name, permissions }: createRoleInterface
  ): Promise<Role> {
    try {
      return roleModel.create({
        name,
        permissions
      })
    } catch ({ message, code }) {
      throw new Error(message, code)
    }
  }

  @Mutation(() => Role)
  @Authorized(['update_roles', 'update_all_roles'])
  async updateRole (
    @Args() { id, name, description, newPermissions }: updateRoleInterface,
    @Ctx() { permissions, user }: any
  ): Promise<Role> {
    try {
      // create a filter to look for the role and an update object
      const filter: any = { id }
      const update: any = {}

      // If the petitioner doesnt have the update all permission search if the user created the permission
      if (!permissions.includes('update_all_roles')) {
        filter.createdBy = user._id
      }

      // Locate the role
      const role = await roleModel.findOne(filter)

      // Return an error if no role was found
      if (!role) { throw new Error('Unable to find a role with the provided id', 400) }

      // Update the corresponding fields
      if (name) { update.name = name }
      if (description) { update.description = description }

      // Check if there are any permissions to be added
      if (newPermissions.length) {
        const foundPermissions = await permissionModel.find({ _id: { $in: newPermissions } }, { _id: 1 })

        // If a permission is not found return error
        if (foundPermissions.length !== newPermissions.length) {
          throw new Error('You provided one or more invalid permission', 400)
        }

        // Inset the data in the permissions
        update.permissions = newPermissions.map(u => mongoose.Types.ObjectId(u))
      }

      // set the fields
      role.set(update)

      // save and return the role witht he corresponding changes
      return role.save()
    } catch ({ message, code }) {
      throw new Error(message, code)
    }
  }
}