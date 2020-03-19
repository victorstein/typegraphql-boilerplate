import { ObjectType, Field } from "type-graphql";
import { prop, pre, Ref } from "@typegoose/typegoose";
import { User } from "./user";
const contextService = require('request-context');

@pre<Base>('validate', function (next) {
  // Get the user from express context
  const user = contextService.get('req:user')

  if (this.isNew) {
    // Set the createdby value
    this.createdBy = user ? user._id : undefined
    this.lastUpdatedBy = user ? user._id : undefined
    return next()
  }

  // If the document is not new then proceed to update the lastUpdatedBy field
  this.lastUpdatedBy = user ? user._id : undefined

  return next()
})

@pre<Base>('save', function (next) {
  // Get the user from express context
  const user = contextService.get('req:user')

  // If the document is not new then proceed to update the lastUpdatedBy field
  this.lastUpdatedBy = user ? user._id : undefined

  return next()
})

@ObjectType()
export class Base {
  @prop({ type: Date, text: true })
  @Field(() => Date, { nullable: false })
  createdAt: Date

  @prop({ type: Date })
  @Field(() => Date, { nullable: false })
  updatedAt: Date

  @prop({ required: false, ref: 'User', text: true })
  @Field(() => User, { nullable: true })
  createdBy: Ref<User>

  @prop({ required: false, ref: 'User', text: true })
  @Field(() => User, { nullable: true })
  lastUpdatedBy: Ref<User>
}
