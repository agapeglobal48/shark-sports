import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import InfoPage from '../components/InfoPage.jsx'
import { useSeo } from '../hooks/useSeo.js'

// Placeholder for menu pages until their real content is ready.
function ComingSoon({ first, second, seoTitle, intro }) {
  useSeo({ title: seoTitle, description: intro })

  return (
    <InfoPage
      eyebrow="Coming soon"
      title={[first, <span key="highlight" className="text-blaze">{second}</span>]}
      intro={intro}
    >
      <div className="flex flex-wrap gap-3">
        <Link to="/contact" className="btn btn-primary">
          <span>Contact us</span>
          <ArrowRight size={16} />
        </Link>
        <Link to="/shop" className="btn btn-ghost">
          <span>Shop the range</span>
        </Link>
      </div>
    </InfoPage>
  )
}

export const ClubShop = () => (
  <ComingSoon first="Club" second="Shop" seoTitle="Club Shop" intro="Club shops are on their way. If you run a club or team, get in touch and we can talk it through." />
)

export const PhotoWall = () => (
  <ComingSoon first="Photo" second="Wall" seoTitle="Photo Wall" intro="Soon you'll be able to see Mako Sports kit out in the wild, worn by the people who train in it." />
)

export const SizeGuide = () => (
  <ComingSoon first="Size" second="Guide" seoTitle="Size guide" intro="Our full size guide is on its way. Not sure which size to pick? Contact us before you order and we'll help." />
)

export const Care = () => (
  <ComingSoon first="Kit" second="Care" seoTitle="Care" intro="Our care guide is on its way. Until then, follow the instructions on your garment's label, or contact us with any questions." />
)
