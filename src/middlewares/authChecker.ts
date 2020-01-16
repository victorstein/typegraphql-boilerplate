import { AuthChecker } from "type-graphql"
import { AuthenticationError } from "apollo-server-express"
import jwt from 'jsonwebtoken'
import 'dotenv/config'
import { userModel } from "../models/user"

const authChecker:AuthChecker<any> = async ({ context }): Promise<boolean> => {
  try {
    // Get headers from context
    let headers = context.req.headers

    // Check that the headers contain the Authorization header
    if (!headers.authorization) { throw new Error('Missing Authorization Header') }

    // Get the token from the authorization header
    const token = headers.authorization.split(" ")[1]

    // Validate the token
    const payload:any = jwt.verify(token, process.env.TOKEN_SECRET!)

    // Locate the user in the DB
    const user = await userModel.findById(payload.id)

    // Return and error if no user found
    if (!user) { throw new Error('Insufficient permissions to perform this action') }

    // Check if there is any role requirement
    /* if(roles.length) {
      if (!roles.includes(user.role)) { throw new Error() }
    } */

    // Add the user to context
    context.user = user
    return true
  } catch (e) {
    console.log(e.message)
    if (e.message.includes('invalid signature')) {
      throw new AuthenticationError('Insufficient permissions to perform this action')
    }
    throw new AuthenticationError(e)
  }
}

export default authChecker