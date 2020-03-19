import { ArgsType, Field } from "type-graphql";

@ArgsType()
export default class passwordResetInterface {
  @Field({ nullable: false })
  password: string

  @Field({ nullable: false })
  confirmPassword: string

  @Field({ nullable: false })
  hash: string
}