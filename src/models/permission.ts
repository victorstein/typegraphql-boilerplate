import { ObjectType, Field, ID } from "type-graphql";
import { prop, getModelForClass, arrayProp, Ref, plugin, modelOptions } from "@typegoose/typegoose";
import { Role } from "./role";
import paginate from '../utils/reusableSnippets/pagination'
import { Base } from "./base";

@ObjectType()
@modelOptions({ schemaOptions: { timestamps: true } })
@plugin(paginate)
export class Permission extends Base {
  @Field(() => ID)
  id: string

  @prop({ required: true, text: true })
  @Field({ nullable: false })
  name: string

  @arrayProp({ itemsRef: 'Role' })
  usedByRole: Ref<Role>[]

  @prop({ required: false, text: true })
  @Field({ nullable: true })
  description: string
}

export const permissionModel = getModelForClass(Permission)