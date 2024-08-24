import express from "express";
import cors from "cors";
import { orderRouter } from "./routes/order";
import { klineRouter } from "./routes/kline";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/v1/order", orderRouter);
app.use("/api/v1/klines", klineRouter)
// app.use("api/v1/depth"depthRouer);

app.listen(3000, () => {
    console.log("Server is running on Port 3000");
    
})