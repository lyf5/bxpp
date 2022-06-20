
import create from 'zustand'
import { BigNumber, Contract, utils, Event } from 'ethers'
import IpfsClient from 'ipfs-http-client'

import { TokenProps } from '../components/Token'
import { METADATA_API } from '../utils'
import { ContractPropsDetails, UserProps } from '../types'
// import { conflicts, string } from 'yargs'
import { TokenSetProps } from '../components'


export interface StateContext {
  isAuthenticated: boolean
  contract?: Contract
  contractDetails?: ContractPropsDetails
  user?: UserProps
  itemBuffer?: Buffer
  tokensOnSale?: TokenProps[]
  contractsOnMarket?: TokenSetProps[]
  tokensOnMint?: TokenProps[]
  ethPrice?: string
  contractCreator?: string
  contractID?: string
  activatingConnector?: any
  transaction?: any
  library?: any

  setAuthenticated(authenticated: boolean): void
  setContract(library: any, chainId: number, contractFileName: string, creator: string): void
  setTokensOnSale(tokensOnSale: TokenProps[]): void
  setContractsOnMarket(contractsOnMarket: TokenSetProps[]): void
  setTokensOnMint(tokensOnMint: TokenProps[]): void
  setEthPrice(ethPrice: string): void
  setContractCreator(contractCreator: string): void
  setContractID(contractID: string): void
  setActivatingConnector(activatingConnector: any): void
  setTransaction(transaction?: any): void
  setItemBuffer(bufferTemp?: Buffer): void
  //
  buyToken(id: string, price: BigNumber): void
  mintToken(price: BigNumber, tokenname: string, tokenpath: string, from?: string): void
  withdrawItem(imagePath: string): void
  setUser(library?: any, address?: string): void
  updateTokensOnSale(): Promise<boolean>
  updateContractsOnMarket(): Promise<boolean>
  updateTokensOnMint(): Promise<boolean>
  upToIPFS(): void;
  setTokenSale(id: string, price: BigNumber, onSale: boolean): Promise<boolean>
  transferToken(id: string, to: string): void
  getUserTokens(address?: string): Promise<TokenProps[]>
}

