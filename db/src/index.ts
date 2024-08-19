import Client from "pg";
import { createClient } from "redis";
import { DbMessage } from "./types";

const pgClient = new Client({
     user: '6qYiFa',
     host: "localhost",
     database: "my_database",
     password: "mysimple_password",
     port: 5435

});

pgClient.connect();

async function main() {
    const redisClinet = createClient();
    await redisClinet.connect();
    console.log("Connected to Redis CLient");

    while (true) {
        const res = await redisClinet.rPop("db_processre" as string);
        if (!res) {

        } else {
            const data: DbMessage = JSON.parse(res);
            if(data.type === "TRADE_ADDED") {
                console.log("adding data");
                console.log(data);
                const price = data.data.price;
                const timestamp =  new Date(data.data.timestamp);
                const query = 'INSERT INTO Adani_prices (time, price) VALUES ($1, $2)';
                
                const values = [timestamp,price];
                await pgClient.query(query, values);
                
            }
        }
    }
    
}