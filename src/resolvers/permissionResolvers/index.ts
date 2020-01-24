import { Resolver, Mutation, Args } from "type-graphql";
import { Permission, permissionModel } from "../../models/permission";
import createPermissionInterface from "./interfaces/createPermissionInterface";
import baseCRUDResolver from "../globalResolvers/crudBaseResolver"

const CRUDPermission = baseCRUDResolver(
  'permission',
  Permission,
  permissionModel
)

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
