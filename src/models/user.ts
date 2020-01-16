import { ObjectType } from "type-graphql";
import { prop, modelOptions, getModelForClass, Ref, arrayProp } from '@typegoose/typegoose'
import { Field, ID } from 'type-graphql'
import { Role, roleModel } from "./role";
import { Permission } from "./permission";

@ObjectType()
@modelOptions({ schemaOptions: { timestamps: true } })
export class User {
  @Field(() => ID)
  id: string

  @prop()
  @Field()
  firstName: string

  @prop()
  @Field()
  lastName: string

  @prop({ lowercase: true })
  @Field()
  email: string

  @prop()
  password: string

  @prop({ ref: Role })
  @Field(() => Role, {defaultValue: async () => {
    // Get the admin and base role
    const roles = await roleModel.find({ usedFor: { '$in': ['adminRole', 'baseRole'] } }, { id: 1 })
    console.log(roles)
    if (await userModel.estimatedDocumentCount() > 0) {

    }
  }})
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