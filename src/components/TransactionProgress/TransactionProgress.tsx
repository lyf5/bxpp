import { useCallback, useEffect, useRef, useState } from 'react'
import { Card, Flex, Spinner } from 'theme-ui'
import { useAppState } from '../../state'
import { toShort } from '../../utils'
import { useWeb3React } from '@web3-react/core'

const TransactionProgress = () => {
  const { setTransaction, setUser, updateTokensOnSale, updateContractsOnMarket, updateTokensOnMint, getUserTokens } = useAppState(
    useCallback(
      ({ setTransaction, setUser, updateTokensOnSale, updateContractsOnMarket, updateTokensOnMint, getUserTokens }) => ({
        setTransaction,
        setUser,
        updateTokensOnSale,
        updateContractsOnMarket,
        updateTokensOnMint,
        getUserTokens,
      }),
      []
    )
  )

  const transactionRef = useRef(useAppState.getState().transaction)
  const [loading, setLoading] = useState<boolean>(false)
  const { library } = useWeb3React()

  const update = useCallback(async () => {
    await setUser(library)
    getUserTokens();
    setTransaction(undefined)
    updateTokensOnSale()
    updateContractsOnMarket()
    updateTokensOnMint()
    setLoading(false)
  }, [setTransaction, setUser, updateTokensOnSale, library, updateContractsOnMarket, updateTokensOnMint, getUserTokens])

  useEffect(() => {
    useAppState.subscribe(async ({ transaction }) => {
      try {
        transactionRef.current = transaction
        if (!transaction) return
        setLoading(true)
        const receipt = await transaction.wait()
        if (receipt.confirmations >= 1) {
          update()
        }
      } catch (e) {
        console.log('transaction', e)
        setLoading(false)
      }
    })

    return () => {
      useAppState.destroy()
    }
  }, [update])

  if (!loading) return null

  return (
    <Card variant="transaction">
      <Flex sx={{ alignItems: 'center' }}>
        <Spinner size={20} color="white" sx={{ mr: 2 }} /> Transaction:{' '}
        {toShort(transactionRef.current.hash)}
      </Flex>
    </Card>
  )
}

export { TransactionProgress }
