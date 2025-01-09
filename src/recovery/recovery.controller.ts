import { Controller, Post, Req, Res } from '@nestjs/common';
import { RecoveryService } from './recovery.service';
import { Response, Request } from 'express';
import { Throttle } from '@nestjs/throttler';
@Controller('recovery')
export class RecoveryController {
  constructor(private readonly recoveryService: RecoveryService) {}
  @Throttle({ short: { ttl: 60000, limit: 3 } })
  @Post('sendSms')
  sendRecoverySms(@Req() req: Request, @Res() res: Response) {
    return this.recoveryService.sendRecoverySms(req, res);
  }
  @Throttle({ short: { ttl: 60000, limit: 3 } })
  @Post('checkSms')
  checkRecoverySms(@Req() req: Request, @Res() res: Response) {
    return this.recoveryService.checkRecoverySms(req, res);
  }
}
