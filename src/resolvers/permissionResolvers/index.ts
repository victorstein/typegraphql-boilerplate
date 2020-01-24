import { Resolver, Mutation, Args, registerEnumType } from "type-graphql";
import { Permission, permissionModel } from "../../models/permission";
import createPermissionInterface from "./interfaces/createPermissionInterface";
import baseCRUDResolver from "../globalResolvers/crudBaseResolver"

const ResolverName = 'permission'

// Register filter criterias
enum FilterType {
  NAME = "name",
  DESCRIPTION = "description"
}

console.log(permissionModel.schema.indexes())

// Initialize base CRUD factory
const CRUDPermission = baseCRUDResolver(
  ResolverName,
  Permission,
  permissionModel,
  FilterType,
  {
    findById: [],
    readAll: [],
    deleteById: []
  }
)

registerEnumType(FilterType, { name: `${ResolverName}Type` })

@Resolver(() => Permission)
export default class permissionResolvers extends CRUDPermission {

  @Mutation(() => Permission)
  async createPermission (
    @Args() { name, description }: createPermissionInterface
  ) {
    return permissionModel.create({
      name,
      description
    })
  }

  
}
