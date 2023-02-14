import {
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class IpUserThrottlerGuard extends ThrottlerGuard {
  async handleRequest(
    context: ExecutionContext,
    limit: number,
    ttl: number,
  ): Promise<boolean> {
    ttl = 60;
    const { req } = this.getRequestResponse(context);
    const ip_key = this.generateKey(context, req.ip);
    const user_key = this.generateKey(context, req.query.user);
    const { totalHits: ipTotalHits } = await this.storageService.increment(
      ip_key,
      ttl,
    );
    const { totalHits: userTotalHits } = await this.storageService.increment(
      user_key,
      ttl,
    );
    if (ipTotalHits > 10 || userTotalHits > 5) {
      const exceedLimit = {
        ip: ipTotalHits,
        id: userTotalHits,
      };
      console.log(exceedLimit);
      throw new HttpException(exceedLimit, HttpStatus.TOO_MANY_REQUESTS);
    }

    return true;
  }
}
