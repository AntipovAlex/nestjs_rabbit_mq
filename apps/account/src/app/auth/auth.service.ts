import { Injectable } from '@nestjs/common';
import { UserRepository } from '../user/repositories/user.repository';
import { UserEntity } from '../user/entities/user.entity';
import { UserRole } from '@nestjs-rabbit-mq/interfaces';
import { JwtService } from '@nestjs/jwt';
import { AccountLogin, AccountRegister } from '@nestjs-rabbit-mq/contracs';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService
  ) {}

  async register({
    email,
    password,
    displayName,
  }: AccountRegister.Request): Promise<AccountRegister.Response> {
    const checkUserEmail = this.userRepository.findUser(email);
    const checkUserDisplayName = this.userRepository.findUser(displayName);

    if (checkUserEmail) {
      throw new Error('This email has already been take');
    }

    if (checkUserDisplayName) {
      throw new Error('This displayName has already been take');
    }

    const newUserEntity = await new UserEntity({
      email,
      displayName,
      passwordHash: '',
      role: UserRole.Student,
    }).setPassword(password);

    const createNewUser = await this.userRepository.createUser(newUserEntity);

    return {
      email: createNewUser.email,
      displayName: createNewUser.displayName,
      id: createNewUser._id,
    };
  }

  async validater({ email, password }: AccountLogin.Request) {
    const user = await this.userRepository.findUser(email);

    if (!user) {
      throw new Error('This user does not exist');
    }

    const userEntity = new UserEntity(user);
    const correctPAssword = await userEntity.validatePassword(password);

    if (!correctPAssword) {
      throw new Error('This is not the correct password');
    }

    return { id: user._id };
  }

  async login(id: string): Promise<AccountLogin.Response> {
    return {
      access_token: await this.jwtService.signAsync(id),
    };
  }
}
