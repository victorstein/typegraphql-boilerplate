import { ObjectType, Field } from "type-graphql";

@ObjectType()
export default class Token {
  @Field(() => String, { nullable: false })
  token: string

  @Field(() => String, { nullable: false })
  refreshToken: string
}