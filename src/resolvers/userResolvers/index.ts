import { Resolver, Query } from "type-graphql";
import { User } from "../../models/user";

@Resolver(() => User)
export default class userResolvers {
  @Query(() => String)
  hello(): string {
    return 'Hello'
  }
}
