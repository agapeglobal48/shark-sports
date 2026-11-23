import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const SITE = 'Mako Sports'
const DEFAULT_DESCRIPTION = 'Hoodies, jerseys, shirts, trousers, hats and socks from Mako Sports. UK delivery, free over £50.'
export const DEFAULT_IMAGE = 'https://res.cloudinary.com/bel0mpgs/video/upload/so_1,w_1200,h_630,c_fill,q_auto,f_jpg/shark-sports/site/hero.jpg'

function setMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!content) {
    el?.remove()
    return
  }
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setCanonical(href) {
  let el = document.head.querySelector('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.rel = 'canonical'
    document.head.appendChild(el)
  }
  el.href = href
}

/**
 * Sets the page title, description, canonical link and social-share tags.
 * `title` without the site name, e.g. "Hoodies" → "Hoodies | Mako Sports".
 * Pass noindex for pages search engines shouldn't list (account, checkout…).
 */
export function useSeo({ title, description, image, type = 'website', noindex = false } = {}) {
  const { pathname } = useLocation()

  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE}` : `${SITE} | Sportswear made to move`
    const desc = description || DEFAULT_DESCRIPTION
    const url = window.location.origin + pathname

    document.title = fullTitle
    setMeta('name', 'description', desc)
    setMeta('name', 'robots', noindex ? 'noindex, nofollow' : null)
    setCanonical(url)
    setMeta('property', 'og:title', fullTitle)
    setMeta('property', 'og:description', desc)
    setMeta('property', 'og:url', url)
    setMeta('property', 'og:type', type)
    setMeta('property', 'og:image', image || DEFAULT_IMAGE)
    setMeta('name', 'twitter:card', 'summary_large_image')
  }, [title, description, image, type, noindex, pathname])
}
