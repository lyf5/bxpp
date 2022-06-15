import { useWeb3React } from '@web3-react/core'
import { ToBeMint } from '../components/ToBeMint'
import { Login } from '../components'
import { useAppState } from '../state'

const Mintplace = () => {
  const { user } = useAppState();
  const { active } = useWeb3React()

  return (
    <>
      {!user && <Login />}
      {user && active && <ToBeMint />}
    </>
  )
}

export { Mintplace }
