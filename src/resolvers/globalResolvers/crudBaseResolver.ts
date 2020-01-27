import { ClassType, Resolver, Query, Args, Mutation, ObjectType, Field, Authorized, EnumResolver, FieldResolver, Root, Ctx } from "type-graphql";
import byIdInterface from "../globalInterfaces/input/byIdInterface";
import { ApolloError } from "apollo-server-express";
import { userModel, User } from "../../models/user";
import { capitalize } from "../../utils/reusableSnippets";
import createDynamicFilterType from "../globalInterfaces/input/filterFactory";
import createDynamicPaginationInterface from "../globalInterfaces/input/paginationFactory";

interface permissionType {
  findById: string[],
  readAll: string[],
  deleteById: string[]
}

interface createCRUD {
  prefix: string
  returnType: any
  model: any
  allowedSearchCriterias: EnumResolver
  permissions: permissionType
}

function createCRUDResolver<T extends ClassType>({
  prefix,
  returnType,
  model,
  allowedSearchCriterias,
  permissions
}: createCRUD) {
  // Lowercase the prefix for consistency
  prefix = prefix.toLowerCase()

  // Get all the permissions
  const {
    findById = [],
    readAll = [],
    deleteById = []
  } = permissions

  // declare the filter
  let Filter: ClassType | null = null

  // Create dynamic filter if needed
  if (Object.keys(allowedSearchCriterias).length) {
    Filter = createDynamicFilterType(allowedSearchCriterias, prefix)
  }

  // Create dynamic pagination interface
  const paginationInterface = createDynamicPaginationInterface(Filter)
  type paginationInterface = InstanceType<typeof paginationInterface>;

  // Dynamic output using the return type
  // TURN THIS INTO A FACTORY YOU LAZY MOFO
  @ObjectType(`${prefix}PaginationOutput`)
  class paginationOutput {
    @Field(() => [returnType], { nullable: true })
    docs: any[]
  
    @Field()
    total: number
  
    @Field()
    perPage: number
  
    @Field()
    page: number
  
    @Field()
    pages: number
  }

  @Resolver(() => returnType, { isAbstract: true })
  abstract class CRUDBaseResolver {

    @Query(() => returnType, { name: `${prefix}ById` })
    @Authorized(findById)
    async findById(
      @Args() { id }: byIdInterface,
      @Ctx() { permissions, user }: any
    ): Promise<T[]> {
      try {
        // Get the role
        const entity = await model.findById(id)
  
        // Return error if not found
        if (!entity) { throw new Error(`Unable to find a ${prefix} with the provided id`) }

        // Check if the user is allowed to see the entity
        if (permissions.includes(`read_all_${prefix}s`)) {
          return entity
        }
  
        // If the user is not allowed to see all entities
        // Check if the user created the entity
        if (entity.createdBy === user._id) {
          return entity
        }

        // return error if no criteria is met
        throw new Error('Insufficient permissions for this query')
      } catch (e) {
        throw new ApolloError(e)
      }
    }

    @Query(() => paginationOutput, { name: `${prefix}s`, nullable: true })
    @Authorized(readAll)
    readAll (
      @Args() { perPage, page, filters = {} }: paginationInterface
    ): paginationOutput {
      try {
        // Pagiante the model
        return model.paginate(filters, { page, perPage })
      } catch (e) {
        throw new ApolloError(e)
      }
    }

    @Mutation(() => Boolean, { name: `delete${capitalize(prefix)}ById` })
    @Authorized(deleteById)
    async deleteById (
      @Args() { id }: byIdInterface
    ): Promise<boolean> {
      try {
        // Find the role to be deleted
        const entity = await model.findById(id)

        // If no role return error
        if (!entity) { throw new Error(`The provided ${prefix} is invalid`) }

        // If the role exists proceed to delete it
        await entity.remove()

        // return true upon successful deleteion
        return true
      } catch (e) {
        throw new ApolloError(e)
      }
    }

    @FieldResolver(() => User)
    async createdBy (
      @Root() root: any
    ) {
      console.log(root)
      return userModel.findById(root.createdBy)
    }

    @FieldResolver(() => User)
    async lastUpdatedBy (
      @Root() root: any
    ) {
      return userModel.findById(root.lastUpdatedBy)
    }

  }

  return CRUDBaseResolver;
}

export default createCRUDResolver