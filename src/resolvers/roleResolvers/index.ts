import { Mutation, Resolver, Args, Query } from "type-graphql"
import { Role, roleModel } from "../../models/role"
import { ApolloError } from "apollo-server-express"
import createRoleInterface from './interfaces/createRoleInterface'
import byIdInterface from '../globalInterfaces/input/byIdInterface'

@Resolver(() => Role)
export default class roleResolvers {
  @Query(() => Role)
  async roleById (
    @Args() { id }: byIdInterface
  ): Promise<Role> {
    try {
      // Get the role
      const role = await roleModel.findById(id)

      // Return error if not founc
      if (!role) { throw new Error('Unable to find a role with the provided id') }

      // return the role if found
      return role
    } catch (e) {
      throw new Error(e)
    }
  }

  @Mutation(() => Role)
  createRole (
    @Args() { name, permissions }: createRoleInterface
  ): Promise<Role> {
    try {
      return roleModel.create({
        name,
        permissions
      })
    } catch (e) {
      throw new ApolloError(e)
    }
  }

  @Mutation(() => Boolean)
  async deleteRole (
    @Args() { id }: byIdInterface
  ): Promise<boolean> {
    try {
      // Find the role to be deleted
      const role = await roleModel.findById(id)

      // If no role return error
      if (!role) { throw new Error('The provided role is invalid') }

      // If the role exists proceed to delete it
      await role.remove()

      // return true upon successful deleteion
      return true
    } catch (e) {
      throw new ApolloError(e)
    }
  }
}