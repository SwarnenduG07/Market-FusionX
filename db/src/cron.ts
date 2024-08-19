import { Client } from 'pg'; 

const pgClient = new Client({
    user: '6qYiFa',
    host: "localhost",
    database: "my_database",
    password: "mysimple_password",
    port: 5435

});
client.connect();

async function refreshViews() {

    await client.query('REFRESH MATERIALIZED VIEW klines_1m');
    await client.query('REFRESH MATERIALIZED VIEW klines_1h');
    await client.query('REFRESH MATERIALIZED VIEW klines_1w');

    console.log("Materialized views refreshed successfully");
}

refreshViews().catch(console.error);

setInterval(() => {
    refreshViews()
}, 1000 * 10 );