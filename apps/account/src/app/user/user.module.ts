import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema, UserModel } from './models/user.model';
import { UserRepository } from './repositories/user.repository';
import { UserCommand } from './user.command';
import { UserQueries } from './user.queries';
import { UserService } from './user.service';
import { UserEventImmiter } from './user.event-immiter';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: UserModel.name, schema: UserSchema }]),
  ],
  providers: [UserRepository, UserService, UserEventImmiter],
  exports: [UserRepository],
  controllers: [UserCommand, UserQueries],
})
export class UserModule {}
