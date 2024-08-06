import React from 'react'
import { SITE_EMOJI, SITE_INFO, SOCIAL_GITHUB } from '@/utils/site'
import { FaGithub } from 'react-icons/fa'
import { LinkComponent } from './LinkComponent'

export function Footer() {
  return (
    <footer className='fixed bottom-0 left-0 w-full bg-neutral text-neutral-content p-4 flex justify-between items-center'>
      <p>
        {SITE_EMOJI} {SITE_INFO}
      </p>
      <div className='flex gap-4'>
        <LinkComponent href={`https://github.com/${SOCIAL_GITHUB}`}>
          <FaGithub />
        </LinkComponent>
      </div>
    </footer>
  )
}