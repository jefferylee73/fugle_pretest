import { CacheModule, Module } from '@nestjs/common';
import { BitstampGateway } from './bitstamp-gateway';

@Module({
  imports: [CacheModule.register()],
  providers: [BitstampGateway],
})
export class BitstampGatewayModule {}