const useAppState = create<StateContext>((set, get) => ({
  isAuthenticated: false,
  contract: undefined,
  user: undefined,
  itemBuffer: undefined,
  tokensOnSale: [],
  contractsOnMarket: [],
  tokensOnMint: [],
  ethPrice: '0.0',
  activatingConnector: undefined,
  transaction: undefined,

  setAuthenticated: (authenticated: boolean) => set({ isAuthenticated: authenticated }),
  setItemBuffer: (bufferTemp?: Buffer) => set({ itemBuffer: bufferTemp}),
  setContract: async (library: any, chainId: number, contractCreator: string, contractID: string) => {
    try {
      if (!library) throw new Error('No Web3 Found')

      var contractJSON = await import(`../contracts/${contractCreator}/${contractID}.json`);

      const networkid = (id: number) => {
        switch (id) {
          case 1337:
            return 5777
          default:
            return id
        }
      }
      const deployedNetwork =
      contractJSON.networks[String(networkid(chainId)) as keyof typeof contractJSON.networks]

      if (!deployedNetwork) {
        throw new Error('The network you selected is no supported yet.')
      }

      const { address } = deployedNetwork
      
      const contract = new Contract(address, contractJSON.abi, library.getSigner())

      const name = await contract.name()
      const symbol = await contract.symbol()

      set({
        library,
        contract,
        contractDetails: {
          name,
          symbol,
          address,
        },
      })
    } catch (e) {
      console.log(e)
    }
  },
  setUser: async (library?: any, address?: string) => {
    try {
      const { user, getUserTokens } = get()

      if (!library) throw new Error('No Web3 Found')
      if (!user && !address) throw new Error('No user found')

      await set({ library })

      const balance = utils.formatEther(await library.getBalance(address || user?.address || ''))
      const ownedTokens = await getUserTokens(address || user?.address || '')

      set({
        isAuthenticated: true,
        user: { address: address || user?.address || '', balance, ownedTokens },
      })
    } catch (e) {
      console.log(e)
    }
  },
  setTokensOnSale: (tokensOnSale: TokenProps[]) => set({ tokensOnSale: tokensOnSale }),
  setContractsOnMarket: (contractsOnMarket: TokenSetProps[]) => set({ contractsOnMarket: contractsOnMarket }),
  setTokensOnMint: (tokensOnMint: TokenProps[]) => set({ tokensOnMint: tokensOnMint }),

  setEthPrice: (ethPrice: string) => set({ ethPrice: ethPrice }),
  setContractCreator: (contractCreator: string) => set({ contractCreator: contractCreator }),
  setContractID: (contractID: string) => set({ contractID: contractID }),
  setActivatingConnector: (activatingConnector: any) =>
    set({ activatingConnector: activatingConnector }),
  setTransaction: (transaction: any) => set({ transaction: transaction }),

  //
  getUserTokens: async (address?: string): Promise<TokenProps[]> => {
    try {
      const { contract, library, user } = get()

      if (!library) throw new Error('No Web3 Found')
      if (!contract) throw new Error('No contract found')
      if (!user?.address && !address) throw new Error('No user found')

      const userAddress = address ||user?.address || ''
      // console.log("for debug. User address:", address)

      const ownedTokensEvents = contract.filters.Transfer(null, userAddress)
      const results: Event[] = await contract.queryFilter(ownedTokensEvents, 0, 'latest')

      const ownedTokens: Map<string, TokenProps> = new Map()
      await Promise.all(
        results.map(async current => {
          const ownerToken = await contract.ownerOf(current.args?.tokenId)

          if (ownerToken === userAddress) {
            const { id, name, price, image } = await contract.tokenMeta(current.args?.tokenId)
            const uri = await contract.tokenURI(current.args?.tokenId)
            ownedTokens.set(uri, {
              id,
              name,
              price,
              image,
            })
          }
        })
      )

      return Array.from(ownedTokens).map(([_, token]) => token)
    } catch (e) {
      console.log(e)
      return []
    }
  },

  buyToken: async (id: string, price: BigNumber) => {
    try {
      const { setTransaction, contract } = get()
      if (!contract) throw new Error('No contract found')
      const tx = await contract.purchaseToken(id, { value: price })
      setTransaction(tx)
    } catch (e) {
      console.log('on buy', e)
    }
  },

  mintToken: async (price: BigNumber, tokenname: string, tokenpath: string, FROM?: string) => {
    try {
      const { setTransaction, contract, library, user } = get()
      const { contractCreator, contractID } = useAppState.getState()

      if (!library) throw new Error('No Web3 Found')
      if (!contract) throw new Error('No contract found')
      if (!user?.address && !FROM) throw new Error('No user found')

      const userAddress = FROM || user?.address || ''

      const tx = await contract.mintCollectable(userAddress, price, tokenname, tokenpath, { from: userAddress, value: price });
      console.log("for debug. tx in state.mintToken", tx);
      setTransaction(tx)
      const index = await contract.totalSupply();

      const response = await (
        await fetch(`${METADATA_API}/updateItem`, {
          method: 'POST',
          body: JSON.stringify({"index":`${index}`, "tokenpath":tokenpath, contractCreator: contractCreator, contractID: contractID}),
        })
      ).json()
      console.log('for debug. response: ', response)
    } catch (e) {
      console.log('on mint', e)
    }
  },

  withdrawItem: async (imagePath: string) => {
    try {   
      const { setTransaction } = get()
      const { contractCreator, contractID } = useAppState.getState()

      console.log("for debug. imagePath: ", imagePath);
  
      const response = await (
        await fetch(`${METADATA_API}/deleteItem`, {
          method: 'POST',
          body: JSON.stringify({ imagePath: imagePath, contractCreator: contractCreator, contractID: contractID}),
        })
      ).json()
      setTransaction();
  
      console.log("for debug. response: ", response); 

    } catch (e) {
      console.log(e);
    }
  },
  //
  updateTokensOnSale: async () => {
    try {
      const { contract, setTokensOnSale } = get()
      if (!contract) throw new Error('No contract found')

      console.log("for debug. come state.updateTokensOnSale!");

      const tokensForSale = (await contract.getAllOnSale()).reduce((acc: TokenProps[], b: any) => {
        if (b.image !== '') {
          acc.push({ id: b.id, image: b.image, price: b.price, name: b.name})
        }

        return acc
      }, [] as TokenProps[])
      setTokensOnSale(tokensForSale)
      return true
    } catch (e) {
      console.log(e)
      return false
    }
  },

  updateContractsOnMarket: async () => {
    try {
      const { setContractsOnMarket } = get()

      console.log("for debug. come state.updateContractsOnMarket!");
      var  contractsForMarket:TokenSetProps[] = [];
      var contractsForMarketTemp = (await (await fetch(`${METADATA_API}/contract`)).json());
      contractsForMarketTemp.forEach((item:any) => {    
        item.userContractList.forEach((item2:any) => {
          contractsForMarket.push({ id: item2, image: "testimage", floorPrice:  BigNumber.from(0), name: "testname", createdBy: item.userAddress});
        })
      });

      console.log("for debug. contractsForMarket", contractsForMarket);

      setContractsOnMarket(contractsForMarket);
      return true
    } catch (e) {
      console.log(e)
      return false
    }
  },

  updateTokensOnMint: async () => {
    try {
      const { setTokensOnMint } = get()
      const { contractCreator, contractID } = useAppState.getState()

      const currentTokens =  await (
        await fetch(`${METADATA_API}/token`, {
          method: 'POST',
          body: JSON.stringify({ contractCreator: contractCreator, contractID: contractID}),
        })
      ).json()

      const tokensForMint = currentTokens.reduce((acc: TokenProps[], b: any) => {
        if (b.image !== '') {
          acc.push({ id: b.id, image: b.image, price: utils.parseEther(b.mintPrice), name: b.name})
        }

        return acc
      }, [] as TokenProps[])

      setTokensOnMint(tokensForMint)
      // console.log("for debug. come to updateTokensOnMint! tokensForMint:", tokensForMint);
      return true
    } catch (e) {
      console.log(e)
      return false
    }
  },

  upToIPFS: async () => {
    const { itemBuffer, setItemBuffer } = get()
    if (!itemBuffer || itemBuffer.length === 0) return;
    console.log("for debug. itemBuffer: ", itemBuffer);

    const client = IpfsClient({
      host: process.env.REACT_APP_HOST,
      port: Number(process.env.REACT_APP_PORT),
      protocol: process.env.REACT_APP_PROTOCOL,
      headers: {
        authorization: `Basic ${Buffer.from(
          `${process.env.REACT_APP_PROJECT_ID}:${process.env.REACT_APP_PROJECT_SECRET}`
        ).toString('base64')}`,
      },
    });
    
    try {   
      const { path } = await client.add({content: itemBuffer}); 
      const { contractCreator, contractID } = useAppState.getState()
      console.log("for debug. ipfsPath: ", path);
  
      const response = await (
        await fetch(`${METADATA_API}/addItem`, {
          method: 'POST',
          body: JSON.stringify({path: path, contractCreator: contractCreator, contractID: contractID}),
        })
      ).json()
  
      console.log("for debug. response: ", response);
      setItemBuffer(Buffer.from(''));  // 上传完成后将buffer置空，      

    } catch (e) {
      console.log(e);
    }
  },

  //
  setTokenSale: async (id: string, price: BigNumber, onSale: boolean = false) => {
    try {
      const { contract, user, setTransaction } = get()
      if (!contract) throw new Error('No contract found')
      if (!user) throw new Error('No user found')

      const tx = await contract.setTokenSale(id, onSale, price, { from: user.address })
      setTransaction(tx)
      return true
    } catch (e) {
      console.log(e)
      return false
    }
  },
  //
  transferToken: async (id: string, to: string) => {
    try {
      const { contract, user, setTransaction } = get()
      if (!contract) throw new Error('No contract found')
      if (!user) throw new Error('No user found')

      const tx = await contract['safeTransferFrom(address,address,uint256)'](user.address, to, id, {
        from: user.address,
      })

      // console.log(tx)
      setTransaction(tx)
    } catch (e) {
      console.log(e)
    }
  }, 
  
}))

export { useAppState }

// const getAllTokens = async ({ contract }: Props) => {
//   try {
//     const logs = await contract.provider.getLogs({
//       address: contract.address,
//       fromBlock: 0,
//       toBlock: 'latest',
//     })

//     const decoder = new utils.AbiCoder()

//     console.log(contract)

//     const tokens = await Promise.all<TokenProps>(
//       await logs.reduce<any>(async (acc: TokenProps[], log: Log) => {
//         const [from] = decoder.decode(['address'], log.topics[1])

//         const list = await acc

//         if (from === utils.getAddress('0x0000000000000000000000000000000000000000')) {
//           const tokenId =
//             log.topics && log.topics[3]
//               ? utils.formatUnits(BigNumber.from(log.topics[3]), 'wei')
//               : undefined

//           const token = tokenId && (await contract.tokenMeta(tokenId))
//           if (token) {
//             list.push(token)
//           }
//         }
//         return list
//       }, Promise.resolve([]) as Promise<TokenProps[]>)
//     )

//     return tokens
//   } catch (e) {
//     console.log(e)
//   }
// }
