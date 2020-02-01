import jwt from 'jsonwebtoken'
import 'dotenv/config'
import { userModel } from "../models/user"
import { permissionModel } from "../models/permission"
import Error from './errorHandler'
import { roleModel } from "../models/role"

var contextService = require('request-context');

type options = {
  strict: boolean
}

const authChecker:any = async (
  { context }: any,
  permissions: string[],
  options: options = {
    strict: true
  }
): Promise<boolean> => {
  try {
    const { strict } = options

    const userCount = await userModel.estimatedDocumentCount()
    
    if (userCount < 1) { return true }

    // Get headers from context
    let headers = context.req.headers

    // Check that the headers contain the Authorization header
    if (!headers.authorization) { throw new Error('Missing Authorization Header', 401) }

    // Get the token from the authorization header
    const token = headers.authorization.split(" ")[1]

    // Validate the token
    const payload:any = jwt.verify(token, process.env.TOKEN_SECRET!)

    // Locate the user in the DB
    const user = await userModel.findById(payload.id, { password: 0 })

    // Return and error if no user found
    if (!user) { throw new Error('Insufficient permissions to perform this action', 401) }

    // Insert the user in the express context
    contextService.set('req:user', user)

    // user permissions
    let userPermissions: string[] = []

    // Check if there is any role requirement
    if(permissions.length) {
      // Get the role permissions
      let rolePermissions = await roleModel.findById(user.role, { permissions: 1 })

      // Get all the paremissions associated to the role and any additional permissions
      let allPermissions = await permissionModel.find({
        $or: [
          { _id: { $in: rolePermissions?.permissions } },
          { _id: { $in: user.permissions } }
        ]
      }, { _id: 0, name: 1 })
      
      // transform the result in to a array of strings
      userPermissions = allPermissions.map((u: any) => u.name)

      if (strict) {
        // Check if the required permission exits in the user permissions
        if (!permissions.every((u: string) => userPermissions.includes(u))) {
          throw new Error('Insufficient permissions for this query', 403)
        }  
      } else {
        // Check if the required permission exits in the user permissions
        if (!permissions.some((u: string) => userPermissions.includes(u))) {
          throw new Error('Insufficient permissions for this query', 403)
        }  
      }
    }

    // Once permission were verified proceed to check token version
    if (user.tokenVersion !== payload.tokenVersion) {
      throw new Error('Invalid token', 401)
    }

    // Add the user to context
    context.user = user
    context.permissions = userPermissions
    return true
  } catch ({ message, code }) {
    if (message === 'jwt expired') { code = 401 }
    throw new Error(message, code)
  }
}

export default authChecker