import { PaymentStatus } from '@nestjs-rabbit-mq/interfaces';
import { IsString } from 'class-validator';

export namespace PaymentCheck {
  export const topic = 'payment.check.query';

  export class Request {
    @IsString()
    courseId: string;

    @IsString()
    userId: string;
  }

  export class Response {
    status: PaymentStatus;
  }
}
