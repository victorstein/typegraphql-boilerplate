import { GraphQLScalarType, Kind } from "graphql";

export const intOrStringScalar = new GraphQLScalarType({
  name: "IntOrStr",
  description: "A custom scalar that accepts int or string values",
  parseValue(value: string | number) {
    return value // value from the client input variables
  },
  serialize(value: string | number) {
    return value; // value sent to the client
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING || ast.kind === Kind.INT) {
      return ast.value;
    }
    return null;
  },
});
