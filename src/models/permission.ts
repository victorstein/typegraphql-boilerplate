import { ObjectType, Field, ID } from "type-graphql";
import { prop, getModelForClass, plugin, modelOptions, pre } from "@typegoose/typegoose";
import paginate from '../utils/reusableSnippets/pagination'
import { Base } from "./base";
import { userModel } from "./user";
import { roleModel } from "./role";

@pre<Permission>('remove', async function (next) {
  // Remove the permission from all the users
  await userModel.updateMany({ permissions: { $in: this._id } }, { $pull: this._id })

  // Remove the permission from all the roles
  await roleModel.updateMany({ permissions: { $in: this._id } }, { $pull: this._id })

  next()
})

@ObjectType()
@modelOptions({ schemaOptions: { timestamps: true } })
@plugin(paginate)
export class Permission extends Base {
  @Field(() => ID)
  id: string

  @prop({ required: true, text: true, index: true })
  @Field({ nullable: false })
  name: string

  @prop({ required: false, text: true })
  @Field({ nullable: true })
  description: string
}

export const permissionModel = getModelForClass(Permission)