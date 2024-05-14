import { IUserCourse, PurchaseState } from '@nestjs-rabbit-mq/interfaces';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class UserCourseModel extends Document implements IUserCourse {
  @Prop({ required: true })
  courseId: string;

  @Prop({
    required: true,
    enum: PurchaseState,
    type: String,
  })
  purchaseState: PurchaseState;
}

export const UserCourseSchema = SchemaFactory.createForClass(UserCourseModel);
