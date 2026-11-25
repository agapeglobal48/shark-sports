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

export const PhotoWall = () => (
  <ComingSoon first="Photo" second="Wall" seoTitle="Photo Wall" intro="Soon you'll be able to see Mako Sports kit out in the wild, worn by the people who train in it." />
)

