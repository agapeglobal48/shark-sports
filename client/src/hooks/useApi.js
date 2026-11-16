import { useEffect, useState } from 'react'

/**
 * Runs an async API call and tracks { data, loading, error }.
 * Re-runs whenever `key` changes (pass a string built from the inputs, e.g. the query string).
 */
export function useApi(fetcher, key) {
  const [state, setState] = useState({ data: null, loading: true, error: null, key: undefined })

  useEffect(() => {
    let alive = true
    fetcher()
      .then((data) => alive && setState({ data, loading: false, error: null, key }))
      .catch((error) => alive && setState({ data: null, loading: false, error, key }))
    return () => {
      alive = false
    }
    // `key` stands in for the fetcher's inputs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  // While a new key is loading, keep showing the previous data but flag loading.
  return { ...state, loading: state.key !== key || state.loading }
}
