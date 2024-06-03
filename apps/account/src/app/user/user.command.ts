import { Body, Controller } from '@nestjs/common';
import { UserRepository } from './repositories/user.repository';
import {
  AccountBuyCourse,
  AccountCheckPayment,
  AccountProfileUpdate,
} from '@nestjs-rabbit-mq/contracs';
import { RMQRoute, RMQValidate } from 'nestjs-rmq';
import { UserEntity } from './entities/user.entity';
import { PurchaseState } from '@nestjs-rabbit-mq/interfaces';

@Controller()
export class UserCommand {
  constructor(private readonly userRepository: UserRepository) {}

  @RMQRoute(AccountProfileUpdate.topic)
  @RMQValidate()
  async userInfo(
    @Body() { id }: AccountProfileUpdate.Request,
    displayName: string
  ): Promise<AccountProfileUpdate.Response> {
    const currentyUser = await this.userRepository.findUserById(id);

    if (!currentyUser) {
      throw new Error('This user not exist');
    }
    const userEntity = await new UserEntity(currentyUser).updateProfile(
      displayName
    );

    await this.userRepository.updateUser(userEntity);

    return { user: userEntity };
  }

  @RMQRoute(AccountBuyCourse.topic)
  @RMQValidate()
  async buyCourse(
    @Body() { userId, courseId }: AccountBuyCourse.Request,
    displayName: string
  ): Promise<AccountBuyCourse.Response> {
    return { paymentUrl: 'paymentUrl' };
  }

  @RMQRoute(AccountCheckPayment.topic)
  @RMQValidate()
  async checkPayment(
    @Body() { userId, courseId }: AccountCheckPayment.Request,
    displayName: string
  ): Promise<AccountCheckPayment.Response> {
    return { status: PurchaseState.Purchased };
  }
}
