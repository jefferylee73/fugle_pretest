import { Cache } from 'cache-manager';
import { OnModuleInit, Inject, CACHE_MANAGER } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { WebSocket } from 'ws';
import { BitStampMessage, OneMinuteOhlcObject } from './dto/bitstamp.dto';

@WebSocketGateway({ namespace: 'streaming' })
export class BitstampGateway implements OnModuleInit {
  @WebSocketServer()
  server: Server;

  socket_client: WebSocket;

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {
    this.socket_client = new WebSocket('wss://ws.bitstamp.net');
  }

  async onModuleInit() {
    this.registerBitstampGateway();
  }

  registerBitstampGateway() {
    // 向 bitstamp 發送訂閱
    this.socket_client.on('open', () => {
      console.log('Connected to Bitstamp WebSocket API');
      const channels = [
        'live_trades_btcusd',
        'live_trades_btceur',
        'live_trades_btcgbp',
        'live_trades_btcpax',
        'live_trades_gbpusd',
        'live_trades_gbpeur',
        'live_trades_eurusd',
        'live_trades_xrpusd',
        'live_trades_xrpeur',
        'live_trades_xrpbtc',
      ];
      channels.forEach((channel) => {
        const subscribe = {
          event: 'bts:subscribe',
          data: {
            channel: channel,
          },
        };
        this.socket_client.send(JSON.stringify(subscribe));
      });
    });

    // 監聽 bitstamp 回應訊息
    this.socket_client.on('message', async (data) => {
      const response: BitStampMessage = JSON.parse(data.toString());
      if (response.event == 'trade') {
        // 更新 cache 每分鐘內的值
        const cacheKey = response.data.id.toString();
        const price = response.data.price;
        let cacheValue: OneMinuteOhlcObject = await this.cacheManager.get(
          cacheKey,
        );
        const isExists = cacheValue ? true : false;
        if (!isExists) {
          cacheValue = {
            first_price: price,
            highest_price: price,
            lowest_price: price,
            last_price: price,
          };
          await this.cacheManager.set(cacheKey, cacheValue, 60);
        } else {
          cacheValue.last_price = price;
          if (price > cacheValue.highest_price) {
            cacheValue.highest_price = price;
          }
          if (price < cacheValue.lowest_price) {
            cacheValue.lowest_price = price;
          }
          await this.cacheManager.set(cacheKey, cacheValue);
        }
        // 發送 bitstamp 價格
        this.server.emit('live_trades_response', {
          id: response.data.id,
          latest_trade_price: response.data.price,
          one_minute_ohlc: cacheValue,
        });
      }
      console.log(data.toString());
    });
  }
}
