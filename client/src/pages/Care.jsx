import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowRight, Ban, Check, Droplets, Flame, Package, RotateCcw, Shirt, Sun, Tag, ThermometerSnowflake, Wind, X } from 'lucide-react'
import InfoPage from '../components/InfoPage.jsx'
import ContactCard from '../components/ContactCard.jsx'
import { useSeo } from '../hooks/useSeo.js'

const EASE = [0.16, 1, 0.3, 1]

const DOS = [
  { icon: Tag, text: 'Follow the care label on each garment' },
  { icon: RotateCcw, text: 'Turn printed kit inside out to wash and dry' },
  { icon: ThermometerSnowflake, text: 'Choose a cool wash where the label allows' },
  { icon: Droplets, text: 'Use a mild liquid detergent' },
  { icon: Wind, text: 'Dry flat or on an airer, away from heat' },
]

const DONTS = [
  { icon: Package, text: "Leave damp, muddy kit in a bag" },
  { icon: Flame, text: 'Tumble dry, or dry on a radiator' },
  { icon: Sun, text: 'Dry in strong, direct sunlight' },
  { icon: Ban, text: 'Use bleach or fabric conditioner' },
  { icon: Shirt, text: 'Iron over prints, numbers or badges' },
]

function CareList({ title, items, good }) {
  const Mark = good ? Check : X
  return (
    <div className="rounded-2xl border border-line bg-coal p-6">
      <h2 className="flex items-center gap-3 font-display text-3xl uppercase">
        <span className={good ? 'grid h-9 w-9 place-items-center rounded-full bg-blaze text-ink' : 'grid h-9 w-9 place-items-center rounded-full bg-red-500 text-ink'}>
          <Mark size={20} strokeWidth={3} />
        </span>
        {title}
      </h2>
      <ul className="mt-6 space-y-3">
        {items.map(({ icon: Icon, text }, i) => (
          <motion.li
            key={text}
            initial={{ opacity: 0, x: good ? -16 : 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 + i * 0.06, duration: 0.6, ease: EASE }}
            className="flex items-center gap-4 rounded-xl border border-line bg-ink px-4 py-3"
          >
            <Icon size={22} className={good ? 'shrink-0 text-blaze' : 'shrink-0 text-red-400'} />
            <span>{text}</span>
          </motion.li>
        ))}
      </ul>
    </div>
  )
}

const SECTIONS = [
  {
    id: 'team-kit',
    title: 'Team kit logistics',
    body: (
      <>
        <p>If your club washes kit together, give one person the job each week. It keeps the set together and makes it easier to spot anything missing or damaged.</p>
        <p>Share this page with whoever does the washing, including any laundry service you use. If something gets damaged, tell your coach or kit manager straight away so there's time to sort a replacement.</p>
      </>
    ),
  },
  {
    id: 'general',
    title: 'General advice',
    body: (
      <>
        <p>
          <strong>Always check the care label first.</strong> Different fabrics need different care, and the label on each garment is the instruction to follow.
        </p>
        <ul>
          <li>Wash new kit on its own the first time, in case any loose dye runs.</li>
          <li>Wash kit as soon as you can after use. The longer it sits, the more likely stains and creases are to set.</li>
          <li>Wash similar colours together, and keep whites and lights away from darks.</li>
          <li>Never use bleach or fabric conditioner. Conditioner can coat technical fabrics and stop them wicking sweat.</li>
          <li>Never boil wash, or wash hotter than the label says.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'before',
    title: 'Before washing',
    body: (
      <>
        <p>Knock or brush off as much dried mud and grass as you can. It gives a cleaner result and is kinder to your machine.</p>
        <p>For heavily soiled kit, soak it in cold water for a few hours first. Hot water can set mud and grass stains.</p>
        <p>Empty pockets, do up zips and fasten any Velcro so nothing snags.</p>
      </>
    ),
  },
  {
    id: 'washing',
    title: 'Washing',
    body: (
      <>
        <ul>
          <li>Turn printed and badged items inside out to protect the prints.</li>
          <li>Don't overfill the machine. Kit needs room to move to get properly clean, so split big loads.</li>
          <li>Use a mild liquid detergent. Powder can leave a residue on technical fabrics.</li>
          <li>Pick a gentle cycle and a cool temperature where the label allows. Cooler washes help colours and prints last longer.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'after-washing',
    title: 'After washing',
    body: (
      <>
        <p>Take kit out of the machine as soon as the cycle ends. Leaving it damp in the drum can cause creases, smells and colour transfer.</p>
        <p>
          <strong>Check for stains before you dry anything.</strong> Heat can set a stain for good, so if one is still there, treat it and wash the item again first.
        </p>
      </>
    ),
  },
  {
    id: 'drying',
    title: 'Drying',
    body: (
      <ul>
        <li>Let kit dry naturally, on a washing line or an airer at room temperature.</li>
        <li>Hang it inside out, especially if it has prints, numbers or badges.</li>
        <li>Don't tumble dry. High heat can shrink fabric and crack or peel prints.</li>
        <li>Don't dry on a radiator. Direct heat can damage the fabric and the prints.</li>
        <li>Keep kit out of strong, direct sunlight while it dries, as it can fade colours.</li>
      </ul>
    ),
  },
  {
    id: 'after-drying',
    title: 'Ironing and storing',
    body: (
      <>
        <p>Most sportswear doesn't need ironing, and avoiding extra heat helps it last longer. Hang kit up as soon as it's dry to keep creases down.</p>
        <p>If you do need to iron, check the label first, use the lowest setting and iron the garment inside out.</p>
        <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 font-bold text-bone">
          Never iron over printed logos, numbers, names or initials. It can melt or ruin them.
        </p>
        <p>Store kit clean and completely dry, somewhere cool and out of direct sunlight.</p>
      </>
    ),
  },
  {
    id: 'note',
    title: 'A final note',
    body: (
      <p>
        Washing machines, detergents and stain removers all vary, so always follow the instructions on your garment's label and on the products you use. If you have a question about caring for your kit, or a tip
        that works for you, we'd love to hear it.
      </p>
    ),
  },
]

export default function Care() {
  useSeo({ title: 'Kit care', description: 'How to wash, dry and store your Mako Sports kit so it stays looking good for longer.' })

  return (
    <InfoPage
      eyebrow="Kit care"
      title={['Washing', <span key="c" className="text-blaze">instructions</span>]}
      intro="A little care keeps your kit looking sharp for longer. Here's how to wash, dry and store it."
      sections={SECTIONS}
      top={
        <div className="mb-14">
          <div className="grid gap-4 md:grid-cols-2">
            <CareList title="Do" items={DOS} good />
            <CareList title="Don't" items={DONTS} />
          </div>
          <p className="mt-4 text-sm text-mute">These are general tips. If a garment's care label says something different, follow the label.</p>
        </div>
      }
    >
      <ContactCard text="Questions about washing your kit? Get in touch and we'll help." />
      <section className="mt-12 rounded-3xl border border-line bg-coal p-8 text-center md:p-12">
        <p className="eyebrow mb-3">Kit Designer</p>
        <h2 className="font-display text-4xl uppercase md:text-5xl">
          Design your <span className="text-blaze">next kit</span>
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-bone/75">Choose your style and colours, then add your logo, names, numbers and initials.</p>
        <Link to="/kit-designer" className="btn btn-primary mt-7">
          <span>Design your kit now</span>
          <ArrowRight size={16} />
        </Link>
      </section>
    </InfoPage>
  )
}
