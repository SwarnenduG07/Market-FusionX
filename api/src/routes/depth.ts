
import { Router } from "express";
import { GET_DEPTH } from "../types";
import { RedisManager } from "../RedisManafger";

export const depthRouter = Router();

depthRouter.get("/", async (req, res) => {
    const { symbol } = req.query;
    const response = await RedisManager.getInstance().sendAndAwait({
        type: GET_DEPTH,
        data: {
            market: symbol as string
        }
    });

    res.json(response.payload);
});
