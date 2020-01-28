import { ObjectType, Field } from "type-graphql"

export default function createPaginationOutput (prefix: string, returnType: any) {
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

  return paginationOutput
}