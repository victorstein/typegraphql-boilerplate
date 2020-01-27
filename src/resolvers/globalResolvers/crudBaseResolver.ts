import { ClassType, Resolver, Query, Args, Mutation, Authorized, EnumResolver, FieldResolver, Root, Ctx } from "type-graphql";
import byIdInterface from "../globalInterfaces/input/byIdInterface";
import { ApolloError } from "apollo-server-express";
import { userModel, User } from "../../models/user";
import { capitalize } from "../../utils/reusableSnippets";
import createDynamicFilterType from "../globalInterfaces/input/filterFactory";
import createDynamicPaginationInterface from "../globalInterfaces/input/paginationFactory";
import createPaginationOutput from "../globalInterfaces/output/pagintationOutput";

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
  allowedSortCriterias: EnumResolver
  permissions: permissionType
}

function createCRUDResolver<T extends ClassType>({
  prefix,
  returnType,
  model,
  allowedSearchCriterias,
  allowedSortCriterias,
  permissions
}: createCRUD) {
  console.log(allowedSortCriterias)
  // Lowercase the prefix for consistency
  prefix = prefix.toLowerCase()

  // Lowercase all permissions
  permissions = Object.entries(permissions).reduce((x: any, u:any) => {
    x[u[0]] = u[1].map((u: string) => u.toLowerCase())
    return x
  }, {})

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
  const paginationOutput = createPaginationOutput(prefix, returnType)
  type paginationOutput = InstanceType<typeof paginationOutput>;

  @Resolver(() => returnType, { isAbstract: true })
  abstract class CRUDBaseResolver {

    @Query(() => returnType, { name: `${prefix}ById` })
    @Authorized(findById)
    async findById(
      @Args() { id }: byIdInterface,
      @Ctx() { permissions, user }: any
    ): Promise<T[]> {
      try {
        const filters: any = { _id: id }

        // Check if the user is allowed to see the entity
        if (!permissions.includes(`read_all_${prefix}s`)) {
          filters.createdBy = user._id
        }

        // Get the data
        const entity = await model.findOne(filters)
  
        // Return error if not found
        if (!entity) { throw new Error(`Unable to find a ${prefix} with the provided id`) }

        return entity
      } catch (e) {
        throw new ApolloError(e)
      }
    }

    @Query(() => paginationOutput, { name: `${prefix}s`, nullable: true })
    @Authorized(readAll)
    readAll (
      @Args() { perPage, page, filters = {} }: paginationInterface,
      @Ctx() { permissions, user }: any
    ): paginationOutput {
      try {
        // Check if the user is allowed to see the entity
        if (!permissions.includes(`read_all_${prefix}s`)) {
          // Add filtering to the DB request
          filters.createdBy = { 'createdBy': user._id }
        }

        // If the user is not allowed to see all entities
        // Check if the user created the entity
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

    @FieldResolver(() => User, { name: 'createdBy' })
    async createdBy (
      @Root() root: any
    ) {
      return userModel.findById(root.createdBy)
    }

    @FieldResolver(() => User, { name: 'lastUpdatedBy' })
    async lastUpdatedBy (
      @Root() root: any
    ) {
      return userModel.findById(root.lastUpdatedBy)
    }

  }

  return CRUDBaseResolver;
}

export default createCRUDResolver