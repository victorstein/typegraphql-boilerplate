import { getComplexity, simpleEstimator, fieldExtensionsEstimator } from "graphql-query-complexity";
import { separateOperations } from "graphql";

const queryComplexityEvaluator = (request: any, document: any, schema: any) => {
  const complexity = getComplexity({
    schema,
    query: request.operationName
      ? separateOperations(document)[request.operationName]
      : document,
    variables: request.variables,
    estimators: [
      fieldExtensionsEstimator(),
      simpleEstimator({ defaultComplexity: 1 }),
    ],
  });

  if (complexity > 20) {
    throw new Error(
      `The complexity of the query exeeds the server allowed quota`,
    );
  }
}

export default queryComplexityEvaluator