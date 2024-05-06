import { ConfigModule, ConfigService } from '@nestjs/config';
import { IRMQServiceAsyncOptions } from 'nestjs-rmq';

export const getRMQConfig = (): IRMQServiceAsyncOptions => ({
  inject: [ConfigService],
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => ({
    exchangeName: configService.get('RMQ_EXCHANGE_NAME') ?? '',
    connections: [
      {
        login: configService.get('RMQ_LOGIN') ?? '',
        password: configService.get('RMQ_PASSWORD') ?? '',
        host: configService.get('RQM_HOST') ?? '',
      },
    ],
    queueName: configService.get('RMQ_QUEUE_NAME'),
    prefetchCount: 32,
    serviceName: 'nestjs-rabbit',
  }),
});
