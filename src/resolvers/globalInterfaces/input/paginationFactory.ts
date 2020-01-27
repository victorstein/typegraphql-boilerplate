import { Field, ArgsType, ClassType } from "type-graphql";
import { IsOptional, Min, Max } from "class-validator";

export default function createDynamicPaginationInterface(
  Filter?: ClassType<any> | null
  ): ClassType<any> {
  @ArgsType()
  class unFilteredPAginationInterface {
    @Field({ nullable: true, defaultValue: 10 })
    @IsOptional()
    @Min(1, { message: 'The per page param must be between 1 and 25' })
    @Max(25, { message: 'The per page param must be between 1 and 25' })
    perPage: number

    @Field({ nullable: true, defaultValue: 1 })
    page: number
  }

  if (!Filter) return unFilteredPAginationInterface

  type Filter = InstanceType<typeof Filter>;

  @ArgsType()
  class filteredPaginationInterface extends unFilteredPAginationInterface {
    @Field(() => [Filter], { nullable: true, defaultValue: [] })
    filters: Filter[]
  }

  return filteredPaginationInterface
}