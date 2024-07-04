import { RMQService } from 'nestjs-rmq';
import { UserEntity } from '../entities/user.entity';
import { PurchaseState } from '@nestjs-rabbit-mq/interfaces';
import { BuyCourseState } from './buy-course.state';
import {
  BuyCourseSagaStateCanceled,
  BuyCourseSagaStatePurchased,
  BuyCourseSagaStateStarted,
  BuyCourseSagaStateWaitingFromPayment,
} from './buy-course.steps';

export class BuyCourseSaga {
  private state: BuyCourseState;

  constructor(
    public courseId: string,
    public user: UserEntity,
    public rmqService: RMQService
  ) {
    this.setState(user.getCourseState(courseId), courseId);
  }

  setState(state: PurchaseState, courseId: string) {
    switch (state) {
      case PurchaseState.Started:
        this.state = new BuyCourseSagaStateStarted();
        break;
      case PurchaseState.WaitingFromPayment:
        this.state = new BuyCourseSagaStateWaitingFromPayment();
        break;
      case PurchaseState.Purchased:
        this.state = new BuyCourseSagaStatePurchased();
        break;
      case PurchaseState.Canceled:
        this.state = new BuyCourseSagaStateCanceled();
        break;
    }
    this.state.setContext(this);
    this.user.updateCourse(courseId, state);
  }
}
