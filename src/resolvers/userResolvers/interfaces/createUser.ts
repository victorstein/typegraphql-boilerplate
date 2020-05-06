import { ArgsType, Field } from "type-graphql";
import { IsEmail, Length } from "class-validator";
import { IsSameAs } from "../../../utils/customValidators/validators";

@ArgsType()
export default class createUserInterface {
  @Field({ nullable: false })
  @IsEmail(undefined, { message: 'The provided email is invalid' })
  email: string

  @Field({ nullable: false })
  @Length(8, undefined, { message: "The password must be at least 8 characters long" })
  password: string

  @Field({ nullable: false })
  @IsSameAs('password', { message: 'The password and confirm password fields do not match' })
  confirmPassword: string

  @Field({ nullable: false })
  firstName: string

  @Field({ nullable: false })
  lastName: string
}