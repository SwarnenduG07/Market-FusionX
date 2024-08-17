"use client"
import MarketBar from '@/app/components/MarketBar'
import { useParams } from 'next/navigation'
import React from 'react'

export default function Page ()  {
  const { market } = useParams()
  return (
    <div className='flex flex-row flex-1'>
       <div className='flex flex-col flex-1'>
          <MarketBar market={market as string} /> 
          hi there
       </div>
    </div>
  )
}

