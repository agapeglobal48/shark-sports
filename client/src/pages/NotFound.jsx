import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { LOGO } from '../config.js'
import { useSeo } from '../hooks/useSeo.js'

export default function NotFound() {
  useSeo({ title: 'Page not found', noindex: true })
  return (
    <div className="container-x flex min-h-[80vh] flex-col items-center justify-center pt-24 text-center">
      <motion.img
        src={LOGO}
        alt=""
        className="w-56 opacity-80"
        animate={{ x: [-30, 30, -30], rotate: [-3, 3, -3] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <h1 className="mt-8 font-display text-[28vw] uppercase leading-none text-outline md:text-[14rem]">404</h1>
      <p className="mt-2 font-display text-3xl uppercase">This page swam off</p>
      <p className="mt-2 text-mute">The page you're looking for doesn't exist or has moved.</p>
      <Link to="/" className="btn btn-primary mt-8">
        <span>Back to home</span>
      </Link>
    </div>
  )
}
