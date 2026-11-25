import { Link } from 'react-router-dom'
import { ArrowRight, Download, Hash, MessageSquare, Repeat2, Ruler, ShoppingBag, Sparkles, Store, Droplets } from 'lucide-react'
import GarmentArt from './GarmentArt.jsx'

// Items on the Kit Designer landing grid. `design` is the Kit Designer item it opens;
// items without one can't be designed online yet, so they lead to a quote request.
const KIT_ITEMS = [
  { label: 'Football kit', art: 'jersey', design: 'football' },
  { label: 'Bowls kit', art: 'polo', design: 'polo' },
  { label: 'Cricket kit', art: 'polo', design: 'polo' },
  { label: 'Team wear', art: 'quarterZip' },
  { label: 'Training tops', art: 'longSleeve' },
  { label: 'Tight fit training bottoms', art: 'leggings' },
  { label: 'Rain jackets', art: 'managerLong' },
  { label: 'Hoodies', art: 'hoodie' },
  { label: 'Tracksuit jackets', art: 'jacket' },
  { label: 'Tracksuit bottoms', art: 'trousers' },
  { label: 'Netball kit', art: 'vest', design: 'vest' },
  { label: 'Hockey kit', art: 'jersey', design: 'football' },
  { label: 'Athletics kit', art: 'vest', design: 'vest' },
  { label: 'Polo shirts', art: 'polo', design: 'polo' },
  { label: 'Rugby kit', art: 'polo', design: 'rugby' },
]

// Grey template garments that take on Mako colours when hovered.
const GREY = 'grayscale contrast-[.45] brightness-150 transition-[filter] duration-500 group-hover:grayscale-0 group-hover:contrast-100 group-hover:brightness-100 group-focus-visible:grayscale-0 group-focus-visible:contrast-100 group-focus-visible:brightness-100'

function TileBody({ item }) {
  return (
    <>
      <span className="relative block bg-linear-to-b from-[#f3f4f6] to-[#dfe2e6] p-3">
        <GarmentArt garment={item.art} className={`mx-auto aspect-15/16 w-full ${GREY}`} />
        {!item.design && <span className="absolute right-2 top-2 rounded-full bg-ink/85 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-bone">Quote</span>}
      </span>
      <span className="block px-4 py-3 font-bold transition-colors group-hover:text-blaze">{item.label}</span>
    </>
  )
}

export function KitPicker({ onChoose }) {
  const tile = 'group block h-full w-full overflow-hidden rounded-2xl border-2 border-line bg-coal text-left transition-colors hover:border-blaze focus-visible:border-blaze'
  return (
    <section aria-labelledby="kit-picker">
      <h2 id="kit-picker" className="text-lg font-bold">
        Choose your sport or team wear item:
      </h2>
      <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {KIT_ITEMS.map((item) => (
          <li key={item.label}>
            {item.design ? (
              <button type="button" className={tile} onClick={() => onChoose(item)}>
                <TileBody item={item} />
              </button>
            ) : (
              <Link to="/contact" className={tile} aria-label={`${item.label}: ask us for a quote`}>
                <TileBody item={item} />
              </Link>
            )}
          </li>
        ))}
      </ul>
      <p className="mt-4 text-sm text-mute">
        Items marked <strong className="text-bone">Quote</strong> can&rsquo;t be designed online yet. <Link to="/contact" className="font-bold text-blaze hover:underline">Tell us what you need</Link> and we&rsquo;ll design them with you.
      </p>
    </section>
  )
}

