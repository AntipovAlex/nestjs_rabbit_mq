import { IUser, UserRole } from '@nestjs-rabbit-mq/interfaces';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { UserCourseModel, UserCourseSchema } from './userCourse.model';

@Schema()
export class UserModel extends Document implements IUser {
  @Prop()
  displayName?: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({
    required: true,
    enum: UserRole,
    type: String,
    default: UserRole.Student,
  })
  role: UserRole;

  @Prop({ type: [UserCourseSchema], _id: false })
  courses: Types.Array<UserCourseModel>;
}

export const UserSchema = SchemaFactory.createForClass(UserModel);
