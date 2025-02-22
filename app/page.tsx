'use client'

import Link from 'next/link'
import { TypingAnimation } from '@/components/magicui/typing-animation'

export default function LandingPage () {
  return (
    <div className='min-h-screen flex flex-col items-center justify-center bg-background px-4 text-center'>
      <TypingAnimation className='text-4xl font-bold'>
        Welcome to EventDriven Architecture 🚀
      </TypingAnimation>
      <div className='mt-8 space-y-4'>
        <p className='text-md text-muted-foreground'>
          Already have an account?{' '}
          <Link
            href='/sign-in'
            className='text-primary font-semibold underline'
          >
            Sign In
          </Link>
        </p>
        <p className='text-md text-muted-foreground'>
          Don't have an account?{' '}
          <Link
            href='/sign-up'
            className='text-primary font-semibold underline'
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  )
}
