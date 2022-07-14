import { useNavigate, useLocation } from 'react-router-dom'
import { Box, NavLink, Flex, Heading, Image } from 'theme-ui'
import { useAppState } from '../../state'
import { UserMenu } from '..'

export type HeaderProps = {
  //
}

const Header = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const { user, isAuthenticated } = useAppState()

  return (
    <Box bg="black">
      <Flex sx={{ alignItems: 'center', p: 3 }} as="nav">
        <Image
          onClick={() => {
            navigate('/')
          }}
          sx={{ width: 50, cursor: 'pointer' }}
          src="/static/logo.png"
        />
        <Heading sx={{ ml: [1, 2], color: 'white' }} as="h4">
          Bai Xue Piao Piao NFT Marketplace{' '}
          
        </Heading>
        <UserMenu />
      </Flex>
      {isAuthenticated && user && (
        <Flex bg="midGray" py={3} sx={{ justifyContent: 'center' }}>
          <NavLink
            sx={{
              pointerEvents: location.pathname === '/Mintplace' ? 'none' : 'visible',
              color: location.pathname === '/Mintplace' ? 'green' : 'white',
            }}
            onClick={() => navigate('/Mintplace')}
          >
            BXPP Mintplace
          </NavLink>
          <Box sx={{ width: 50 }} />
          <NavLink
            sx={{
              pointerEvents: location.pathname === '/' ? 'none' : 'visible',
              color: location.pathname === '/' ? 'green' : 'white',
            }}
            onClick={() => navigate('/')}
          >
            BXPP Marketplace
          </NavLink>
          <Box sx={{ width: 50 }} />
          <NavLink
            sx={{
              pointerEvents: location.pathname === '/profile' ? 'none' : 'visible',
              color: location.pathname === '/profile' ? 'green' : 'white',
            }}
            onClick={() => navigate('/profile')}
          >
            My BXPP
          </NavLink>
          <Box sx={{ width: 50 }} />
          <NavLink
            sx={{
              pointerEvents: location.pathname === '/createTokenSet' ? 'none' : 'visible',
              color: location.pathname === '/createTokenSet' ? 'green' : 'white',
            }}
            onClick={() => navigate('/createTokenSet')}
          >
            Create NFT
          </NavLink>
        </Flex>
      )}
    </Box>
  )
}

export { Header }
