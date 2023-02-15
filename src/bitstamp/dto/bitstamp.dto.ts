export class BitStampMessage {
  event: string;
  channel: string;
  data: TradeObject;
}

export class TradeObject {
  id: number;
  amount: number;
  amount_str: string;
  price: number;
  price_str: string;
  type: boolean;
  timestamp: string;
  microtimestamp: string;
  buy_order_id: number;
  sell_order_id: number;
}

export class OneMinuteOhlcObject {
  first_price: number;
  highest_price: number;
  lowest_price: number;
  last_price: number;
}
