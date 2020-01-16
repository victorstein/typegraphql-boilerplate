import { Mutation, Resolver, Args } from "type-graphql"
import { Role, roleModel } from "../../models/role"
import { ApolloError } from "apollo-server-express"
import createRoleInterface from './interfaces/createRoleInterface'
import deleteOneInterface from '../globalInterfaces/deleteOneInterface'

@Resolver(() => Role)
export default class roleResolvers {

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
      console.log(e)
      throw new ApolloError(e)
    }
  }

  @Mutation(() => Boolean)
  async deleteRole (
    @Args() { id }: deleteOneInterface
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
      console.log(e)
      throw new ApolloError(e)
    }
  }

  @Mutation(() => [Role], { nullable: true })
  async createDefaultRoles (): Promise<Role[] | null> {
    try {
      // Check if the adminRole and base role exist
      let defaultRoles = await roleModel.find({ usedFor: { '$in': ['adminRole', 'baseRole'] } }, { usedFor: 0 })

      // Create the default roles if they dont exist
      if (!defaultRoles.length) {
        defaultRoles = await roleModel.create([
          {
            name: 'Admin',
            usedFor: 'adminRole'
          },
          {
            name: 'User',
            usedFor: 'baseRole'
          },
        ])

        // Return the roles
        return defaultRoles
      }

      // return null as they exist
      return null
    } catch (e) {
      console.log(e)
      throw new ApolloError(e)
    }
  }
}