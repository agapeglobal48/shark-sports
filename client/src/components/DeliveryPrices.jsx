import { Link } from 'react-router-dom'
import { api } from '../api/client.js'
import { useApi } from '../hooks/useApi.js'
import { formatPrice } from '../lib/format.js'

/** Live delivery prices from the shop's checkout settings. */
export default function DeliveryPrices() {
  const { data: config } = useApi(api.checkoutConfig, 'checkout-config')
  const standard = formatPrice(config?.standardShippingPence ?? 399)
  const freeOver = formatPrice(config?.freeShippingOverPence ?? 5000).replace('.00', '')
  return (
    <>
      Standard UK delivery is {standard}, and free on orders over {freeOver}. Dispatch and delivery times are on our <Link to="/delivery">delivery page</Link>.
    </>
  )
}
