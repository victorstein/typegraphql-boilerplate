import { ArgsType, Field } from "type-graphql";
import { IsEmail } from "class-validator";

@ArgsType()
export default class createUserInterface {
  @Field({ nullable: false })
  @IsEmail(undefined, { message: 'The provided email is invalid' })
  email: string

  @Field({ nullable: false })
  password: string

  @Field({ nullable: false })
  confirmPassword: string

  @Field({ nullable: false })
  firstName: string

  @Field({ nullable: false })
  lastName: string
}