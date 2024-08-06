import React from 'react'
import { LinkComponent } from './LinkComponent'
import { SITE_EMOJI } from '@/utils/site'
import { Connect } from './Connect'
import { NetworkStatus } from './NetworkStatus'

export function Header() {
  return (
    <header className='fixed top-0 left-0 w-full z-10 bg-slate-800 flex justify-between items-center'>
      <LinkComponent href='/'>
        <h1 className='text-xl font-bold'>{SITE_EMOJI}</h1>
      </LinkComponent>
      <div className='flex gap-5'>
        <LinkComponent href='/pages/market'>
          <h1 className='text-xl font-bold'>Market</h1>
        </LinkComponent>
        <LinkComponent href='/pages/dashboard'>
          <h1 className='text-xl font-bold'>Dashboard</h1>
        </LinkComponent>
      </div>
      <div className='flex gap-2 items-center'>
        <Connect />
        <NetworkStatus />
      </div>
    </header>
  )
}