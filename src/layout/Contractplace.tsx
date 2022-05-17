import { useWeb3React } from '@web3-react/core'
import { ContractGallery, Login } from '../components'
import { useAppState } from '../state'

const Contractplace = () => {
  const { user } = useAppState()
  const { active } = useWeb3React()

  return (
    <>
      {!user && <Login />}
      {user && active && <ContractGallery />}
    </>
  )
}

export { Contractplace }
