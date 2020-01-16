import { Resolver, Query, Authorized } from "type-graphql";
import { User } from "../../models/user";

@Resolver(() => User)
export default class userResolvers {
  @Query(() => String)
  @Authorized()
  hello(): string {
    return 'Hello'
  }
}
