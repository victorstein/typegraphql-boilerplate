import { Resolver, Mutation, Args } from "type-graphql";
import { Permission, permissionModel } from "src/models/permission";
import createPermissionInterface from "./interfaces/createPermissionInterface";

@Resolver(() => Permission)
export default class permissionResolvers {
  
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
