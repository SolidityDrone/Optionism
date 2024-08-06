import React from 'react'
import { LinkComponent } from './LinkComponent'
import { SITE_EMOJI } from '@/utils/site'
import { Connect } from './Connect'
import { NetworkStatus } from './NetworkStatus'
export function Header() {
  return (
    <header className='navbar bg-slate-800 flex justify-between'>
      <LinkComponent href='/'>
        <h1 className='text-xl font-bold'>{SITE_EMOJI}</h1>
      </LinkComponent>

      <div className='flex gap-2'>
        <Connect />
        <div className='place-self-end'>
        <NetworkStatus />
      </div>
      </div>
    </header>
  )
}
