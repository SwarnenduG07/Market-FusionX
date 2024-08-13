import z from "zod";

export const OderSchema = z.object({
    baseAsset: z.string(),
    quoteAsset: z.string(),
    price: z.number(),
    quantity: z.number(),
    side: z.enum(["buy", "shell"]),
    type: z.enum(["limit", "market"]),
    kind: z.enum(["ioc"]).optional(),

})