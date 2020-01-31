import { ArgsType, Field } from "type-graphql";
import { IsMongoId } from "class-validator";

@ArgsType()
export default class updatePermissionsInterface {
  @Field({ nullable: false })
  @IsMongoId({ message: 'The provided permission Id is invalid' })
  id: string

  @Field({ nullable: true })
  name: string

  @Field({ nullable: true })
  description: string
}