import { Router } from "express";

export const tradesRouter = Router();

tradesRouter.get("/", async (req, res) => {
    const { market } = req.query;
    // TODO
    res.json({});
})
