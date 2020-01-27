import { User, userModel } from "../../models/user"
import { registerEnumType } from "type-graphql"
import { Model } from "mongoose"

interface createUser {
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  confirmPassword: string
}

export const createUser = (
  { email, password, firstName, lastName, confirmPassword }: createUser
  ): Promise<User> => {
  return new Promise(async (resolve, reject) => {
    try {
      // Check if the user exists in the DB
      const user = await userModel.findOne({ email })

      // Throw error if user already exists
      if (user) { throw new Error('Unable to process your request with the provided email') }

      // if user does not exist proceed to chech that the passwords match
      if (password !== confirmPassword) {
        throw new Error('The passwords do not match')
      }

      // If the passwords match proceed to create the user
      const newUser = await userModel.create({
        firstName,
        lastName,
        password,
        email
      })

      resolve(newUser)
    } catch(e) {
      reject(e)
    }
  })
}

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
  // Get all the indexes from the model to create filterable enum
  const indexes = model.schema.indexes().reduce((x: any, u: any) => {
    x[Object.keys(u[0])[0].toUpperCase()] = Object.keys(u[0])[0]
    return x
  }, {})
  
  // Register the enum type with graphql
  registerEnumType(indexes, { name: `${resolverName}FilterType` })

  return indexes
}

export const capitalize = (s: string) => {
  if (typeof s !== 'string') return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
}
