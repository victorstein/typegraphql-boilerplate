import { registerEnumType } from "type-graphql"
import { Model } from "mongoose"
import { Validator } from "class-validator";

export const legibleTime = (time: string) => {
  switch (true) {
    case time.includes('h'):
      return time.replace('h', ' hour(s)')
    case time.includes('w'):
      return time.replace('w', ' week(s)')
    case time.includes('d'):
      return time.replace('d', ' day(s)')
    default:
      return time
  }
}

export const createFilters = (model: Model<any, {}>, resolverName: string) => {
  const modelData: any = model.schema

  // Get all the text and regular indexes
  const indexes = Object.entries(modelData.paths).reduce((x: any, u: any) => {
    const { options } = u[1]

    // Check if the text index is present
    if (options.text) {
      // If so add it to the Filters
      x.textIndexes.types[u[0].toUpperCase()] = u[1].instance.toLowerCase()
      x.textIndexes.enum[u[0].toUpperCase()] = u[0]
    }
    // Check if the index is true
    if (options.index) {
      // If so add it to the sorting
      x.regularIndexes[u[0].toUpperCase()] = u[0]
    }

    // Check if the type of the property is array
    if (Array.isArray(options.type)) {
      // If its array then check for the indexes inside the array
      if (options.type[0].text) {
        // If so add it to the Filters
        x.textIndexes.types[u[0].toUpperCase()] = 'objectid'
        x.textIndexes.enum[u[0].toUpperCase()] = u[0]
      }
      // Check if the index is true
      if (options.type[0].index) {
        // If so add it to the sorting
        x.regularIndexes[u[0].toUpperCase()] = u[0]
      }
    }
    return x
  }, {
    textIndexes: {
      enum: {},
      types: {}
    },
    regularIndexes: {}
  })

  // Register regularIndexes enum type with graphql
  if (Object.keys(indexes.regularIndexes).length) {
    registerEnumType(indexes.regularIndexes, { name: `${resolverName}SortType` })
  }
  
  return indexes
}

export const capitalize = (s: string) => {
  if (typeof s !== 'string') return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export const isMongoId = (id: string) => {
  const validator = new Validator()
  return validator.isMongoId(id)
}

export const isObjectEmpty = (obj: any) => {
  return Object.keys(obj).length === 0
}

export const objectIsNotEmpty = (obj: any) => {
  return Object.keys(obj).length !== 0
}