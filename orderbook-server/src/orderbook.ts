import { number } from "zod";

interface Order {
    price: number;
    quantity: number;
    orderId: string;
}

interface Bid extends Order {
     side : 'bid'
}

interface Ask extends Order {
    side: 'ask'
}

interface OrderBook {
    bids: Bid[];
    asks: Ask[];
}

export const orderbook: OrderBook = {
    bids: [

    ],
    asks: [

    ]
}

export const bookwithQuantity: {bids: {[price: number]: number}; asks: {[price: number]: number}} = {
    bids: {},
    asks: {}
}