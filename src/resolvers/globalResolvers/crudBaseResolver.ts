import { ClassType, Resolver, Query, Args, Mutation, ObjectType, Field, Authorized, InputType, EnumResolver, ArgsType } from "type-graphql";
import byIdInterface from "../globalInterfaces/input/byIdInterface";
import { ApolloError } from "apollo-server-express";
import { intOrStringScalar } from "../../utils/reusableSnippets/customScalars";
import { IsOptional, Min, Max } from "class-validator";

interface permissionType {
  findById: string[],
  readAll: string[],
  deleteById: string[]
}

function createCRUDResolver<T extends ClassType>(
  prefix: string,
  returnType: T,
  model: any,
  allowedSearchCriterias: EnumResolver,
  permissions: permissionType,
) {
  // Get all the permissions
  const {
    findById = [],
    readAll = [],
    deleteById = []
  } = permissions

  @InputType()
  class Filter {
    @Field(() => allowedSearchCriterias, { nullable: false })
    field: EnumResolver
  
    @Field(() => intOrStringScalar, { nullable: false })
    value: string | number
  }

  @ArgsType()
  class paginationInterface {
    @Field({ nullable: true, defaultValue: 10 })
    @IsOptional()
    @Min(1, { message: 'The per page param must be between 1 and 25' })
    @Max(25, { message: 'The per page param must be between 1 and 25' })
    perPage: number

    @Field({ nullable: true, defaultValue: 1 })
    page: number

    @Field(() => [Filter], { nullable: true })
    filters: Filter[]
  }

  @ObjectType()
  class paginationOutput {
    @Field(() => [returnType])
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

  @Resolver({ isAbstract: true })
  abstract class CRUDBaseResolver {

    @Query(() => returnType, { name: `${prefix}ById` })
    @Authorized(findById)
    async findById(@Args() { id }: byIdInterface ): Promise<T[]> {
      try {
        // Get the role
        const entity = await model.findById(id)
  
        // Return error if not founc
        if (!entity) { throw new Error(`Unable to find a ${prefix} with the provided id`) }
  
        // return the role if found
        return entity
      } catch (e) {
        throw new ApolloError(e)
      }
    }

    @Query(() => paginationOutput, { name: `${prefix}s`, nullable: true })
    @Authorized(readAll)
    readAll (
      @Args() { perPage, page, filters }: paginationInterface
    ): paginationOutput {
      try {
        // Pagiante the model
        return model.paginate(filters, { page, perPage })
      } catch (e) {
        throw new ApolloError(e)
      }
    }

    @Mutation(() => Boolean)
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

  }

  return CRUDBaseResolver;
}

export default createCRUDResolver