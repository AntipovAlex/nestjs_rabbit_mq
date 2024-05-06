import { Controller, Post, UseGuards } from '@nestjs/common';
import { JWTAuthGuard } from '../guards/jwt.guard';
import { UserId } from '../decorates/user.decorate';

@Controller('user')
export class AuthController {
  constructor() {}

  @UseGuards(JWTAuthGuard)
  @Post('info')
  async info(@UserId() userId: string) {}
}
