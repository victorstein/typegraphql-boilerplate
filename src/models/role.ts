import { ObjectType, Field, ID } from "type-graphql";
import { modelOptions, prop, getModelForClass, pre } from "@typegoose/typegoose";

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
export class Role {
  @Field(() => ID)
  id: string

  @prop({ required: true })
  @Field({ nullable: false })
  name: string

  @prop({ required: false })
  @Field({ nullable: true })
  description: string

  @prop({ required: false, enum: [undefined, 'adminRole', 'baseRole'] })
  @Field({ nullable: true })
  usedFor: string
}

export const roleModel = getModelForClass(Role)