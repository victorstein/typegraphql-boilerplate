import { InputType, Field, EnumResolver, registerEnumType } from "type-graphql";
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
      case 'number':
        x.number = { ...x.number, [u[0]]: filterCriterias.enum[u[0]] }
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
    
      @Field(() => Date, { nullable: true })
      from: Date
  
      @Field(() => Date, { nullable: true })
      to: Date
    }

    return [byDate]
  } 
  
  return validEnum
}

function buildNumberInterface (usableEnum: any, prefix: string) {
  // Register the enum
  const validEnum = Boolean(usableEnum) ? usableEnum : { NOT_ALLOWED: 'NOT_ALLOWED' }
  registerEnumType(validEnum, { name: `${prefix}sByNumberEnum` })

  if (Boolean(usableEnum)) {
    @InputType(`${prefix}ByNumberFilter`)
    class byNum {
      @Field(() => validEnum, { nullable: false })
      field: EnumResolver
    
      @Field(() => Number, { nullable: true })
      equalTo: Number
  
      @Field(() => Number, { nullable: true })
      greaterThan: Number
        
      @Field(() => Number, { nullable: true })
      greaterOrEqualThan: Number
        
      @Field(() => Number, { nullable: true })
      lowerThan: Number
        
      @Field(() => Number, { nullable: true })
      lowerOrEqualThan: Number
    }

    return [byNum]
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
  const numberEnums = buildNumberInterface(usableEnums.number, prefix)
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

    @Field(() => numberEnums, { nullable: true })
    byNumber: any

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