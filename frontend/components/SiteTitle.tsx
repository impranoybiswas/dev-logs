import Link from 'next/link'
import React from 'react'

export default function SiteTitle() {
  return (
    <Link className='pl-3 lg:pl-5 flex flex-1 items-center gap-2 h-full' href={"/"}>
        <span className='hidden md:flex font-bold'>D</span>
        <span className='text-base md:text-xl font-bold'>Dev Logs</span>
    </Link>
  )
}
