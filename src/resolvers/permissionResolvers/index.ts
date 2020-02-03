import { Resolver, Mutation, Args, Authorized, Ctx } from "type-graphql";
import { Permission, permissionModel } from "../../models/permission";
import createPermissionInterface from "./interfaces/createPermissionInterface";
import createCRUDResolver from "../globalResolvers/crudBaseResolver"
import { createFilters } from "../../utils/reusableSnippets";
import Error from '../../middlewares/errorHandler'
import updatePermissionsInterface from "./interfaces/updatePermissionsInterface";

// Define the prefix of the resolvers
const resolverName = 'Permission'

// Create an enum based on the model indexes
const { textIndexes, regularIndexes } = createFilters(permissionModel, resolverName)

// Initialize base CRUD factory
const CRUDPermission = createCRUDResolver({
  prefix: resolverName,
  returnType: Permission,
  model: permissionModel,
  allowedSearchCriterias: textIndexes,
  allowedSortCriterias: regularIndexes,
  permissions: {
    findById: [`read_all_${resolverName}s`, 'read_owned'],
    readAll: [`read_all_${resolverName}s`, 'read_owned'],
    deleteById: [`delete_all_${resolverName}s`, 'delete_owned']
  }
})

@Resolver(() => Permission)
export default class permissionResolvers extends CRUDPermission {

  @Mutation(() => Permission)
  @Authorized(['create_permissions'])
  async createPermission (
    @Args() { name, description }: createPermissionInterface
  ) {
    return permissionModel.create({
      name,
      description
    })
  }
 
  @Mutation(() => Permission)
  @Authorized(['update_all_permissions'])
  async updatePermission (
    @Args() { id, name, description }: updatePermissionsInterface,
    @Ctx() { permissions, user }: any
  ): Promise<Permission> {
    try {
      // create a filter to look for the permission and an update object
      const filter: any = { _id: id }
      const update: any = {}

      // If the petitioner doesnt have the update all permission search if the user created the permission
      if (!permissions.includes('update_all_permissions')) {
        filter.createdBy = user._id
      }

      // Locate the permission
      const permission = await permissionModel.findOne(filter)

      // Return an error if no permission was found
      if (!permission) { throw new Error('Unable to find a permission with the provided id', 400) }

      // Update the corresponding fields
      if (name) { update.name = name }
      if (description) { update.description = description }

      // set the fields
      permission.set(update)

      // save and return the permission witht he corresponding changes
      return permission.save()
    } catch ({ message, code }) {
      throw new Error(message, code)
    }
  }
  
}
