"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const types_1 = require("./types");
const orderbook_1 = require("./orderbook");
const BASE_ASSET = 'BTC';
const QUOTE_ASSET = 'USD';
const app = (0, express_1.default)();
app.use(express_1.default.json());
let GLOBAL_TRADE_ID = 0;
app.post('/api/v1/order', (req, res) => {
    const order = types_1.OrderInputSchema.safeParse(req.body);
    if (!order.success) {
        res.status(400).send(order.error.message);
        return;
    }
    const { baseAsset, quoteAsset, price, quantity, side, kind } = order.data;
    const orderId = getOrderId();
    if (baseAsset !== BASE_ASSET || quoteAsset !== QUOTE_ASSET) {
        res.status(400).send('Invalid base or quote asset');
        return;
    }
    const { executedQty, fills } = fillOrder(orderId, price, quantity, side, kind);
    res.send({
        orderId,
        executedQty,
        fills
    });
});
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
function getOrderId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
function fillOrder(orderId, price, quantity, side, type) {
    const fills = [];
    const maxFillQuantity = getFillAmount(price, quantity, side);
    let executedQty = 0;
    if (type === 'ioc' && maxFillQuantity < quantity) {
        return { status: 'rejected', executedQty: maxFillQuantity, fills: [] };
    }
    if (side === 'buy') {
        orderbook_1.orderbook.asks.forEach(o => {
            if (o.price <= price && quantity > 0) {
                console.log("filling ask");
                const filledQuantity = Math.min(quantity, o.quantity);
                console.log(filledQuantity);
                o.quantity -= filledQuantity;
                orderbook_1.bookwithQuantity.asks[o.price] = (orderbook_1.bookwithQuantity.asks[o.price] || 0) - filledQuantity;
                fills.push({
                    price: o.price,
                    qty: filledQuantity,
                    tradeId: GLOBAL_TRADE_ID++
                });
                executedQty += filledQuantity;
                quantity -= filledQuantity;
                if (o.quantity === 0) {
                    orderbook_1.orderbook.asks.splice(orderbook_1.orderbook.asks.indexOf(o), 1);
                }
                if (orderbook_1.bookwithQuantity.asks[price] === 0) {
                    delete orderbook_1.bookwithQuantity.asks[price];
                }
            }
        });
        // Place on the book if order not filled
        if (quantity !== 0) {
            orderbook_1.orderbook.bids.push({
                price,
                quantity: quantity - executedQty,
                side: 'bid',
                orderId
            });
            orderbook_1.bookwithQuantity.bids[price] = (orderbook_1.bookwithQuantity.bids[price] || 0) + (quantity - executedQty);
        }
    }
    else {
        orderbook_1.orderbook.bids.forEach(o => {
            if (o.price >= price && quantity > 0) {
                const filledQuantity = Math.min(quantity, o.quantity);
                o.quantity -= filledQuantity;
                orderbook_1.bookwithQuantity.bids[price] = (orderbook_1.bookwithQuantity.bids[price] || 0) - filledQuantity;
                fills.push({
                    price: o.price,
                    qty: filledQuantity,
                    tradeId: GLOBAL_TRADE_ID++
                });
                executedQty += filledQuantity;
                quantity -= filledQuantity;
                if (o.quantity === 0) {
                    orderbook_1.orderbook.bids.splice(orderbook_1.orderbook.bids.indexOf(o), 1);
                }
                if (orderbook_1.bookwithQuantity.bids[price] === 0) {
                    delete orderbook_1.bookwithQuantity.bids[price];
                }
            }
        });
        // Place on the book if order not filled
        if (quantity !== 0) {
            orderbook_1.orderbook.asks.push({
                price,
                quantity: quantity,
                side: 'ask',
                orderId
            });
            orderbook_1.bookwithQuantity.asks[price] = (orderbook_1.bookwithQuantity.asks[price] || 0) + (quantity);
        }
    }
    console.log("OrderId", orderbook_1.orderbook);
    return {
        status: 'accepted',
        executedQty,
        fills
    };
}
function getFillAmount(price, quantity, side) {
    let filled = 0;
    if (side === 'buy') {
        orderbook_1.orderbook.asks.forEach(o => {
            if (o.price < price) {
                filled += Math.min(quantity, o.quantity);
            }
        });
    }
    else {
        orderbook_1.orderbook.bids.forEach(o => {
            if (o.price > price) {
                filled += Math.min(quantity, o.quantity);
            }
        });
    }
    return filled;
}
