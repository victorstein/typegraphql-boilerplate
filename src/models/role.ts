import { ObjectType, Field, ID } from "type-graphql";
import { modelOptions, prop, arrayProp, getModelForClass, Ref, pre } from "@typegoose/typegoose";
import { Permission } from "./permission";

// ENSURE THAT WE ARE NOT DELETEING BASE ROLES
@pre<Role>('remove', function(next) {
  // Check if this is one of the base roles
  if (this.usedFor) {
    console.log('happening')
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

  @prop({ required: false, enum: [undefined, 'adminRole', 'baseRole'] })
  @Field({ nullable: true })
  usedFor: string

  @arrayProp({ itemsRef: 'Permission' })
  @Field(() => [Permission])
  permissions: Ref<Permission>[]
}

export const roleModel = getModelForClass(Role)