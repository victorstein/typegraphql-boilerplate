import { Field, ArgsType, ClassType } from "type-graphql";
import { IsOptional, Min, Max } from "class-validator";

export default function createDynamicPaginationInterface(
  Filter?: ClassType<any> | null,
  Sort?: ClassType<any> | null
  ): ClassType<any> {
  @ArgsType()
  class unFilteredUnSoretedPginationInterface {
    @Field({ nullable: true, defaultValue: 10 })
    @IsOptional()
    @Min(1, { message: 'The per page param must be between 1 and 25' })
    @Max(25, { message: 'The per page param must be between 1 and 25' })
    perPage: number

    @Field({ nullable: true, defaultValue: 1 })
    page: number
  }

  if (Filter && !Sort) {
    type Filter = InstanceType<typeof Filter>;

    @ArgsType()
    class filteredPaginationInterface extends unFilteredUnSoretedPginationInterface {
      @Field(() => [Filter], { nullable: true, defaultValue: [] })
      filters: Filter[]
    }
    return filteredPaginationInterface
  }

  if (Sort && !Filter) {
    type Sort = InstanceType<typeof Sort>;

    @ArgsType()
    class sortPaginationInterface extends unFilteredUnSoretedPginationInterface {
      @Field(() => [Sort], { nullable: true, defaultValue: [] })
      sort: Sort[]
    }
    return sortPaginationInterface
  }

  if (Sort && Filter) {
    type Sort = InstanceType<typeof Sort>;
    type Filter = InstanceType<typeof Filter>;
    
    @ArgsType()
    class sortAndFilterPaginationInterface extends unFilteredUnSoretedPginationInterface {
      @Field(() => [Sort], { nullable: true, defaultValue: [] })
      sort: Sort[]

      @Field(() => [Filter], { nullable: true, defaultValue: [] })
      filters: Filter[]
    }

    return sortAndFilterPaginationInterface
  }

  return unFilteredUnSoretedPginationInterface
}