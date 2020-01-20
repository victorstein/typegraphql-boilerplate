import { ArgsType, Field } from "type-graphql";
import { nameNotTaken } from "../../../utils/customValidators/validators";

@ArgsType()
export default class createPermissionInterface {
  @Field({ nullable: false })
  @nameNotTaken('permission', { message: 'That permission name already exists' })
  name: string

  @Field({ nullable: true })
  description: string
}