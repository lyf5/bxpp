import { FC, useEffect, useCallback } from 'react'
import { useWeb3React, UnsupportedChainIdError } from '@web3-react/core'
import {
  NoEthereumProviderError,
  UserRejectedRequestError as UserRejectedRequestErrorInjected,
} from '@web3-react/injected-connector'
import { UserRejectedRequestError as UserRejectedRequestErrorWalletConnect } from '@web3-react/walletconnect-connector'

import { Container, Text, Heading } from 'theme-ui'
import useSWR from 'swr'
import { useEagerConnect, useInactiveListener } from '../hooks/web3'
import { ETHSCAN_API } from '../utils'
import { fetcherETHUSD } from '../utils/fetchers'
import { useAppState } from '../state'

function getErrorMessage(error: Error) {
  console.log(error)

  if (error instanceof NoEthereumProviderError) {
    return 'No Ethereum browser extension detected, install MetaMask on desktop or visit from a dApp browser on mobile.'
  } else if (error instanceof UnsupportedChainIdError) {
    return "You're connected to an unsupported network. Please connect to Rinkeby network"
  } else if (
    error instanceof UserRejectedRequestErrorInjected ||
    error instanceof UserRejectedRequestErrorWalletConnect
  ) {
    return 'Please authorize this website to access your Ethereum account.'
  } else {
    console.error(error)
    return 'An unknown error occurred. Check the console for more details.'
  }
}

const Connect: FC = ({ children }) => {
  console.log("for debug. Start connect");
  const { activatingConnector } = useAppState()
  const { library, chainId, account, error } = useWeb3React()

  const { setUser } = useAppState(
    useCallback(
      ({ setUser }) => ({
        setUser,
      }),
      []
    )
  )

  useSWR(ETHSCAN_API, fetcherETHUSD)

  useEffect(() => {
    if (!chainId || !account || !library) return

    const update = async () => {
      try {
        setUser(library, account)
        console.log("for debug. Start setUser in update.");
      } catch (e) {
        console.log(e)
      }
    }
    update()
  }, [chainId, account, library, setUser])

  const triedEager = useEagerConnect()
  console.log("for debug. triedEager: ", triedEager);
  console.log("for debug. activatingConnector: ", activatingConnector);
  useInactiveListener(!triedEager || !!activatingConnector)
  console.log("for debug. End of connect");
  return (
    <>
      {error ? (
        <Container>
          <Heading as="h2">❌ Something is not right</Heading>
          <Text sx={{ mt: 3 }}>{getErrorMessage(error)}</Text>
        </Container>
      ) : (
        children
      )}
    </>
  )
}

export { Connect }
