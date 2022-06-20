import contractJSON from '../../contracts/BXPP.json'
import { useCallback } from 'react'
import { Box, Flex, Heading } from 'theme-ui'
import { useAppState } from '../../state'
import { METADATA_API } from '../../utils'
import { Form } from 'react-bootstrap';
import Web3 from 'web3';

export const CreateTokenSet = () => {  
  const { user } = useAppState()
  const { setContractID } = useAppState(
    useCallback(
      ({ setContractID }) => ({
        setContractID,
      }),
      []
    )
  )  

  if (!user) return null
  const { address } = user

  return (
    <Box>
      <Flex sx={{ alignItems: 'center' }} mb={1}>
        <Heading as="h1">Create New TokenSet</Heading>
        <Flex ml={3}>
        <Form>
           <input 
              className='te'
              type = "text"
              value="Please input TokenSet name."
              id="tex"
              // onChange = {captureFile2} 
            />
           <input  
              type = "button" 
              value = "Create New TokenSet"
              onClick={async () => {

                const web3 = new Web3(window.ethereum);
                
                const bodyJSON = JSON.stringify(contractJSON)
                const bodyJSON2 = JSON.parse(bodyJSON)
                var BXPP = new web3.eth.Contract(bodyJSON2.abi);
                /*
                await BXPP.deploy({
                  data: bodyJSON2.bytecode,
                  arguments: ['BXPP17', 'BXPPtest17',"http://localhost:4000/dev/token/" ]
                })                
                .send({
                  from: address,
                  // gas: ,
                  // gasPrice: '3000000'
                })
                .then(function(newContractInstance){
                    console.log("for debug. ContractID: ", newContractInstance.options.address); // 具有新合同地址的合约实例
                    setContractID(newContractInstance.options.address)
                });

                const { contractID } = useAppState.getState()
                */
                const response = await (
                  await fetch(`${METADATA_API}/addContract`, {
                    method: 'POST',
                    body: JSON.stringify({contractCreator: "0x0416EBcD3740D81078eCC9e2e41240D5c2D7CC9a", contractID: "0x7f25Fa3902113382FCB7D12CC859293F439070E6"}),
                  })
                ).json()
              }}
           /> 
       
        </Form>
        </Flex>
      </Flex>
      
    </Box>
  )
}

