import { GraphQLScalarType, Kind } from "graphql";

export const StringOrArrayOfStrings = new GraphQLScalarType({
  name: "StringOrArrayOfStrings",
  description: "A custom scalar that accepts a single string value or an array of strings",
  parseValue(value: string | number) {
    return value; // value from the client input variables
  },
  serialize(value: string | number) {
    return value; // value sent to the client
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return ast.value
    } else if (ast.kind === Kind.LIST) {
      return ast.values
    }
    return undefined
  }
});
