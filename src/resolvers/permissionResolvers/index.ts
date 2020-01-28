import { Resolver, Mutation, Args, Authorized } from "type-graphql";
import { Permission, permissionModel } from "../../models/permission";
import createPermissionInterface from "./interfaces/createPermissionInterface";
import createCRUDResolver from "../globalResolvers/crudBaseResolver"
import { createFilters } from "../../utils/reusableSnippets";

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
    findById: [`read_all_${resolverName}s`, `read_${resolverName}s`],
    readAll: [`read_all_${resolverName}s`, `read_${resolverName}s`],
    deleteById: [`delete_${resolverName}s`]
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
  
}
