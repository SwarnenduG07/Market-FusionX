import { createClient, RedisClientType } from "redis"
import { ORDER_UPDATE, TRADE_ADDED } from "./types"
import { WsMessage } from "./types/toWs"
import { MessageToApi } from "./types/toApi"

type Dbmessage = {
    type: typeof TRADE_ADDED,
    data: {
        id: string,
        isBuyerMaker: boolean,
        price: string,
        quantity: string,
        quoteQuantity: string,
        timestamp: number,
        market: string,
    }
} | {
    type: typeof ORDER_UPDATE,
    data: {
        orderId: string,
        executedQty:number,
        market?: string,
        price?: string,
        quantity?: string,
        side?: "buy" | "sell"  
    }
}

export class redisManager {
    private client: RedisClientType;
    private static instence: redisManager;

    constructor() {
        this.client = createClient();
        this.client.connect();
    }

    public static getInstance() {
        if (!this.instence) {
            this.instence = new redisManager();
        }
        return this.instence;
    }
    public pushMessage(message: Dbmessage) {
        this.client.lPush("db_processor", JSON.stringify(message));
    }
    
    public publishMessage(channel: string, message: WsMessage) {
        this.client.publish(channel, JSON.stringify(message));
    }

    public sendToApi(clientId: string, message: MessageToApi) {
        this.client.publish(clientId, JSON.stringify(message));
    }
}
