import { useCallback, useEffect, useState } from 'react'

import { useConnectedWeb3Context } from '../../contexts'
import { RemoteData } from '../../util/remote_data'

/**
 * Return details about a user's proxy contract
 * proxyIsUpToDate: Has the proxy implementation been upgraded to the target implementation
 */
export const useCpkProxy = (isNative = false) => {
  const { cpk } = useConnectedWeb3Context()

  const [proxyIsUpToDate, setUpdated] = useState<RemoteData<boolean>>(RemoteData.notAsked())

  const fetchUpdated = useCallback(async () => {
    if (cpk) {
      const updated = await cpk.proxyIsUpToDate(isNative)
      setUpdated(RemoteData.success(updated))
    }
  }, [cpk, isNative])

  const updateProxy = useCallback(async () => {
    if (cpk) {
      setUpdated(proxyIsUpToDate => RemoteData.load(proxyIsUpToDate))
      try {
        await cpk.upgradeProxyImplementation()
        setUpdated(RemoteData.success(true))
      } catch (e) {
        setUpdated(RemoteData.failure(e))
      }
    }
  }, [cpk])

  useEffect(() => {
    fetchUpdated()
    // eslint-disable-next-line
  }, [cpk?.address])

  return {
    proxyIsUpToDate,
    updateProxy,
  }
}
