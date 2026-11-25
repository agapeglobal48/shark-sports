// Questions shown on the Delivery & FAQ page and in the Help centre.
// Only describe things the shop really does. Update answers when policies change.
import { Link } from 'react-router-dom'
import { EmailLink, ReturnsDays } from '../components/Info.jsx'
import DeliveryPrices from '../components/DeliveryPrices.jsx'
import { ORDER_STATUS } from '../lib/orderStatus.js'

const CUSTOMER_STATUSES = ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED']

export const DELIVERY_FAQ = [
  {
    q: 'Do I need an account to order?',
    a: (
      <>
        No. You can check out as a guest. If you <Link to="/register">create an account</Link>, you can see all your orders in one place.
      </>
    ),
  },
  {
    q: 'How do I know which size to choose?',
    a: (
      <>
        Check our <Link to="/size-guide">size guide</Link> before you order. If you're between sizes, we'd suggest going up one. Still not sure? Email <EmailLink /> and we'll help.
      </>
    ),
  },
  {
    q: 'Can I change or cancel my order?',
    a: (
      <>
        Email <EmailLink /> as soon as possible with your order number. If it hasn't been sent yet, we'll change or cancel it. If it's already on its way,
        you can return it once it arrives.
      </>
    ),
  },
  {
    q: 'How do I return something?',
    a: (
      <>
        You have <ReturnsDays /> days from delivery. Everything you need is on our <Link to="/returns">returns page</Link>.
      </>
    ),
  },
  {
    q: 'Which payment methods do you accept?',
    a: 'Visa, Mastercard, American Express, Apple Pay and Google Pay. Payments are processed securely by Stripe, and we never see your card number.',
  },
  {
    q: 'Do you deliver outside the UK?',
    a: "Not yet. We currently deliver to UK addresses only, including Northern Ireland, the Highlands and islands.",
  },
  {
    q: 'My order arrived damaged or with the wrong item.',
    a: (
      <>
        Sorry about that. Email <EmailLink /> with your order number and a photo, and we'll put it right at no cost to you.
      </>
    ),
  },
]

const [ACCOUNT, SIZING, CHANGE, RETURNS, PAYMENT, ABROAD, DAMAGED] = DELIVERY_FAQ

export const HELP_GROUPS = [
  {
    title: 'Ordering and payment',
    items: [
      {
        q: 'How do I place an order?',
        body: (
          <ol className="list-decimal space-y-2 pl-5">
            <li>Find what you want in the <Link to="/shop">shop</Link> and choose your colour and size.</li>
            <li>Add it to your bag. You can keep shopping and add more.</li>
            <li>Open your bag and select Checkout.</li>
            <li>Enter your delivery address and pay on our secure Stripe checkout page.</li>
            <li>You'll see a confirmation page with your order number. Keep it for any questions.</li>
          </ol>
        ),
      },
      ACCOUNT,
      PAYMENT,
      CHANGE,
    ],
  },
  {
    title: 'Your orders',
    items: [
      {
        q: 'How do I see what I ordered before?',
        a: (
          <>
            If you ordered while logged in, go to <Link to="/account">My account</Link>. Under My orders you'll see each order's number, date, status and the items, sizes and colours you chose.
          </>
        ),
      },
      {
        q: 'What does my order status mean?',
        body: (
          <ul>
            {CUSTOMER_STATUSES.map((s) => (
              <li key={s}>
                <strong>{ORDER_STATUS[s].label}</strong>
                {{ PAID: ': we have your order and payment.', PROCESSING: ': we are packing your order.', SHIPPED: ': your order is on its way.', DELIVERED: ': your order has arrived.' }[s]}
              </li>
            ))}
          </ul>
        ),
      },
      {
        q: 'Can I get a receipt for my order?',
        a: (
          <>
            Your order details are in <Link to="/account">My account</Link> if you were logged in. For a receipt or invoice, email <EmailLink /> with your order number.
          </>
        ),
      },
    ],
  },
  {
    title: 'Delivery and returns',
    items: [{ q: 'How much is delivery?', a: <DeliveryPrices /> }, ABROAD, RETURNS, DAMAGED],
  },
  {
    title: 'Sizing and care',
    items: [
      SIZING,
      {
        q: 'How should I wash my kit?',
        a: (
          <>
            Follow the care label on each garment. Our <Link to="/care">washing instructions</Link> have tips to keep colours and prints looking good for longer.
          </>
        ),
      },
    ],
  },
  {
    title: 'Kit Designer and custom kit',
    items: [
      {
        q: 'How do I use the Kit Designer?',
        a: (
          <>
            Open the <Link to="/kit-designer">Kit Designer</Link>, pick an item, then choose a style and colours. Add your logo, names, numbers and initials, and turn the kit to see the front and back.
          </>
        ),
      },
      {
        q: 'Where are my saved designs?',
        a: "Designs you save are kept in the browser you used, on that device only. They aren't linked to your account, so download an image of any design you want to keep.",
      },
      {
        q: 'What logo files can I upload?',
        a: 'PNG, JPG or WebP images up to 5 MB. A logo with a transparent background looks best. Only upload logos you have permission to use.',
      },
      {
        q: "What's the difference between raster and vector artwork?",
        body: (
          <>
            <p>
              <strong>Raster</strong> images, like PNG and JPG files, are made of pixels. They look fine at their original size but go blurry or blocky when enlarged.
            </p>
            <p>
              <strong>Vector</strong> files, like SVG, EPS, AI or some PDFs, are made of shapes and lines, so they stay sharp at any size.
            </p>
            <p>For printing on kit, a vector file or a large, high-quality image gives the cleanest result. If you order custom kit, we'll tell you if we need a different file.</p>
          </>
        ),
      },
      {
        q: 'Can you make kit from my own design?',
        a: (
          <>
            Get in touch through our <Link to="/contact">contact page</Link> with your design or ideas, and we'll talk you through the options.
          </>
        ),
      },
    ],
  },
  {
    title: 'Club shops',
    items: [
      {
        q: 'What is a club shop?',
        a: "A club shop is your club's own page where players, parents and fans order kit direct, in their own size, so nobody has to collect orders and payments.",
      },
      {
        q: 'How do I find or set up a club shop?',
        a: (
          <>
            Search for your club on our <Link to="/club-shop">Club Shop page</Link>. If your club doesn't have one yet, <Link to="/contact">contact us</Link> to talk about setting one up.
          </>
        ),
      },
    ],
  },
]
