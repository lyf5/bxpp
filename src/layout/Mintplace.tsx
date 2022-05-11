import { useWeb3React } from '@web3-react/core'
import { TobeMint } from '../components/TobeMint'
import { Login } from '../components'
import { useAppState } from '../state'

const Mintplace = () => {
  const { user } = useAppState();
  const { active } = useWeb3React()

  return (
    <>
      {!user && <Login />}
      {user && active && <TobeMint />}
    </>
  )
}

export { Mintplace }
