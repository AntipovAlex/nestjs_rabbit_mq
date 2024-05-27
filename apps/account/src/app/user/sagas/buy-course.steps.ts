import {
  CourseGetCourse,
  PaymentGenerateLink,
} from '@nestjs-rabbit-mq/contracs';
import { UserEntity } from '../entities/user.entity';
import { BuyCourseState } from './buy-course.state';
import { PurchaseState } from '@nestjs-rabbit-mq/interfaces';

export class BuyCourseSagaStateStarted extends BuyCourseState {
  public async pay(): Promise<{ paymentLink: string; user: UserEntity }> {
    const { course } = await this.saga.rmqService.send<
      CourseGetCourse.Request,
      CourseGetCourse.Response
    >(CourseGetCourse.topic, { id: this.saga.courseId });

    if (!course) {
      throw new Error('Such the course does not exist');
    }

    if (course.price === 0) {
      this.saga.setState(PurchaseState.Purchased, course._id);
      return { paymentLink: null, user: this.saga.user };
    }
    const { paymentLink } = await this.saga.rmqService.send<
      PaymentGenerateLink.Request,
      PaymentGenerateLink.Response
    >(PaymentGenerateLink.topic, {
      courseId: course._id,
      userId: this.saga.user._id,
      sum: course.price,
    });

    this.saga.setState(PurchaseState.WaitingFromPayment, course._id);
    return { paymentLink, user: this.saga.user };
  }
  public async cancel(): Promise<{ user: UserEntity }> {
    this.saga.setState(PurchaseState.Canceled, this.saga.courseId);
    return { user: this.saga.user };
  }

  public async checkPayment(): Promise<{ user: UserEntity }> {
    throw new Error('You cannot check a payment that has not started');
  }
}
