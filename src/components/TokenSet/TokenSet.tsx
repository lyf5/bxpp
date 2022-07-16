import { useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom' 
import { utils, BigNumber, constants } from 'ethers'
import { useWeb3React } from '@web3-react/core'
import {
  Spinner,
  Box,
  Card,
  Image,
  Text,
  Heading,
  Divider,
  NavLink,
} from 'theme-ui'

import { useAppState } from '../../state'
import { formatPriceEth, toShort } from '../../utils'

export type TokenSetProps = {
  id: string
  image: string
  floorPrice: BigNumber
  name: string
  createdBy: string
}

export type TokenSetCompProps = {
  tokenSet: TokenSetProps
}

const TokenSet = ({ tokenSet }: TokenSetCompProps) => {
  const navigate = useNavigate()
  const location = useLocation()

  const { ethPrice } = useAppState()

  const tokenPriceEth = formatPriceEth(tokenSet.floorPrice, ethPrice)

  const { setContract, setUser, setContractCreator, setContractID, getUserTokens } = useAppState(
    useCallback(
      ({ setContract, setUser, setContractCreator, setContractID, getUserTokens }) => ({
        setContract,
        setUser,
        setContractCreator,
        setContractID,
        getUserTokens,
      }),
      []
    )
  )
  
  const { library, chainId, account } = useWeb3React()
  

  if (!tokenSet)
    return (
      <Card variant="nft">
        <Spinner />
      </Card>
    )

  const priceText = "Floor Price"

  return (
    <NavLink
            sx={{
              pointerEvents: location.pathname === '/Marketplace' ? 'none' : 'visible',
              color: location.pathname === '/Marketplace' ? 'green' : 'white',
            }}
            onClick={async () => {
              if (!chainId || !account || !library) return
              setContractCreator(tokenSet.createdBy)
              setContractID(tokenSet.id);
              
              await setContract(library, chainId, tokenSet.createdBy, tokenSet.id);
              setUser(library, account);
              getUserTokens();
              
              switch(window.location.pathname) {
                case "/": navigate('/Marketplace'); break;
                case "/profile": navigate('/MyNFTs'); break;
                case "/Mintplace": navigate('/Mint'); break;
                default: console.log("Something wrong in switch page location"); break;
              }
              
            }}
          >
      <Card variant="nft" onClick={() => console.log('price')}>
        <Image
          sx={{ width: '100%', bg: 'white', borderBottom: '1px solid black' }}
          src={tokenSet.image}
        />
        <Box p={3} pt={2}>
          <Heading as="h2">{tokenSet.name}</Heading>
          <Divider variant="divider.nft" />
          <Box>
            <Text sx={{ color: 'lightBlue', fontSize: 1, fontWeight: 'bold' }}>
              {priceText}
            </Text>
            <Heading as="h3" sx={{ color: 'green', m: 0, fontWeight: 'bold' }}>
              {constants.EtherSymbol} {Number(utils.formatEther(tokenSet.floorPrice)).toFixed(2)}{' '}
              <Text sx={{ color: 'navy' }} as="span" variant="text.body">
                ({tokenPriceEth})
              </Text>
            </Heading>
            {tokenSet.id && typeof tokenSet.id === 'string'  && (
              <Box mt={2}>
                <Text as="p" sx={{ color: 'lightBlue', fontSize: 1, fontWeight: 'bold' }}>
                  Contract Address
                </Text>
                <NavLink
                  target="_blank"
                  href={`https://rinkeby.etherscan.io/address/${tokenSet.id}`}
                  variant="owner"
                  style={{
                    textOverflow: 'ellipsis',
                    width: '100%',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {toShort(tokenSet.id)}
                </NavLink>
                <Text as="p" sx={{ color: 'lightBlue', fontSize: 1, fontWeight: 'bold' }}>
                  Created By:
                </Text>
                <NavLink
                  target="_blank"
                  href={`https://rinkeby.etherscan.io/address/${tokenSet.createdBy}`}
                  variant="owner"
                  style={{
                    textOverflow: 'ellipsis',
                    width: '100%',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {toShort(tokenSet.createdBy)}
                </NavLink>
              </Box>
            )}
          </Box>
        </Box>
      </Card>
    </NavLink>
  )
}

export { TokenSet }
