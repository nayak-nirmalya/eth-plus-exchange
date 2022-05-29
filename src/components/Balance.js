import { connect } from 'react-redux'
import { useEffect } from 'react'
import { Tabs, Tab } from 'react-bootstrap'
import Spinner from './Spinner'
import {
  accountSelector,
  exchangeSelector,
  tokenSelector,
  web3Selector,
  balancesLoadingSelector,
  etherBalanceSelector,
  tokenBalanceSelector,
  exchangeEtherBalanceSelector,
  exchangeTokenBalanceSelector,
  etherDepositAmountSelector,
  etherWithdrawAmountSelector,
  tokenDepositAmountSelector,
  tokenWithdrawAmountSelector,
} from '../store/selectors'
import {
  loadBalance,
  depositEther,
  depositToken,
  withdrawEther,
  withdrawToken,
} from '../store/interactions'
import {
  etherDepositAmountChanged,
  etherWithdrawAmountChanged,
  tokenDepositAmountChanged,
  tokenWithdrawAmountChanged,
} from '../store/actions'

const showForms = (
  dispatch,
  exchange,
  web3,
  account,
  etherBalance,
  tokenBalance,
  exchangeEtherBalance,
  exchangeTokenBalance,
  etherDepositAmount,
  token,
  tokenDepositAmount,
  etherWithdrawAmount,
  tokenWithdrawAmount,
) => {
  return (
    <Tabs defaultActiveKey="deposit" className="bg-dark text-white">
      <Tab eventKey="deposit" title="Deposit" className="bg-dark">
        <table className="table table-dark table-sm small">
          <thead>
            <tr>
              <th>Token</th>
              <th>Wallet</th>
              <th>Exchange</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>ETH</td>
              <td>{etherBalance}</td>
              <td>{exchangeEtherBalance}</td>
            </tr>
          </tbody>
        </table>

        <form
          className="row"
          onSubmit={(event) => {
            event.preventDefault()
            depositEther(dispatch, exchange, web3, etherDepositAmount, account)
          }}
        >
          <div className="col-12 col-sm pr-sm-2">
            <input
              type="text"
              placeholder="ETH Amount"
              onChange={(ev) =>
                dispatch(etherDepositAmountChanged(ev.target.value))
              }
              className="form-control form-control-sm bg-dark text-white"
              required
            />
          </div>
          <div className="col-12 col-sm-auto pl-sm-0">
            <button type="submit" className="btn btn-primary btn-block btn-sm">
              Deposit
            </button>
          </div>
        </form>

        <table className="table table-dark table-sm small">
          <tbody>
            <tr>
              <td>ETHP</td>
              <td>{tokenBalance}</td>
              <td>{exchangeTokenBalance}</td>
            </tr>
          </tbody>
        </table>

        <form
          className="row"
          onSubmit={(event) => {
            event.preventDefault()
            depositToken(
              dispatch,
              exchange,
              web3,
              token,
              tokenDepositAmount,
              account,
            )
          }}
        >
          <div className="col-12 col-sm pr-sm-2">
            <input
              type="text"
              placeholder="ETHP Amount"
              onChange={(ev) =>
                dispatch(tokenDepositAmountChanged(ev.target.value))
              }
              className="form-control form-control-sm bg-dark text-white"
              required
            />
          </div>
          <div className="col-12 col-sm-auto pl-sm-0">
            <button type="submit" className="btn btn-primary btn-block btn-sm">
              Deposit
            </button>
          </div>
        </form>
      </Tab>

      <Tab eventKey="withdraw" title="Withdraw" className="bg-dark">
        <table className="table table-dark table-sm small">
          <thead>
            <tr>
              <th>Token</th>
              <th>Wallet</th>
              <th>Exchange</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>ETH</td>
              <td>{etherBalance}</td>
              <td>{exchangeEtherBalance}</td>
            </tr>
          </tbody>
        </table>

        <form
          className="row"
          onSubmit={(event) => {
            event.preventDefault()
            withdrawEther(
              dispatch,
              exchange,
              web3,
              etherWithdrawAmount,
              account,
            )
          }}
        >
          <div className="col-12 col-sm pr-sm-2">
            <input
              type="text"
              placeholder="ETH Amount"
              onChange={(ev) =>
                dispatch(etherWithdrawAmountChanged(ev.target.value))
              }
              className="form-control form-control-sm bg-dark text-white"
              required
            />
          </div>
          <div className="col-12 col-sm-auto pl-sm-0">
            <button type="submit" className="btn btn-primary btn-block btn-sm">
              Withdraw
            </button>
          </div>
        </form>

        <table className="table table-dark table-sm small">
          <tbody>
            <tr>
              <td>ETHP</td>
              <td>{tokenBalance}</td>
              <td>{exchangeTokenBalance}</td>
            </tr>
          </tbody>
        </table>

        <form
          className="row"
          onSubmit={(event) => {
            event.preventDefault()
            withdrawToken(
              dispatch,
              exchange,
              web3,
              token,
              tokenWithdrawAmount,
              account,
            )
          }}
        >
          <div className="col-12 col-sm pr-sm-2">
            <input
              type="text"
              placeholder="ETHP Amount"
              onChange={(ev) =>
                dispatch(tokenWithdrawAmountChanged(ev.target.value))
              }
              className="form-control form-control-sm bg-dark text-white"
              required
            />
          </div>
          <div className="col-12 col-sm-auto pl-sm-0">
            <button type="submit" className="btn btn-primary btn-block btn-sm">
              Withdraw
            </button>
          </div>
        </form>
      </Tab>
    </Tabs>
  )
}

function Balance({
  dispatch,
  web3,
  exchange,
  token,
  account,
  etherBalance,
  tokenBalance,
  exchangeEtherBalance,
  exchangeTokenBalance,
  etherDepositAmount,
  tokenDepositAmount,
  etherWithdrawAmount,
  tokenWithdrawAmount,
  showForm,
}) {
  useEffect(() => {
    loadBlockchainData(dispatch, web3, exchange, token, account)
  }, [])

  async function loadBlockchainData(dispatch, web3, exchange, token, account) {
    await loadBalance(dispatch, web3, exchange, token, account)
  }

  return (
    <div className="card bg-dark text-white">
      <div className="card-header">Balance</div>
      <div className="card-body">
        {showForm ? (
          showForms(
            dispatch,
            exchange,
            web3,
            account,
            etherBalance,
            tokenBalance,
            exchangeEtherBalance,
            exchangeTokenBalance,
            etherDepositAmount,
            token,
            tokenDepositAmount,
            etherWithdrawAmount,
            tokenWithdrawAmount,
          )
        ) : (
          <Spinner />
        )}
      </div>
    </div>
  )
}

function mapStateToProps(state) {
  const balancesLoading = balancesLoadingSelector(state)

  return {
    account: accountSelector(state),
    exchange: exchangeSelector(state),
    token: tokenSelector(state),
    web3: web3Selector(state),
    etherBalance: etherBalanceSelector(state),
    tokenBalance: tokenBalanceSelector(state),
    exchangeEtherBalance: exchangeEtherBalanceSelector(state),
    exchangeTokenBalance: exchangeTokenBalanceSelector(state),
    balancesLoading,
    showForm: !balancesLoading,
    etherDepositAmount: etherDepositAmountSelector(state),
    etherWithdrawAmount: etherWithdrawAmountSelector(state),
    tokenDepositAmount: tokenDepositAmountSelector(state),
    tokenWithdrawAmount: tokenWithdrawAmountSelector(state),
  }
}

export default connect(mapStateToProps)(Balance)
