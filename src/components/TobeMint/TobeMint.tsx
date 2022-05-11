import { BigNumber, utils } from 'ethers'
import { useCallback, useEffect, useState } from 'react'
import { Box, Button, Flex, Grid, Heading } from 'theme-ui'
import { useAppState } from '../../state'
import { Token } from '..'
import { Form } from 'react-bootstrap';

export type TobeMintProps = {}
type StateOrder = 'price' | 'alpha'

export const TobeMint = () => {
  const { tokensOnMint, setItemBuffer, upToIPFS } = useAppState()
  const updateTokensOnMint = useAppState(
    useCallback(({ updateTokensOnMint }) => updateTokensOnMint, [])
  )

  const [order, setOrder] = useState<StateOrder>('alpha')

  useEffect( () => { updateTokensOnMint() }, [updateTokensOnMint] );

  const captureFile = (event: any) => {
    console.log("for debug. buffer: ");
    event.stopPropagation()
    event.preventDefault()
    const file = event.target.files[0]
    let reader = new window.FileReader()
    reader.readAsArrayBuffer(file)
    reader.onloadend = () => {convertToBuffer(reader)}
  };

  const convertToBuffer = async(reader: any) => {
    //file is converted to a buffer to prepare for uploading to IPFS
      const buffer = await Buffer.from(reader.result);
    //set this buffer -using es6 syntax
      setItemBuffer(buffer);
  };

  return (
    <Box>
      <Flex sx={{ alignItems: 'center' }} mb={1}>
        <Heading as="h1">Mintplace</Heading>
        <Flex ml={3}>
        <Form>
           <input 
              type = "file"
              onChange = {captureFile} 
            />
           <input  
              type = "button" 
              value = "Create New Item"
              onClick = {upToIPFS} 
           /> 
       
        </Form>
        </Flex>
      </Flex>
      
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
        {tokensOnMint
          ?.sort((a, b) =>
            order === 'alpha'
              ? BigNumber.from(a.id)
                  .toString()
                  .localeCompare(BigNumber.from(b.id).toString(), undefined, { numeric: true })
              : Number(utils.formatEther(a.price.sub(b.price)))
          )
          .map((i, index) => (
            <Token onMint={true} token={i} key={index} />
          ))}
      </Grid>
    </Box>
  )
}

