import { ArgsType, Field } from "type-graphql";
import { Permission } from "../../../models/permission";
import { nameNotTaken, areValidPermissions } from "../../../utils/customValidators/validators";

@ArgsType()
export default class createRoleInterface {
  @Field({ nullable: false })
  @nameNotTaken('role', { message: 'That role name already exists' })
  name: string

  @Field(() => [String], { nullable: true })
  @areValidPermissions({ message: 'One or more of the provided permissions is invalid' })
  permissions: Permission[]
}