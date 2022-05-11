import BXPP from '../contracts/BXPP.json'
import create from 'zustand'
import { BigNumber, Contract, utils, Event } from 'ethers'
import IpfsClient from 'ipfs-http-client'

import { TokenProps } from '../components/Token'
import { METADATA_API } from '../utils'
import { ContractPropsDetails, UserProps } from '../types'
import { conflicts, string } from 'yargs'

export interface StateContext {
  isAuthenticated: boolean
  contract?: Contract
  contractDetails?: ContractPropsDetails
  user?: UserProps
  itemBuffer?: Buffer
  tokensOnSale?: TokenProps[]
  tokensOnMint?: TokenProps[]
  ethPrice?: string
  activatingConnector?: any
  transaction?: any
  library?: any

  setAuthenticated(authenticated: boolean): void
  setContract(library: any, chainId: number): void
  setTokensOnSale(tokensOnSale: TokenProps[]): void
  setTokensOnMint(tokensOnMint: TokenProps[]): void
  setEthPrice(ethPrice: string): void
  setActivatingConnector(activatingConnector: any): void
  setTransaction(transaction?: any): void
  setItemBuffer(bufferTemp?: Buffer): void
  //
  buyToken(id: string, price: BigNumber): void
  mintToken(price: BigNumber, tokenname: string, tokenpath: string, from?: string): void
  withdrawItem(imagePath: string): void
  setUser(address?: string): void
  updateTokensOnSale(): Promise<boolean>
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
  tokensOnMint: [],
  ethPrice: '0.0',
  activatingConnector: undefined,
  transaction: undefined,

  setAuthenticated: (authenticated: boolean) => set({ isAuthenticated: authenticated }),
  setItemBuffer: (bufferTemp?: Buffer) => set({ itemBuffer: bufferTemp}),
  setContract: async (library: any, chainId: number) => {
    try {
      if (!library) throw new Error('No Web3 Found')

      const networkid = (id: number) => {
        switch (id) {
          case 1337:
            return 5777
          default:
            return id
        }
      }
      const deployedNetwork =
        BXPP.networks[String(networkid(chainId)) as keyof typeof BXPP.networks]

      if (!deployedNetwork) {
        throw new Error('The network you selected is no supported yet.')
      }

      const { address } = deployedNetwork
      const contract = new Contract(address, BXPP.abi, library.getSigner())

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
  setUser: async (address?: string) => {
    try {
      const { contract, user, library, getUserTokens } = get()

      if (!library) throw new Error('No Web3 Found')
      if (!contract) throw new Error('No contract found')
      if (!user && !address) throw new Error('No user found')

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
  setTokensOnMint: (tokensOnMint: TokenProps[]) => set({ tokensOnMint: tokensOnMint }),

  setEthPrice: (ethPrice: string) => set({ ethPrice: ethPrice }),
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
          body: JSON.stringify({"index":`${index}`, "tokenpath":tokenpath}),
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

      console.log("for debug. imagePath: ", imagePath);
  
      const response = await (
        await fetch(`${METADATA_API}/deleteItem`, {
          method: 'POST',
          body: JSON.stringify( imagePath ),
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

  updateTokensOnMint: async () => {
    try {
      const { setTokensOnMint } = get()

      const currentTokens = await (await fetch(`${METADATA_API}/token`)).json()

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
      host: "ipfs.infura.io",
      port: Number("5001"),
      protocol: "https",
      headers: {
        authorization: `Basic ${Buffer.from(
          // eslint-disable-next-line no-useless-concat
          "27BJI5914ECKwyqJvs8hMe2ioIR" + ':' + "e7a3d792120ee7de41e93cab3772226b"
        ).toString('base64')}`,
      },
    });
    
    try {   
      const { path } = await client.add({content: itemBuffer}); 
      console.log("for debug. ipfsPath: ", path);
  
      const response = await (
        await fetch(`${METADATA_API}/addItem`, {
          method: 'POST',
          body: JSON.stringify( path ),
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
