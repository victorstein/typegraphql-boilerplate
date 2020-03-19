import { ObjectType, Field } from "type-graphql";

@ObjectType()
class refreshToken {
  @Field({ nullable: false })
  createdAt: number

  @Field({ nullable: false })
  expiresAt: number
}

@ObjectType()
export default class Token {
  @Field(() => String, { nullable: false })
  token: string

  @Field(() => refreshToken, { nullable: false })
  refreshTokenExpiration: refreshToken

  @Field(() => String, { nullable: false })
  refreshToken: string
}