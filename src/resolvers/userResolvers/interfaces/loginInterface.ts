import { ArgsType, Field } from "type-graphql";
import { IsEmail } from "class-validator";

@ArgsType()
export default class loginInterface {
  @Field({ nullable: false })
  @IsEmail(undefined, { message: 'The provided email is invalid' })
  email: string

  @Field({ nullable: false })
  password: string
}