"use client";

import { usePathname } from "next/navigation";

import { useRouter } from "next/navigation";
import { PrimaryButton, SuccessButton } from "./Button";
import Image from "next/image";

export const Appbar = () => {
    const route = usePathname();
    const router = useRouter()

    return <div className="text-white border-b border-slate-800 filter backdrop-blur-sm">
        <div className="flex justify-between items-center p-2">
            <div className="flex">
                <Image 
                src="/Logo.png"
                height={40}
                width={40}
                alt="Logo"
                className="ml-10 cursor-pointer"
                />
                <div className={`text-xl pl-4 flex flex-col font-bold justify-center cursor-pointer text-teal-600  font-serif mr-6`}>
                    MARKET FUSION
                </div>
                <div className={`text-sm pt-1 flex flex-col justify-center pl-8 cursor-pointer ${route.startsWith('/') ? 'text-white' : 'text-slate-500'}`} onClick={() => router.push('/')}>
                    Markets
                </div>
                <div className={`text-sm pt-1 flex flex-col justify-center pl-8 cursor-pointer ${route.startsWith('/trade') ? 'text-white' : 'text-slate-500'}`} onClick={() => router.push('/trade/SOL_USDC')}>
                    Trade
                </div>
            </div>
            <div className="flex">
                <div className="p-2 mr-2">
                    <SuccessButton>Deposit</SuccessButton>
                    <PrimaryButton>Withdraw</PrimaryButton>
                </div>
            </div>
        </div>
    </div>
}