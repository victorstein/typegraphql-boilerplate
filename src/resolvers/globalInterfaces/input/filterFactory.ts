import { InputType, Field, EnumResolver, registerEnumType } from "type-graphql";
import { intOrStringScalar } from "../../../utils/reusableSnippets/customScalars";

enum direction {
  ASCENDING = 1,
  DESCENDING = -1
}

registerEnumType(direction, { name: 'direction' })

export function createDynamicFilterType(
  allowedSearchCriterias: any,
  prefix: string
) {
    @InputType(`${prefix}Filter`)
    class Filter {
      @Field(() => allowedSearchCriterias, { nullable: false })
      field: EnumResolver
    
      @Field(() => intOrStringScalar, { nullable: false })
      value: string | number
    }

    return Filter
}

export function createDynamicSortType(
  allowedSearchCriterias: any,
  prefix: string
) {
  @InputType(`${prefix}Sort`)
    class Sort {
      @Field(() => allowedSearchCriterias, { nullable: false })
      field: EnumResolver
    
      @Field(() => direction, { nullable: false })
      direction: direction
    }

    return Sort
}