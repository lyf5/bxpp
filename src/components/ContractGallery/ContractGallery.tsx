import { utils } from 'ethers'
import { useCallback, useEffect, useState } from 'react'
import { Box, Button, Flex, Grid, Heading } from 'theme-ui'
import { useAppState } from '../../state'
import { TokenSet } from '..'

export type ContractGalleryProps = {}
type StateOrder = 'price' | 'alpha'

const ContractGallery = () => {
  const { contractsOnMarket } = useAppState()
  const updateContractsOnMarket = useAppState(
    useCallback(({ updateContractsOnMarket }) => updateContractsOnMarket, [])
  )

  const [order, setOrder] = useState<StateOrder>('alpha')

  useEffect(() => {
    updateContractsOnMarket()
  }, [updateContractsOnMarket])

  return (
    <Box>
      <Heading as="h1">Marketplace: All Contracts</Heading>
      <Flex sx={{ alignItems: 'center' }} mb={3}>
        <Heading as="h3" sx={{ color: 'lightGray' }}>
          Order:
        </Heading>
        <Flex ml={3}>
          <Button
            mr={2}
            onClick={() => setOrder('alpha')}
            variant="filter"
            disabled={order === 'alpha'}
          >
            Alphabetically
          </Button>
          <Button onClick={() => setOrder('price')} variant="filter" disabled={order === 'price'}>
            Price
          </Button>
        </Flex>
      </Flex>
      <Grid gap={4} columns={['1fr 1fr', '1fr 1fr', '1fr 1fr 1fr']}>
        {contractsOnMarket
          ?.sort((a, b) =>
            order === 'alpha'
              ? a.name
                  .localeCompare(b.name, undefined, { numeric: true })
              : Number(utils.formatEther(a.floorPrice.sub(b.floorPrice)))
          )
          .map((i, index) => (
            <TokenSet tokenSet={i} key={index} />
          ))}
      </Grid>
    </Box>
  )
}

export { ContractGallery }
