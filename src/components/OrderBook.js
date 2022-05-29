import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import { connect } from 'react-redux'
import {
  accountSelector,
  exchangeSelector,
  orderBookLoadedSelector,
  orderBookSelector,
  orderFillingSelector,
} from '../store/selectors'
import Spinner from './Spinner'
import { fillOrder } from '../store/interactions'

const renderOrder = (dispatch, exchange, order, account) => {
  return (
    <OverlayTrigger
      key={order.id}
      placement="auto"
      overlay={
        <Tooltip id={order.id}>
          {`Click here to ${order.orderFillAction}`}
        </Tooltip>
      }
    >
      <tr
        key={order.id}
        className="order-book-order"
        onClick={(eve) => fillOrder(dispatch, exchange, order, account)}
      >
        <td>{order.tokenAmount}</td>
        <td className={`text-${order.orderTypeClass}`}>{order.tokenPrice}</td>
        <td>{order.etherAmount}</td>
      </tr>
    </OverlayTrigger>
  )
}

const showOrderBooks = (orderBook, dispatch, exchange, account) => {
  return (
    <tbody>
      {orderBook.sellOrders.map((order) =>
        renderOrder(dispatch, exchange, order, account),
      )}
      <tr>
        <th>ETHP</th>
        <th>ETHP/ETH</th>
        <th>ETH</th>
      </tr>
      {orderBook.buyOrders.map((order) =>
        renderOrder(dispatch, exchange, order, account),
      )}
    </tbody>
  )
}

function OrderBook({ showOrderBook, orderBook, account, exchange, dispatch }) {
  return (
    <div className="vertical">
      <div className="card bg-dark text-white">
        <div className="card-header">Order Book</div>
        <div className="card-body order-book">
          <table className="table table-dark table-sm small">
            {showOrderBook ? (
              showOrderBooks(orderBook, dispatch, exchange, account)
            ) : (
              <Spinner type="table" />
            )}
          </table>
        </div>
      </div>
    </div>
  )
}

function mapStateToProps(state) {
  const orderBookLoaded = orderBookLoadedSelector(state)
  const orderFilling = orderFillingSelector(state)

  return {
    orderBook: orderBookSelector(state),
    showOrderBook: orderBookLoaded && !orderFilling,
    account: accountSelector(state),
    exchange: exchangeSelector(state),
  }
}

export default connect(mapStateToProps)(OrderBook)
