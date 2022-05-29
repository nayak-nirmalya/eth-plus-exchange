import './App.css'
import React, { useEffect } from 'react'
import { accountSelector } from '../store/selectors'
import {
  loadWeb3,
  loadAccount,
  loadToken,
  loadExchange,
  loadAllOrders,
} from '../store/interactions'
import { connect } from 'react-redux'
import Navbar from './Navbar'
import Content from './Content'
import { contractsLoadedSelector } from '../store/selectors'

function App({ dispatch, account, contractsLoaded }) {
  useEffect(() => {
    // componentwillmount in functional component.
    // Anything in here is fired on component mount.
    loadBlockchainData(dispatch)
  }, [])

  async function loadBlockchainData(dispatch) {
    const web3 = await loadWeb3(dispatch)
    const networkId = await web3.eth.net.getId()
    const accounts = await loadAccount(web3, dispatch)

    const token = await loadToken(web3, networkId, dispatch)
    if (!token) {
      alert(
        'Token Smart Contract not detected in current Network. Please select another network with Metamask!',
      )
    }

    const exchange = await loadExchange(web3, networkId, dispatch)
    if (!exchange) {
      alert(
        'Exchange Smart Contract not detected in current Network. Please select another network with Metamask!',
      )
    }

    const totalSupply = await token.methods.totalSupply().call()
    const orderCount = await exchange.methods.orderCount().call()
    // console.log(totalSupply, orderCount, accounts)
    // await loadAllOrders(exchange)
    // await console.log(account)
  }

  return (
    <div className="App">
      <Navbar account={account}></Navbar>
      {contractsLoaded ? <Content /> : <div className="content"></div>}
    </div>
  )
}

function mapStateToProps(state) {
  return {
    // account: accountSelector(state),
    contractsLoaded: contractsLoadedSelector(state),
  }
}

export default connect(mapStateToProps)(App)
