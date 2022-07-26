import { AbstractConnector } from '@web3-react/abstract-connector'
import { Flex, Button, Spinner, Image } from 'theme-ui'
import { useWeb3React } from '@web3-react/core'
import { ConnectorNames, connectorsByName } from '../../connectors'
import { useAppState } from '../../state'

const iconsMap = {
  [ConnectorNames.Metamask]: 'https://docs.metamask.io/metamask-fox.svg',
  [ConnectorNames.WalletConnect]:
    'https://raw.githubusercontent.com/WalletConnect/walletconnect-assets/b9644035864fb4b6d6ed55e0f67ad302377bd6f1/svg/original/walletconnect-logo.svg',
}

const Login = () => {
  const { activatingConnector, setActivatingConnector } = useAppState()
  const { connector, activate } = useWeb3React()
  console.log("for debug. start login");
  return (
    <Flex sx={{ justifyContent: 'center' }}>
      {Object.keys(connectorsByName).map((name: string) => {
        // console.log("for debug. connectorsByName", connectorsByName[name as keyof typeof connectorsByName]);
        const currentConnector = connectorsByName[name as keyof typeof connectorsByName]
        const activating = currentConnector === activatingConnector
        const connected = currentConnector === connector

        return (
          <Button
            mt={2}
            mr={2}
            variant="connect"
            sx={{
              borderColor: activating ? 'orange' : connected ? 'green' : 'unset',
              position: 'relative',
              maxWidth: 250,
            }}
            key={name}
            onClick={() => {
              setActivatingConnector(currentConnector)
              console.log("for debug. start setActivatingConnector");
              activate(connectorsByName[name as keyof typeof connectorsByName] as AbstractConnector)
              console.log("for debug. start activate", connectorsByName);
            }}
          >
            {iconsMap[name as keyof typeof connectorsByName] && (
              <Image
                sx={{ width: 35, height: 35 }}
                mr={3}
                src={iconsMap[name as keyof typeof connectorsByName]}
              />
            )}

            {name}
            {activating && <Spinner size={20} color="white" sx={{ ml: 3 }} />}
          </Button>
        )
      })}
    </Flex>
  )
}

export { Login }
