import { Body, Controller } from '@nestjs/common';
import { UserRepository } from './repositories/user.repository';
import {
  AccountBuyCourse,
  AccountCheckPayment,
  AccountProfileUpdate,
} from '@nestjs-rabbit-mq/contracs';
import { RMQRoute, RMQService, RMQValidate } from 'nestjs-rmq';
import { UserEntity } from './entities/user.entity';
import { PurchaseState } from '@nestjs-rabbit-mq/interfaces';
import { BuyCourseSaga } from './sagas/buy-course.saga';

@Controller()
export class UserCommand {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly rmqService: RMQService
  ) {}

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
    @Body() { userId, courseId }: AccountBuyCourse.Request
  ): Promise<AccountBuyCourse.Response> {
    const existUser = await this.userRepository.findUserById(userId);

    if (!existUser) {
      throw new Error('This user not exist');
    }
    const userEntity = new UserEntity(existUser);
    const saga = new BuyCourseSaga(courseId, userEntity, this.rmqService);

    const { user, paymentLink } = await saga.getState().pay();
    await this.userRepository.updateUser(user);

    return { paymentLink };
  }

  @RMQRoute(AccountCheckPayment.topic)
  @RMQValidate()
  async checkPayment(
    @Body() { userId, courseId }: AccountCheckPayment.Request
  ): Promise<AccountCheckPayment.Response> {
    const existUser = await this.userRepository.findUserById(userId);

    if (!existUser) {
      throw new Error('This user not exist');
    }

    const userEntity = new UserEntity(existUser);
    const saga = new BuyCourseSaga(courseId, userEntity, this.rmqService);
    const { user, status } = await saga.getState().checkPayment();
    await this.userRepository.updateUser(user);

    return { status };
  }
}
