import { ArgsType, Field } from "type-graphql";
import { IsMongoId } from "class-validator";
import { areMongoIds } from "../../../utils/customValidators/validators";

@ArgsType()
export default class updateUserInterface {
  @Field({ nullable: true })
  id: string
  
  @Field({ nullable: true })
  firstName: string

  @Field({ nullable: true })
  lastName: string

  @Field({ nullable: true })
  @IsMongoId({ message: 'The provided role Id is invalid' })
  role: string

  @Field(() => [String], { nullable: true })
  @areMongoIds({ message: 'One or more of the provided permissions Id is invalid' })
  newPermissions: string[]
}