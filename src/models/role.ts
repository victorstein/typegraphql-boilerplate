import { ObjectType, Field, ID } from "type-graphql";
import { prop, getModelForClass, pre, plugin, modelOptions } from "@typegoose/typegoose";
import paginate from '../utils/reusableSnippets/pagination'
import { Base } from "./base";

// ENSURE THAT WE ARE NOT DELETEING BASE ROLES
@pre<Role>('remove', function(next) {
  // Check if this is one of the base roles
  if (this.usedFor) {
    next(new Error('Unable to delete the requested role'))
  }

  next()
})

@ObjectType()
@modelOptions({ schemaOptions: { timestamps: true } })
@plugin(paginate)
export class Role extends Base {
  @Field(() => ID)
  id: string

  @prop({ required: true, text: true })
  @Field({ nullable: false })
  name: string

  @prop({ required: false })
  @Field({ nullable: true })
  description: string

  @prop({ required: false, enum: [undefined, 'adminRole', 'baseRole'] })
  usedFor: string
}

export const roleModel = getModelForClass(Role)