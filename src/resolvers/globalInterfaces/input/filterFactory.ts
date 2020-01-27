import { InputType, Field, EnumResolver } from "type-graphql";
import { intOrStringScalar } from "../../../utils/reusableSnippets/customScalars";

export default function createDynamicFilterType(allowedSearchCriterias: any, prefix: string) {
  @InputType(`${prefix}Filter`)
  class Filter {
    @Field(() => allowedSearchCriterias, { nullable: false })
    field: EnumResolver
  
    @Field(() => intOrStringScalar, { nullable: false })
    value: string | number
  }
  return Filter;
}