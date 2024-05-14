import { IsString } from 'class-validator';
import { IUserCourse } from '@nestjs-rabbit-mq/interfaces';

export namespace AccountUserCourses {
  export const topic = 'account.user-info.query';

  export class Request {
    @IsString()
    id: string;
  }

  export class Response {
    courses: IUserCourse[];
  }
}
