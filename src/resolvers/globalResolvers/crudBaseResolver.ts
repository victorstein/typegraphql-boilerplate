import { ClassType, Resolver, Query, Args, Mutation, Authorized, EnumResolver, FieldResolver, Root, Ctx } from "type-graphql";
import byIdInterface from "../globalInterfaces/input/byIdInterface";
import { userModel, User } from "../../models/user";
import { capitalize } from "../../utils/reusableSnippets";
import { createDynamicFilterType, createDynamicSortType } from "../globalInterfaces/input/filterFactory";
import createDynamicPaginationInterface from "../globalInterfaces/input/paginationFactory";
import createPaginationOutput from "../globalInterfaces/output/pagintationOutput";
import { Validator } from "class-validator";
import Error from '../../middlewares/errorHandler'

const validator = new Validator()

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
  let Sort: ClassType | null = null

  // Create dynamic filter if needed
  if (Object.keys(allowedSearchCriterias).length) {
    Filter = createDynamicFilterType(allowedSearchCriterias, prefix)
  }

  // Create dynamic sorting if needed
  if (Object.keys(allowedSortCriterias).length) {
    Sort = createDynamicSortType(allowedSortCriterias, prefix)
  }

  // Create dynamic pagination interface
  const paginationInterface = createDynamicPaginationInterface(Filter, Sort)
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
        if (!entity) { throw new Error(`Unable to find a ${prefix} with the provided id`, 404) }

        return entity
      } catch ({ message, code }) {
        throw new Error(message, code)
      }
    }

    @Query(() => paginationOutput, { name: `${prefix}s`, nullable: true })
    @Authorized(readAll)
    readAll (
      @Args() { perPage, page, filters = [], sort = [] }: paginationInterface,
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
        return model.paginate(filters, { page, perPage, sort })
      } catch ({ message, code }) {
        throw new Error(message, code)
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
        if (!entity) { throw new Error(`The provided ${prefix} is invalid`, 404) }

        // If the role exists proceed to delete it
        await entity.remove()

        // return true upon successful deleteion
        return true
      } catch ({ message, code }) {
        throw new Error(message, code)
      }
    }

    @FieldResolver(() => User, { name: 'createdBy' })
    async createdBy (
      @Root() root: any
    ) {
      if (validator.isMongoId(root.createdBy)) {
        return userModel.findById(root.createdBy)
      }
      return root.createdBy
    }

    @FieldResolver(() => User, { name: 'lastUpdatedBy' })
    async lastUpdatedBy (
      @Root() root: any
    ) {
      if (validator.isMongoId(root.lastUpdatedBy)) {
        return userModel.findById(root.lastUpdatedBy)
      }
      return root.lastUpdatedBy
    }

  }

  return CRUDBaseResolver;
}

export default createCRUDResolver