const REASONS = [
  { icon: Sparkles, title: 'Free online kit designer', text: 'Try colours and styles as often as you like, at no cost.', action: 'Design a kit', to: '#designer' },
  { icon: Hash, title: 'Your logo, names and numbers', text: 'Add your club badge, player names, numbers and initials.', action: 'Start designing', to: '#designer' },
  { icon: Repeat2, title: 'See the front and back', text: 'Turn your kit around to check every side before you order.', action: 'Try it', to: '#designer' },
  { icon: Download, title: 'Save and share your designs', text: 'Keep designs on your device and download an image to share with your team or sponsor.', action: 'Design a kit', to: '#designer' },
  { icon: Store, title: 'A shop for your club', text: 'Players, parents and fans order kit direct, in their own size.', action: 'Find out more', to: '/club-shop' },
  { icon: Ruler, title: 'Size guides for every item', text: 'Clear charts and measuring tips to help everyone get the right fit.', action: 'View size guides', to: '/size-guide' },
  { icon: Droplets, title: 'Kit that lasts', text: 'Simple washing advice to keep colours and prints looking good.', action: 'Washing instructions', to: '/care' },
  { icon: ShoppingBag, title: 'Ready-made kit too', text: 'Need something now? Browse hoodies, jerseys and training gear in our shop.', action: 'Shop now', to: '/shop' },
]

export function KitReasons() {
  return (
    <section className="border-y border-line bg-coal" aria-labelledby="kit-reasons">
      <div className="container-x py-14 md:py-20">
        <h2 id="kit-reasons" className="max-w-3xl font-display text-3xl uppercase leading-tight md:text-5xl">
          A few reasons clubs <span className="text-blaze">choose Mako</span>
        </h2>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {REASONS.map(({ icon: Icon, title, text, action, to }) => {
            const cls = 'mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-blaze hover:underline'
            return (
              <li key={title} className="flex flex-col rounded-2xl border border-line bg-ink p-6">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-blaze/15 text-blaze">
                  <Icon size={22} />
                </span>
                <h3 className="mt-4 text-lg font-bold leading-snug">{title}</h3>
                <p className="mt-2 flex-1 text-sm text-bone/75">{text}</p>
                {to.startsWith('#') ? (
                  <a href={to} className={cls}>
                    {action} <ArrowRight size={14} />
                  </a>
                ) : (
                  <Link to={to} className={cls}>
                    {action} <ArrowRight size={14} />
                  </Link>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

export function KitAsk() {
  return (
    <section className="container-x py-14 md:py-16">
      <div className="flex flex-col items-start justify-between gap-6 rounded-3xl border border-line bg-steel p-8 md:flex-row md:items-center md:p-10">
        <div className="flex items-start gap-4">
          <MessageSquare className="mt-1 shrink-0 text-blaze" size={28} />
          <div>
            <h2 className="font-display text-3xl uppercase md:text-4xl">Questions about our kit?</h2>
            <p className="mt-2 text-bone/75">Want to know more about custom kit, club shops or ordering? Get in touch and we&rsquo;ll help.</p>
          </div>
        </div>
        <Link to="/contact" className="btn btn-primary shrink-0">
          <span>Contact us</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  )
}

export function KitClosing() {
  return (
    <section className="border-t border-line">
      <div className="container-x grid items-center gap-10 py-16 md:grid-cols-2 md:py-20">
        <div>
          <p className="eyebrow mb-3">Kit Designer</p>
          <h2 className="font-display text-4xl uppercase leading-tight md:text-6xl">
            3D Kit <span className="text-blaze">Designer</span>
          </h2>
          <p className="mt-4 max-w-lg text-bone/75">Pick your colours, then add your logo, numbers, names and initials in a few simple steps. Choose your sport or team wear item and start designing your kit today.</p>
          <a href="#designer" className="btn btn-primary mt-8">
            <span>Design your kit now</span>
            <ArrowRight size={16} />
          </a>
        </div>
        <a href="#designer" className="group block rounded-3xl bg-linear-to-b from-[#f3f4f6] to-[#dfe2e6] p-6" aria-label="Design your kit now">
          <GarmentArt garment="jersey" className="mx-auto aspect-15/16 w-full max-w-sm transition-transform duration-500 ease-out-expo group-hover:scale-105" />
        </a>
      </div>
    </section>
  )
}
