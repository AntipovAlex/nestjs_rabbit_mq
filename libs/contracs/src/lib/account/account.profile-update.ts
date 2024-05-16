import { IsString } from 'class-validator';
import { IUser } from '@nestjs-rabbit-mq/interfaces';

export namespace AccountProfileUpdate {
  export const topic = 'account.profile-update.command';

  export class Request {
    @IsString()
    id: string;

    @IsString()
    displayName: Pick<IUser, 'displayName'>;
  }

  export class Response {
    user: Omit<IUser, 'passwordHash'>;
  }
}
