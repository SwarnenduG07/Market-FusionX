import { Router } from "express";
import { RedisManager } from "../RedisManafger";
import { CANCEL_ORDER } from "../types";


export const orderRouter = Router();

 orderRouter.post("/",  async (req, res) => {
      const { market, price, quantity, side, userId } = req.body;
      console.log({market, price, quantity, side, userId});


      const response = await RedisManager.getInstance().sendAndAwait({
        type: "CREATE_ORDER",
        data: {
            market,
            price,
            quantity,
            side,
            userId
        }
      });
      res.json(response.payload);

      orderRouter.delete("/",  async (req, res) => {
         const {orderId, market} = req.body;
         const response = await RedisManager.getInstance().sendAndAwait({
            type: CANCEL_ORDER,
            data: {
                orderId,
                market,
            }
         });
         res.json(response.payload);
      })
      orderRouter.get("/", async (req,res) => {
          const response = await RedisManager.getInstance().sendAndAwait({
            type: "GET_OPEN_ORDERS",
            data:{
                userId: req.body.userId as string,
                market: req.body.market as string,
              }
          });
      })
 })
 