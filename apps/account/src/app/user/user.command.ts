import { Body, Controller } from '@nestjs/common';
import {
  AccountBuyCourse,
  AccountCheckPayment,
  AccountProfileUpdate,
} from '@nestjs-rabbit-mq/contracs';
import { RMQRoute, RMQValidate } from 'nestjs-rmq';
import { UserService } from './user.service';

@Controller()
export class UserCommand {
  constructor(private readonly userService: UserService) {}

  @RMQRoute(AccountProfileUpdate.topic)
  @RMQValidate()
  async changeProfile(
    @Body() { id, user }: AccountProfileUpdate.Request
  ): Promise<AccountProfileUpdate.Response> {
    return this.userService.changeProfile(id, user);
  }

  @RMQRoute(AccountBuyCourse.topic)
  @RMQValidate()
  async buyCourse(
    @Body() { userId, courseId }: AccountBuyCourse.Request
  ): Promise<AccountBuyCourse.Response> {
    return this.userService.buyCourse(userId, courseId);
  }

  @RMQRoute(AccountCheckPayment.topic)
  @RMQValidate()
  async checkPayment(
    @Body() { userId, courseId }: AccountCheckPayment.Request
  ): Promise<AccountCheckPayment.Response> {
    return this.userService.checkPayment(userId, courseId);
  }
}
