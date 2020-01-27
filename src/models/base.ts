import { ObjectType, Field } from "type-graphql";
import { prop, pre, Ref, mongoose } from "@typegoose/typegoose";
import { User } from "./user";

// create system user
export const system = {
  firstName: 'System',
  lastName: 'System',
  role: mongoose.Types.ObjectId(),
  permissions: [],
  id: '',
  email: '',
  password: '',
  wasNew: false,
  verified: true,
  tokenVersion: 1,
  passwordRecoveryVersion: 1,
  createdAt: '',
  updatedAt: '',
  createdBy: mongoose.Types.ObjectId(),
  lastUpdatedBy: mongoose.Types.ObjectId()
}

const contextService = require('request-context');

@pre<Base>('validate', function (next) {
  // Get the user from express context
  const user = contextService.get('req:user')

  if (this.isNew) {
    // Set the createdby value
    this.createdBy = user ? mongoose.Types.ObjectId(user._id) : system
    this.lastUpdatedBy = user ? mongoose.Types.ObjectId(user._id) : system
    return next()
  }

  // If the document is not new then proceed to update the lastUpdatedBy field
  this.lastUpdatedBy = user ? mongoose.Types.ObjectId(user._id) : system

  return next()
})

@pre<Base>('save', function (next) {
  // Get the user from express context
  const user = contextService.get('req:user')

  // If the document is not new then proceed to update the lastUpdatedBy field
  this.lastUpdatedBy = user ? mongoose.Types.ObjectId(user._id) : system

  return next()
})

@ObjectType()
export class Base {
  @prop()
  @Field({ nullable: false })
  createdAt: string

  @prop()
  @Field({ nullable: false })
  updatedAt: string

  @prop({ required: true })
  @Field(() => User, { nullable: false })
  createdBy: Ref<User>

  @prop({ required: true })
  @Field(() => User, { nullable: false })
  lastUpdatedBy: Ref<User>
}
