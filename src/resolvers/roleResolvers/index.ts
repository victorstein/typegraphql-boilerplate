import { Mutation, Resolver, Args, Authorized } from "type-graphql"
import { Role, roleModel } from "../../models/role"
import { ApolloError } from "apollo-server-express"
import createRoleInterface from './interfaces/createRoleInterface'
import createCRUDResolver from "../globalResolvers/crudBaseResolver"
import { createFilters } from "../../utils/reusableSnippets"

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
    } catch (e) {
      throw new ApolloError(e.message, e.code)
    }
  }
}