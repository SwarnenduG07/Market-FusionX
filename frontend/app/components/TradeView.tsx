import { useRef } from "react"

export function TradeView({market } : {market: string}) {
 
 const chartRef = useRef<HTMLDivElement>(null);
 const chatManagerRef = useRef<ChartManager>


     return (
        <>
           <div ref={chartRef}>

           </div>
        </>
     )
}