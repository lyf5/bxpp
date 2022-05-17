import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Web3ReactProvider } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'

import { Contractplace, Marketplace, Mintplace, Profile, Connect } from './'
//import { Header, PrivateRoute, TransactionProgress } from '../components'
import { Header, TransactionProgress } from '../components'
import { Container } from 'theme-ui'

function getLibrary(provider: any): Web3Provider {
  const library = new Web3Provider(provider)
  library.pollingInterval = 12000
  return library
}

const Root = () => {
  return (
    <Router basename={process.env.PUBLIC_URL}>
      <Header />
      <Web3ReactProvider getLibrary={getLibrary}>
        <Connect>
          <Container>
            <Routes>
              <Route path="/profile" element={<Profile/>} />
              <Route path="/" element={<Marketplace/>} />
              <Route path="/Contractplace" element={<Contractplace/>} />
              <Route path="/Marketplace" element={<Marketplace/>} />
              <Route path="/Mintplace" element={<Mintplace/>} />
            </Routes>
            <TransactionProgress />
          </Container>
        </Connect>
      </Web3ReactProvider>
    </Router>
  )
}

export { Root }
