import {
  CourseGetCourse,
  PaymentCheck,
  PaymentGenerateLink,
} from '@nestjs-rabbit-mq/contracs';
import { UserEntity } from '../entities/user.entity';
import { BuyCourseState } from './buy-course.state';
import { PaymentStatus, PurchaseState } from '@nestjs-rabbit-mq/interfaces';

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

  public async checkPayment(): Promise<{
    user: UserEntity;
    status: PaymentStatus;
  }> {
    throw new Error('You cannot check a payment that has not started');
  }
}

export class BuyCourseSagaStateWaitingFromPayment extends BuyCourseState {
  public pay(): Promise<{ paymentLink: string; user: UserEntity }> {
    throw new Error(
      'You cannot pay for this course it is in the process of payment.'
    );
  }

  public cancel(): Promise<{ user: UserEntity }> {
    throw new Error(
      'You cannot cancel to pay for this course it is in the process of payment.'
    );
  }

  public async checkPayment(): Promise<{
    user: UserEntity;
    status: PaymentStatus;
  }> {
    const { status } = await this.saga.rmqService.send<
      PaymentCheck.Request,
      PaymentCheck.Response
    >(PaymentCheck.topic, {
      userId: this.saga.user._id,
      courseId: this.saga.courseId,
    });

    if (status === PaymentStatus.Canceled) {
      this.saga.setState(PurchaseState.Canceled, this.saga.courseId);
      return { user: this.saga.user, status: PaymentStatus.Canceled };
    }

    if (status !== PaymentStatus.Success) {
      return { user: this.saga.user, status: PaymentStatus.Progress };
    }

    this.saga.setState(PurchaseState.Purchased, this.saga.courseId);
    return { user: this.saga.user, status: PaymentStatus.Progress };
  }
}

export class BuyCourseSagaStatePurchased extends BuyCourseState {
  public pay(): Promise<{ paymentLink: string; user: UserEntity }> {
    throw new Error('You cannot pay for the course that you bought.');
  }

  public cancel(): Promise<{ user: UserEntity }> {
    throw new Error('You cannot cancel for the course that you bought.');
  }

  public checkPayment(): Promise<{ user: UserEntity; status: PaymentStatus }> {
    throw new Error('You cannot check for the course that you bought.');
  }
}

export class BuyCourseSagaStateCanceled extends BuyCourseState {
  public pay(): Promise<{ paymentLink: string; user: UserEntity }> {
    this.saga.setState(PurchaseState.Started, this.saga.courseId);
    return this.saga.getState().pay();
  }

  public cancel(): Promise<{ user: UserEntity }> {
    throw new Error('You cannot cancel for the course that you canceled.');
  }

  public checkPayment(): Promise<{ user: UserEntity; status: PaymentStatus }> {
    throw new Error('You cannot check for the course that you canceled.');
  }
}
