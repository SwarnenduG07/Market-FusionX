import fs from "fs";

import { Orderbook } from "./Orderbook";

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
  }