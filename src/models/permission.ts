import { ObjectType, Field, ID } from "type-graphql";
import { prop, modelOptions, getModelForClass, arrayProp, Ref, plugin } from "@typegoose/typegoose";
import { Role } from "./role";
import paginate from '../utils/reusableSnippets/pagination'

@ObjectType()
@modelOptions({ schemaOptions: { timestamps: true } })
@plugin(paginate)
export class Permission {
  @Field(() => ID)
  id: string

  @prop({ required: true })
  @Field({ nullable: false })
  name: string

  @arrayProp({ itemsRef: 'Role' })
  usedByRole: Ref<Role>[]

  @prop({ required: false })
  @Field({ nullable: true })
  description: string
}

export const permissionModel = getModelForClass(Permission)