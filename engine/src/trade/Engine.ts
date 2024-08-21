import fs from "fs";

import { Orderbook } from "./Orderbook";
import { CANCEL_ORDER, CREATE_ORDER, MessageFromApi } from "../types/fromApi";
import { redisManager } from "../RedisManager";
import { log } from "console";

 export const BASE_CURRENCY = "INR";

 interface UserBalance {
    [key: string]: {
        available: string;
        locked: number;
    }
 }

 export class Engine {
    private orderbooks: Orderbook[] = [];
    private balances: Map<string, UserBalance> = new Map();

    constructor() {
        let snapshot = null;
        try {
            if(process.env.WITH_SNAPSHOT) {
                snapshot = fs.readFileSync("./snapshot.json")
            }
        } catch (e) {
            console.log("No snapshot found");
            
        }
        if (snapshot) {
            const snapShot = JSON.parse(snapshot.toString());
            this.orderbooks = snapShot.orderbooks.map((o:any) => new Orderbook(o.baseAsset, o.bids, o.asks, o.lastTradeId, o.currentPrice));
            this.balances = new Map(snapShot.balances); 
        } else {
            this.orderbooks = [new Orderbook(`ADANI`, [], [], 0, 0)];
            // this.setBaseBalances();
        }
        setInterval(() => {
            this.savesnapshot();
        })
    }

    savesnapshot() {
        const snapshot = {
            orderbooks: this.orderbooks.map(o => o.getSnapshot()),
            balance: Array.from(this.balances.entries())
        }
        fs.writeFileSync("./snapshot/json", JSON.stringify(snapshot));
    }
    process({message, clientId}: {message: MessageFromApi, clientId: string}) {

        switch (message.type) {
            case CREATE_ORDER:
                try {
                   const {executedQty, fills, orderId} = this.createOrder(message.data.market, message.data.price,message.data.quantity,message.data.side,message.data.userId);
                   redisManager.getInstance().sendToApi(clientId, {
                    type: "ORDER_PLACED",
                    payload: {
                        orderId,
                        executedQty,
                        fills,
                      }
                   });
                } catch (e) {
                    console.log(e);
                    redisManager.getInstance().sendToApi( clientId, {
                        type: "ORDER_CANCELLED",
                        payload: {
                            orderId: "",
                            executedQty: 0,
                            remainingQty: 0,
                        }
                    })
                }
                break;
                case CANCEL_ORDER:
                    try {
                        const orderId = message.data.orderId;
                        const cancelMarket = message.data.market;
                        const cancelOrderbook = this.orderbooks.find(o => o.ticker () === cancelMarket);
                        const quoteAsset = cancelMarket.split("-")[0];
                        if (!cancelOrderbook) {
                            throw new Error("No orderbook found");
                        }
                        const order = cancelOrderbook.asks.find(o => o.orderId === orderId) || cancelOrderbook.bids.find(o => o.orderId === orderId);
                        if (!order) {
                            console.log("No order found");
                            throw new Error("No order found");
                        } 
                        if (order.side === "buy") {
                            const price = cancelOrderbook.cancelBid(order)
                            const leftQuantity = (order.quantity - order.filled) * order.price;
                            //@ts-ignore
                            this.balances.get(order.userId)[BASE_CURRENCY].available += leftQuantity;
                            //@ts-ignore
                            this.balances.get(order.userId)[quoteAsset].locked -= leftQuantity;
                            if(price) {
                                this.sendUpdatedDepthAt(price.toString(),cancelMarket);
                            }
                        }
                        redisManager.getInstance().sendToApi(clientId, {
                            type: "ORDER_CANCELLED",
                            payload: {
                                orderId,
                                executedQty: 0,
                                remainingQty: 0,
                            }
                        });
                    } catch (e) {
                        console.log("Error while cancelling order");
                         console.log(e);
                    }
                    break;
                    case "GET_OPEN_ORDERS":
                        try {
                            const openOrderbook = this.orderbooks.find(o => o.ticker() === message.data.market);
                            if (!openOrderbook) {
                                 throw new Error("No orderBook found");
                            }
                            const openOrders = openOrderbook.getOpenOrders(message.data.userId);
                            redisManager.getInstance().sendToApi(clientId, {
                                type : "OPEN_ORDERS",
                                payload : openOrders
                            });
                        } catch (e) {
                            console.log(e);
                        }
                        break;
          }
     }

  }
   