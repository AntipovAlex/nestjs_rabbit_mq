import { Injectable } from '@nestjs/common';
import { UserRepository } from './repositories/user.repository';

import { RMQService } from 'nestjs-rmq';
import { UserEntity } from './entities/user.entity';
import { BuyCourseSaga } from './sagas/buy-course.saga';
import { IUser } from '@nestjs-rabbit-mq/interfaces';
import { UserEventImmiter } from './user.event-immiter';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly rmqService: RMQService,
    private readonly userEventImmiter: UserEventImmiter
  ) {}

  public async changeProfile(id: string, user: Pick<IUser, 'displayName'>) {
    const currentyUser = await this.userRepository.findUserById(id);

    if (!currentyUser) {
      throw new Error('This user not exist');
    }
    const userEntity = await new UserEntity(currentyUser).updateProfile(
      user.displayName
    );

    await this.updateUser(userEntity);

    return { user: userEntity };
  }

  public async buyCourse(userId: string, courseId: string) {
    const existUser = await this.userRepository.findUserById(userId);

    if (!existUser) {
      throw new Error('This user not exist');
    }
    const userEntity = new UserEntity(existUser);
    const saga = new BuyCourseSaga(courseId, userEntity, this.rmqService);

    const { user, paymentLink } = await saga.getState().pay();

    await this.updateUser(user);

    return { paymentLink };
  }

  public async checkPayment(userId: string, courseId: string) {
    const existUser = await this.userRepository.findUserById(userId);

    if (!existUser) {
      throw new Error('This user not exist');
    }

    const userEntity = new UserEntity(existUser);
    const saga = new BuyCourseSaga(courseId, userEntity, this.rmqService);
    const { user, status } = await saga.getState().checkPayment();

    await this.updateUser(user);

    return { status };
  }

  private updateUser(user: UserEntity) {
    return Promise.all([
      this.userEventImmiter.handle(user),
      this.userRepository.updateUser(user),
    ]);
  }
}
