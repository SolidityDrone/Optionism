import React from 'react';
import { LinkComponent } from './LinkComponent';
import { Connect } from './Connect';
import { NetworkStatus } from './NetworkStatus';
import OptionismLogo from '@/assets/icons/optionism.png'; 
import Image from 'next/image'

export function Header() {
  return (
    <header className='fixed top-0 left-0  h-[55px] w-full z-10 bg-head flex justify-between items-center p-4'>
      <LinkComponent href='/'>
      <Image
  src={OptionismLogo}
  width={66}
  height={66}
  alt="Optionism Logo"
  style={{ objectFit: 'contain' }} // Ensures the image scales within its container
  className='max-h-[122px]' // You can also apply Tailwind classes for height control
/>
      </LinkComponent>
      <div className='flex w-[56%] gap-5'>
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
  );
}
