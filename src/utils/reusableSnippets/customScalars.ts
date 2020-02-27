import { GraphQLScalarType, Kind } from "graphql";

export const intOrStringOrBoolScalar = new GraphQLScalarType({
  name: "IntOrStrOrBool",
  description: "A custom scalar that accepts int, string or boolean values",
  parseValue(value: string | number) {
    return value; // value from the client input variables
  },
  serialize(value: string | number) {
    return value; // value sent to the client
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING || ast.kind === Kind.INT || ast.kind === Kind.BOOLEAN) {
      return ast.value;
    }
    return undefined
  }
});
