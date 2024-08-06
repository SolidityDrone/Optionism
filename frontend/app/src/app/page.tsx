import { CardList } from '@/components/CardList'
import { SITE_DESCRIPTION, SITE_NAME } from '@/utils/site'

export default function Home() {
  return (
    <>
      <h2 className='text-2xl mb-2'>{SITE_NAME}</h2>
      <p>{SITE_DESCRIPTION}</p>

      {/* Examples are only used for demo purposes. Feel free to delete this section */}
      <div className='mt-4'>
        <h3 className='text-lg mb-2'>Examples</h3>
        <p className='mb-4'>
            Hello
        </p>

      </div>
    </>
  )
}
