import { ObjectType } from "type-graphql";
import { prop, modelOptions, getModelForClass, Ref, arrayProp, pre } from '@typegoose/typegoose'
import { Field, ID } from 'type-graphql'
import { Role, roleModel } from "./role";
import { Permission } from "./permission";
import bcrypt from 'bcryptjs'
import mongoose from "mongoose";

@pre<User>('save', async function (next): Promise<void> {
  // Hash the password before saving
  this.password = await bcrypt.hash(this.password, 12)
  
  // Get the admin and base role
  const adminRole = await roleModel.findOne({ usedFor: 'adminRole' }, { id: 1 })
  const baseRole = await roleModel.findOne({ usedFor: 'baseRole' }, { id: 1 })

  // Check that these roles exists
  if (!adminRole || !baseRole) { throw new Error('Server Error') }

  // Assign the admin role if is the first user on the DB
  if (await userModel.estimatedDocumentCount() > 0) {
    this.role = mongoose.Types.ObjectId(baseRole._id)
  } else {
    this.role = mongoose.Types.ObjectId(adminRole._id)
  }

  next()
})

@ObjectType()
@modelOptions({ schemaOptions: { timestamps: true } })
export class User {
  @Field(() => ID)
  id: string

  @prop({ required: true })
  @Field({ nullable: false })
  firstName: string

  @prop({ required: true })
  @Field({ nullable: false })
  lastName: string

  @prop({ lowercase: true, required: true })
  @Field({ nullable: false })
  email: string

  @prop({ required: true })
  password: string

  @prop({ ref: Role })
  @Field(() => Role, { nullable: false })
  role: Ref<Role>

  @arrayProp({ itemsRef: 'Permission' })
  @Field(() => [Permission], { nullable: true })
  permissions: Ref<Permission>[]

  @prop({ default: 1 })
  tokenVersion: number

  @prop({ default: false })
  @Field()
  verified: boolean
}

export const userModel = getModelForClass(User)