import { ApolloError } from "apollo-server-express"

const checkError = (errorCode: number = 500): string => {
  let error: string
  switch (errorCode) {
    case 403:
      error = 'UNAUTHORIZED'
      break
    case 401:
      error = 'UNAUTHENTICATED'
      break
    case 400:
      error = 'BAD_REQUEST'
      break
    case 404:
      error = 'NOT_FOUND'
      break
    case 429:
      error = 'TOO_MANY_REQUESTS'
      break
    case 413:
      error = 'QUERY_QUOTA_EXCEEDED'
      break
    default:
      error = 'INTERNAL_SERVER_ERROR'
  }

  return error
}

export default class ErrorHandler extends ApolloError {
  code: number | undefined
  constructor (message:string, code?:number) {
    super(message, checkError(code))
    this.code = code
    this.message = message
  }
}