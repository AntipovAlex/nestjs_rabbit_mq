import { PurchaseState } from '@nestjs-rabbit-mq/interfaces';
import { IsString } from 'class-validator';

export namespace AccountChamgedCourse {
  export const topic = 'account.changed-course.event';

  export class Request {
    @IsString()
    userId: string;

    @IsString()
    courseId: string;

    @IsString()
    state: PurchaseState;
  }
}
