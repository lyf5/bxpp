import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Web3ReactProvider } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'

import { Contractplace, Marketplace, Mintplace, Profile, Connect } from './'
//import { Header, PrivateRoute, TransactionProgress } from '../components'
import { CreateTokenSet, Header, TransactionProgress } from '../components'
import { Container } from 'theme-ui'

function getLibrary(provider: any): Web3Provider {
  console.log("for debug. getLibrary.");
  const library = new Web3Provider(provider)
  library.pollingInterval = 12000
  return library
}

const Root = () => {
  console.log("for debug. Root start.");
  return (
    <Router basename={process.env.PUBLIC_URL}>
      <Header />
      <Web3ReactProvider getLibrary={getLibrary}>
        <Connect>
          <Container>
            <Routes>
              <Route path="/" element={<Contractplace/>} />
              <Route path="/profile" element={<Contractplace/>} />
              <Route path="/Mintplace" element={<Contractplace/>} />
              
              <Route path="/Marketplace" element={<Marketplace/>} />
              <Route path="/MyNFTs" element={<Profile/>} />
              <Route path="/Mint" element={<Mintplace/>} />
              <Route path="/createTokenSet" element={<CreateTokenSet/>} />
            </Routes>
            <TransactionProgress />
          </Container>
        </Connect>
      </Web3ReactProvider>
    </Router>
  )
}

export { Root }
