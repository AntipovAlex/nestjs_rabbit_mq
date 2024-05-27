import { RMQService } from 'nestjs-rmq';
import { UserEntity } from '../entities/user.entity';
import { PurchaseState } from '@nestjs-rabbit-mq/interfaces';
import { BuyCourseState } from './buy-course.state';

export class BuyCourseSaga {
  private state: BuyCourseState;

  constructor(
    public courseId: string,
    public user: UserEntity,
    public rmqService: RMQService
  ) {}

  getState() {
    return this.state;
  }

  setState(state: PurchaseState, courseId: string) {
    switch (state) {
      case PurchaseState.Started:
        break;
      case PurchaseState.WaitingFromPayment:
        break;
      case PurchaseState.Purchased:
        break;
      case PurchaseState.Canceled:
        break;
    }
    this.state.setContext(this);
    this.user.updateCourse(courseId, state);
  }
}
