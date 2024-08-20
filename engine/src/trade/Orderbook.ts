export interface Order {
    price: number;
    quantity: number;
    orderId: string;
    filled: number;
    side: "buy" | "sell";
    userId: string;
}

export interface Fill {
    price: number;
    qty: number;
    tradeId: string;
    otherUserId: string;
    marketOrderId: string;
}
export class OrderBook {
    bids: Order[];
    asks: Order[];
    baseAsset: string;
    quoteAsset: string;
    lastTradeId: number;
    currentPrice: number;
    
    constructor(bids: Order[], asks:Order[], baseAsset: string, quoteAsset: string, lastTradeId: number, currentPrice: number) {
        this.bids = bids;
        this.asks = asks;
        this.baseAsset = baseAsset;
        this.quoteAsset = quoteAsset;
        this.lastTradeId = lastTradeId || 0;
        this.currentPrice = currentPrice || 0; 
    }
    ticker() {
        return `${this.baseAsset} _${this.quoteAsset}`
    }
    getSnapSHot() {
        return {
            baseAsset : this.baseAsset,
            bids: this.bids,
            asks: this.asks,
            lastTradeId:this.lastTradeId,
            currentPrice: this.currentPrice
        }
    }
    addOrder(order: Order): {
        executedQty: number,
        fills: Fill[]
    } {
        if (order.side === "buy") {
            const {executedQty, fills} = this.matchBid(order); 
            order.filled = executedQty;
            if (executedQty === order.quantity) {
                return {
                    executedQty,
                    fills
                }
            }
            this.bids.push(order);
            return {
                executedQty,
                fills
            }
        }  else {
            const {executedQty, fills} = this.matchAsk(order);
            order.filled= executedQty;
            if (executedQty === order.quantity) {
                return {
                    executedQty, 
                    fills
                }
            }
            this.asks.push(order);
            return {
                executedQty,
                fills,
            }
        }
    } 
}