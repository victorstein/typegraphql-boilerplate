import { Resolver, Mutation, Args, registerEnumType, Authorized } from "type-graphql";
import { Permission, permissionModel } from "../../models/permission";
import createPermissionInterface from "./interfaces/createPermissionInterface";
import baseCRUDResolver from "../globalResolvers/crudBaseResolver"
import { createFilters } from "../../utils/reusableSnippets";

// Define the prefix of the resolvers
const ResolverName = 'permission'

// Create an enum based on the model indexes
const modelIndexes = createFilters(permissionModel)

// Initialize base CRUD factory
const CRUDPermission = baseCRUDResolver({
  prefix: ResolverName,
  returnType: Permission,
  model: permissionModel,
  allowedSearchCriterias: modelIndexes,
  permissions: {
    findById: ['readAllPermissions', 'readPermissions'],
    readAll: ['readAllPermissions', 'readPermissions'],
    deleteById: ['deletePermission']
  }
})

// Register the enum type with graphql
registerEnumType(modelIndexes, { name: `${ResolverName}Type` })

@Resolver(() => Permission)
export default class permissionResolvers extends CRUDPermission {

  @Mutation(() => Permission)
  @Authorized(['createPermissions'])
  async createPermission (
    @Args() { name, description }: createPermissionInterface
  ) {
    return permissionModel.create({
      name,
      description
    })
  }
  
}
