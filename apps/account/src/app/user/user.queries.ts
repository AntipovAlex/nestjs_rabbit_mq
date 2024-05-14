import {
  AccountUserCourses,
  AccountUserInfo,
} from '@nestjs-rabbit-mq/contracs';
import { Body, Controller } from '@nestjs/common';
import { UserRepository } from './repositories/user.repository';
import { RMQRoute, RMQValidate } from 'nestjs-rmq';

@Controller()
export class UserQueries {
  constructor(private readonly userRepository: UserRepository) {}

  @RMQRoute(AccountUserInfo.topic)
  @RMQValidate()
  async userInfo(
    @Body() { id }: AccountUserInfo.Request
  ): Promise<AccountUserInfo.Response> {
    const user = await this.userRepository.findUserById(id);
    return { user };
  }

  @RMQRoute(AccountUserCourses.topic)
  @RMQValidate()
  async userCourses(
    @Body() { id }: AccountUserCourses.Request
  ): Promise<AccountUserCourses.Response> {
    const user = await this.userRepository.findUserById(id);
    return { courses: user.courses };
  }
}
