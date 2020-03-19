import { ArgsType, Field } from "type-graphql";
import { IsMongoId } from "class-validator";

@ArgsType()
export default class byIdInterface {
  @Field({ nullable: false })
  @IsMongoId({ message: 'The provided ID is invalid' })
  id: string
}