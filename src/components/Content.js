import { connect } from 'react-redux'
import { exchangeSelector } from '../store/selectors'
import { loadAllOrders, subscribeToEvents } from '../store/interactions'
import React, { useEffect } from 'react'
import Trades from './Trades'
import OrderBook from './OrderBook'
import MyTransactions from './MyTransactions'
import PriceChart from './PriceChart'
import Balance from './Balance'
import NewOrder from './NewOrder'

function Content({ exchange, dispatch }) {
  useEffect(() => {
    loadBlockchainData(dispatch)
  }, [])

  async function loadBlockchainData(dispatch) {
    await loadAllOrders(exchange, dispatch)
    await subscribeToEvents(exchange, dispatch)
  }

  return (
    <div className="content">
      <div className="vertical-split">
        <Balance />
        <NewOrder />
      </div>
      <OrderBook />
      <div className="vertical-split">
        <PriceChart />
        <MyTransactions />
      </div>
      <Trades />
    </div>
  )
}

function mapStateToProps(state) {
  return {
    exchange: exchangeSelector(state),
  }
}

export default connect(mapStateToProps)(Content)
