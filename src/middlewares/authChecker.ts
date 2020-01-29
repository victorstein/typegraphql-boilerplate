import { AuthChecker } from "type-graphql"
import { ApolloError } from "apollo-server-express"
import jwt from 'jsonwebtoken'
import 'dotenv/config'
import { userModel } from "../models/user"
import { permissionModel } from "../models/permission"
import Error from './errorHandler'

var contextService = require('request-context');

const authChecker:AuthChecker<any> = async ({ context }, permissions): Promise<boolean> => {
  try {
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

    // Stablish default user permissions
    let userPermissions: string[] = []

    // Check if there is any role requirement
    if(permissions.length) {
      // Get all the paremissions associated to the role and any additional permissions
      let allPermissions = await permissionModel.find({
        $or: [
          { usedByRole: user.role },
          { _id: { $in: user.permissions } }
        ]
      }, { _id: 0, name: 1 })
      
      // transform the result in to a array of strings
      userPermissions = allPermissions.map((u: any) => u.name)

      // Check if the required permission exits in the user permissions
      if (!permissions.some((u: string) => userPermissions.includes(u))) {
        throw new Error('Insufficient permissions for this query', 403)
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
  } catch (e) {
    throw new ApolloError(e.message, e.code)
  }
}

export default authChecker