import { ArgsType, Field } from "type-graphql";
import { IsMongoId } from "class-validator";
import { areMongoIds } from "../../../utils/customValidators/validators";

@ArgsType()
export default class updateRoleInterface {
  @Field({ nullable: true })
  name: string

  @Field({ nullable: false })
  @IsMongoId({ message: 'The provided id is invalid' })
  id: string

  @Field({ nullable: true })
  description: string

  @Field(() => [String], { nullable: true })
  @areMongoIds({ message: 'One or more of the permissions id is invalid' })
  newPermissions: string[]
}