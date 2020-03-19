import { InputType, Field, EnumResolver, registerEnumType } from "type-graphql";
import { IsDate } from "class-validator";
import { IsBefore } from "../../../utils/customValidators/validators";
import { StringOrArrayOfStrings } from "../../../utils/reusableSnippets/customScalars";

enum direction {
  ASCENDING = 1,
  DESCENDING = -1
}

registerEnumType(direction, { name: 'direction' })

const createUsableEnums = (filterCriterias: any) => {
  return Object.entries(filterCriterias.types).reduce((x:any, u:any) => {
    switch (u[1]) {
      case 'objectid':
        x.id = { ...x.id, [u[0]]: filterCriterias.enum[u[0]] }
        break
      case 'string':
        x.string = { ...x.string, [u[0]]: filterCriterias.enum[u[0]] }
        break
      case 'boolean':
        x.boolean = { ...x.boolean, [u[0]]: filterCriterias.enum[u[0]] }
        break
      case 'date':
        x.date = { ...x.date, [u[0]]: filterCriterias.enum[u[0]] }
        break
    }
    return x
  }, {})
}

function buildRegularInterfaces(usableEnum: any, prefix: string, by: string) {
  const validEnum = Boolean(usableEnum) ? usableEnum : { NOT_ALLOWED: 'NOT_ALLOWED' }

  // Define output type
  const getOutputType = (by: string) => {
    switch (by) {
      case 'Condition':
        return Boolean
      case 'Id':
        return StringOrArrayOfStrings
      default:
        return String
    }
  }  

  // Register the enum
  registerEnumType(validEnum, { name: `${prefix}by${by}Enum` })

  if (Boolean(usableEnum)) {
    @InputType(`${prefix}By${by}Filter`)
    class byId {
      @Field(() => validEnum, { nullable: false })
      field: EnumResolver
    
      @Field(() => getOutputType(by), { nullable: false })
      value: string | boolean
    }
    
    return [byId]
  }
  
  return validEnum
}

function buildDateInterfaces (usableEnum: any, prefix: string) {
  // Register the enum
  const validEnum = Boolean(usableEnum) ? usableEnum : { NOT_ALLOWED: 'NOT_ALLOWED' }
  registerEnumType(validEnum, { name: `${prefix}BydateEnum` })

  if (Boolean(usableEnum)) {
    @InputType(`${prefix}ByDateFilter`)
    class byDate {
      @Field(() => validEnum, { nullable: false })
      field: EnumResolver
    
      @Field(() => Date, { nullable: false })
      @IsDate({ message: "The provided date is invalid" })
      @IsBefore({ message: "The parameter FROM must contain a date prior to the one in the parameter TO" })
      from: Date
  
      @Field(() => Date, { nullable: false })
      @IsDate({ message: "The provided date is invalid" })
      to: Date
    }

    return [byDate]
  } 
  
  return validEnum
}

export function createDynamicFilterType (
  allowedSearchCriterias: any,
  prefix: string
) {
  const usableEnums = createUsableEnums(allowedSearchCriterias)

  // Create enums and corresponding types
  const idEnums = buildRegularInterfaces(usableEnums.id, prefix, 'Id')
  const booleanEnums = buildRegularInterfaces(usableEnums.boolean, prefix, 'Condition')
  const stringEnums = buildRegularInterfaces(usableEnums.string, prefix, 'Text')
  const dateEnums = buildDateInterfaces(usableEnums.date, prefix)

  // Create full Filter
  @InputType(`${prefix}Filter`)
  class Filter {
    @Field(() => idEnums, { nullable: true })
    byId: any
    
    @Field(() => booleanEnums, { nullable: true })
    byCondition: any

    @Field(() => stringEnums, { nullable: true })
    byText: any

    @Field(() => dateEnums, { nullable: true })
    byDate: any
  }

  return Filter
}

export function createDynamicSortType(
  allowedSortCriterias: any,
  prefix: string
) {
    @InputType(`${prefix}Sort`)
    class Sort {
      @Field(() => allowedSortCriterias, { nullable: false })
      field: EnumResolver
    
      @Field(() => direction, { nullable: false })
      direction: direction
    }

    return Sort
}