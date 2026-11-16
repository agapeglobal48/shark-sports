import { useRef } from 'react'
import { motion, useMotionValue, useSpring, useScroll, useTransform } from 'motion/react'

const EASE = [0.16, 1, 0.3, 1]

/** Fades + slides children up when they scroll into view. */
export function Reveal({ children, delay = 0, y = 40, className, as = 'div' }) {
  const Tag = motion[as]
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.9, ease: EASE, delay }}
    >
      {children}
    </Tag>
  )
}

/** Each line slides up from behind a mask, one after another. */
export function SplitLines({ lines, className, lineClassName, delay = 0, stagger = 0.12, animateOnView = false }) {
  const trigger = animateOnView
    ? { whileInView: 'show', viewport: { once: true, margin: '-60px' } }
    : { animate: 'show' }
  return (
    <motion.span className={className} initial="hidden" {...trigger} transition={{ staggerChildren: stagger, delayChildren: delay }}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.04em]">
          <motion.span
            className={`block ${lineClassName ?? ''}`}
            variants={{ hidden: { y: '110%', rotate: 2 }, show: { y: '0%', rotate: 0 } }}
            transition={{ duration: 1.1, ease: EASE }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </motion.span>
  )
}

/** Wrapper that follows the cursor slightly while hovered. */
export function Magnetic({ children, strength = 0.35, className }) {
  const ref = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 200, damping: 15, mass: 0.4 })
  const sy = useSpring(y, { stiffness: 200, damping: 15, mass: 0.4 })

  function onMove(e) {
    const r = ref.current.getBoundingClientRect()
    x.set((e.clientX - (r.left + r.width / 2)) * strength)
    y.set((e.clientY - (r.top + r.height / 2)) * strength)
  }
  function reset() {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div ref={ref} className={`inline-block ${className ?? ''}`} style={{ x: sx, y: sy }} onPointerMove={onMove} onPointerLeave={reset}>
      {children}
    </motion.div>
  )
}

/** Words light up one by one as the block scrolls through the screen. */
export function ScrollWords({ text, className }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 85%', 'end 45%'] })
  const words = text.split(' ')
  return (
    <p ref={ref} className={className}>
      {words.map((word, i) => (
        <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>
          {word}
        </Word>
      ))}
    </p>
  )
}

function Word({ children, progress, range }) {
  const opacity = useTransform(progress, range, [0.12, 1])
  const accent = children.startsWith('*')
  return (
    <motion.span style={{ opacity }} className={`mr-[0.25em] inline-block ${accent ? 'text-blaze' : ''}`}>
      {accent ? children.slice(1) : children}
    </motion.span>
  )
}

/** Endless scrolling strip of content. */
export function Marquee({ children, reverse = false, duration = 28, className }) {
  return (
    <div className={`group relative flex overflow-hidden ${className ?? ''}`}>
      <div
        className={`flex w-max shrink-0 ${reverse ? 'animate-marquee-reverse' : 'animate-marquee'} group-hover:[animation-play-state:paused]`}
        style={{ '--marquee-duration': `${duration}s` }}
      >
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  )
}
