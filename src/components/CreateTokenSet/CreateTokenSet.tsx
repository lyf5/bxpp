import contractJSON from '../../contracts/ContractTemplate.json'
import { useCallback } from 'react'
import { Box, Flex, Heading } from 'theme-ui'
import { useAppState } from '../../state'
import { METADATA_API } from '../../utils'
import { Form } from 'react-bootstrap';
import Web3 from 'web3';
import { ethers } from 'ethers';

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
        <Form className="myform">
          <tr>
            <td>TokenSet Name : </td>
            <Box sx={{ width: 5 }} />
            <td> 
              <input className='text1' type = "text" id="contractName" placeholder="TokenSet Name"/>
            </td>
          </tr>
          <tr>
            <td>TokenSet Symbol : </td>
            <Box sx={{ width: 5 }} />
            <td> 
              <input className='text2' type = "text" id="contractSymbol"  placeholder="TokenSet Symbol"/>
            </td>
          </tr>
          <tr>
            <td>TokenSet URI : </td>
            <Box sx={{ width: 5 }} />
            <td> 
              <input className='text3' type = "text" value="http://localhost:4000/dev/token/" id="contractURI"/>
            </td>
          </tr>
           <input  
              type = "button" 
              value = "Create New TokenSet"
              onClick={async () => {
                   
                const bodyJSON = JSON.stringify(contractJSON)
                const bodyJSON2 = JSON.parse(bodyJSON)
                
                const contractName = (document.getElementById("contractName") as HTMLInputElement).value
                const contractSymbol = (document.getElementById("contractSymbol") as HTMLInputElement).value
                const contractURI = (document.getElementById("contractURI") as HTMLInputElement).value

                console.log("for debug. Contract info: ", contractName, contractSymbol, contractURI);
                
                /***
                const web3 = new Web3(window.ethereum);
                const BXPP = new web3.eth.Contract(bodyJSON2.abi);
                await BXPP.deploy({
                  'data': bodyJSON2.bytecode,
                  'arguments': [contractName, contractSymbol, contractURI]
                })         
                .send({
                  'from': address,
                  // gas: ,
                  // gasPrice: '3000000'
                }, function(error, transactionHash){ console.log("error/transactionHash: ", error, transactionHash) })
                .on('error', function(error){ console.log("error: ", error) })
                .on('transactionHash', function(transactionHash){ console.log("transactionHash: ", transactionHash) })
                .on('receipt', function(receipt){ console.log(receipt.contractAddress) // 收据中包含了新的合约地址
                })
                .on('confirmation', function(confirmationNumber, receipt){ console.log("confirmationNumber:", confirmationNumber) })
                .then(async function(newContractInstance){
                    console.log("for debug. ContractID: ", newContractInstance.options.address); // 具有新合同地址的合约实例
                    
                    const response = await (
                      await fetch(`${METADATA_API}/addContract`, {
                        method: 'POST',
                        // body: JSON.stringify({contractCreator: "0x5516EBcD3740D81078eCC9e2e41240D5c2D7CC9a", contractID: "0x6025Fa3902113382FCB7D12CC859293F439070E6"}),
                        body: JSON.stringify({contractCreator: address, contractID: newContractInstance.options.address}),
                      })
                    ).json()
                    setContractID(newContractInstance.options.address);
                    console.log("for debug. Contract Path: ", response);
                });   
                 ***/
                
                window.ethereum.request({ method: 'eth_requestAccounts' });
                const provider = new ethers.providers.Web3Provider(window.ethereum);

                const signer = provider.getSigner()
                console.log("Account:", await signer.getAddress());
                
                const factory = new ethers.ContractFactory( bodyJSON2.abi, bodyJSON2.bytecode, signer );
                console.log("factory.signer:", factory.signer);
                const contractBXPP = await factory.deploy(contractName, contractSymbol, contractURI)
                .then(async function(contract){ 
                  console.log("for debug. Contract address: ", contract.address); // 具有新合同地址的合约实例
                    
                    const response = await (
                      await fetch(`${METADATA_API}/addContract`, {
                        method: 'POST',
                        // body: JSON.stringify({contractCreator: "0x5516EBcD3740D81078eCC9e2e41240D5c2D7CC9a", contractID: "0x6025Fa3902113382FCB7D12CC859293F439070E6"}),
                        body: JSON.stringify({contractCreator: address, contractID: contract.address}),
                      })
                    ).json()
                    setContractID(contract.address);
                    console.log("for debug. Contract Path: ", response); 
                });         
            
              }}
           /> 
       
        </Form>
        </Flex>
      </Flex>
      
    </Box>
  )
}

