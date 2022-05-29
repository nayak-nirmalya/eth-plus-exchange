const tokens = (num) => {
  return new web3.utils.BN(web3.utils.toWei(num.toString(), 'ether'))
}
const ether = tokens
const ETH_ADDR = '0x0000000000000000000000000000000000000000'
const EVM_ERR = 'VM Exception while processing transaction: revert'
const Exchange = artifacts.require('./Exchange')
const Token = artifacts.require('./Token')

require('chai').use(require('chai-as-promised')).should()

contract('Exchange', ([deployer, feeAccount, userOne, userTwo]) => {
  let exchange, token
  const feePercent = 10

  beforeEach(async () => {
    // deploy token
    token = await Token.new()

    // deposit some tokens to userOne
    token.transfer(userOne, tokens(100), { from: deployer })

    // deploy exchange
    exchange = await Exchange.new(feeAccount, feePercent)
  })

  describe('deployment', () => {
    it('trcks fee account', async () => {
      const result = await exchange.feeAccount()
      result.should.equal(feeAccount)
    })

    it('trcks fee percent', async () => {
      const result = await exchange.feePercent()
      result.toString().should.equal(feePercent.toString())
    })
  })

  describe('fallback', () => {
    it('reverts when ether is sent', async () => {
      await exchange
        .sendTransaction({ value: ether(1), from: userOne })
        .should.be.rejectedWith(EVM_ERR)
    })
  })

  describe('depositing ether', () => {
    let result, amount

    beforeEach(async () => {
      amount = ether(1)
      result = await exchange.depositEther({ from: userOne, value: amount })
    })

    it('tracks the ether deposit', async () => {
      const balance = await exchange.tokens(ETH_ADDR, userOne)
      balance.toString().should.eq(amount.toString())
    })

    it('emits a deposit event', async () => {
      const log = result.logs[0]
      log.event.should.eq('Deposit')

      const event = log.args
      event.token.should.equal(ETH_ADDR, 'ether address is correct')
      event.user.should.equal(userOne, 'user address is correct')
      event.amount
        .toString()
        .should.eq(amount.toString(), 'amount field is correct')
      event.balance
        .toString()
        .should.eq(amount.toString(), 'balance is correct')
    })
  })

  describe('withdrawing ether', () => {
    let result, amount

    beforeEach(async () => {
      amount = ether(1)
      await exchange.depositEther({ from: userOne, value: amount })
    })

    describe('success', async () => {
      beforeEach(async () => {
        result = await exchange.withdrawEther(amount, { from: userOne })
      })

      it('withdraws ether funds', async () => {
        const balance = await exchange.tokens(ETH_ADDR, userOne)
        balance.toString().should.eq('0')
      })

      it('emits a withdraw event', async () => {
        const log = result.logs[0]
        log.event.should.eq('Withdraw')

        const event = log.args
        event.token.should.equal(ETH_ADDR, 'ether address is correct')
        event.user.should.equal(userOne, 'user address is correct')
        event.amount
          .toString()
          .should.eq(amount.toString(), 'amount field is correct')
        event.balance.toString().should.eq('0', 'balance is correct')
      })
    })

    describe('failure', async () => {
      it('rejects withdraws for insufficient balances', async () => {
        await exchange
          .withdrawEther(ether(100), { from: userOne })
          .should.be.rejectedWith(EVM_ERR)
      })
    })
  })

  describe('depositing tokens', () => {
    let result, amount

    describe('success', () => {
      beforeEach(async () => {
        amount = tokens(10)
        await token.approve(exchange.address, amount, { from: userOne })
        result = await exchange.depositToken(token.address, amount, {
          from: userOne,
        })
      })

      it('tracks the token deposit', async () => {
        // checks exchange token balance
        let balance = await token.balanceOf(exchange.address)
        balance.toString().should.equal(amount.toString())

        // check token on exchange
        balance = await exchange.tokens(token.address, userOne)
        balance.toString().should.equal(amount.toString())
      })

      it('emits a deposit event', async () => {
        const log = result.logs[0]
        log.event.should.eq('Deposit')

        const event = log.args
        event.token.should.equal(token.address, 'token address is correct')
        event.user.should.equal(userOne, 'user address is correct')
        event.amount
          .toString()
          .should.eq(amount.toString(), 'amount field is correct')
        event.balance
          .toString()
          .should.eq(amount.toString(), 'balance is correct')
      })
    })

    describe('failure', () => {
      it('rejects ether deposit', async () => {
        await exchange
          .depositToken(ETH_ADDR, amount, { from: userOne })
          .should.be.rejectedWith(EVM_ERR)
      })

      it('fails when no tokens are approved', async () => {
        // don't approve any tokens before depositing
        await exchange
          .depositToken(token.address, amount, { from: userOne })
          .should.be.rejectedWith(EVM_ERR)
      })
    })
  })

  describe('withdrawing tokens', () => {
    let result, amount

    describe('success', async () => {
      beforeEach(async () => {
        amount = tokens(10)

        // deposit token first
        await token.approve(exchange.address, amount, { from: userOne })
        await exchange.depositToken(token.address, amount, { from: userOne })

        // withdraw tokens
        result = await exchange.withdrawToken(token.address, amount, {
          from: userOne,
        })
      })

      it('withdraws token funds', async () => {
        const balance = await exchange.tokens(token.address, userOne)
        balance.toString().should.eq('0')
      })

      it('emits a withdraw event', async () => {
        const log = result.logs[0]
        log.event.should.eq('Withdraw')

        const event = log.args
        event.token.should.equal(token.address, 'ether address is correct')
        event.user.should.equal(userOne, 'user address is correct')
        event.amount
          .toString()
          .should.eq(amount.toString(), 'amount field is correct')
        event.balance.toString().should.eq('0', 'balance is correct')
      })
    })

    describe('failure', async () => {
      it('rejects withdraws for ethereum', async () => {
        await exchange
          .withdrawToken(ETH_ADDR, ether(1), { from: userOne })
          .should.be.rejectedWith(EVM_ERR)
      })

      it('rejects withdraws for insufficient balances', async () => {
        await exchange
          .withdrawToken(token.address, tokens(100), { from: userOne })
          .should.be.rejectedWith(EVM_ERR)
      })
    })
  })

  describe('checking balance', () => {
    let amount = ether(1)
    beforeEach(async () => {
      await exchange.depositEther({ from: userOne, value: amount })
    })

    it('returns user balance', async () => {
      const result = await exchange.balanceOf(ETH_ADDR, userOne)
      result.toString().should.eq(amount.toString())
    })
  })

  describe('making orders', () => {
    let result
    beforeEach(async () => {
      result = await exchange.makeOrder(
        token.address,
        tokens(1),
        ETH_ADDR,
        ether(1),
        { from: userOne },
      )
    })

    it('tracks the newly created order', async () => {
      const orderCount = await exchange.orderCount()
      orderCount.toString().should.equal('1')

      const order = await exchange.orders('1')
      order.id.toString().should.equal('1')
      order.user.should.equal(userOne, 'user is correct')
      order.tokenGet.should.equal(token.address, 'tokenGet is correct')
      order.amountGet
        .toString()
        .should.equal(tokens(1).toString(), 'amountGet is correct')
      order.tokenGive.toString().should.equal(ETH_ADDR, 'tokenGive is correct')
      order.amountGive
        .toString()
        .should.equal(ether(1).toString(), 'amountGive is correct')
      order.timestamp
        .toString()
        .length.should.be.at.least(1, 'timestamp is present')
    })

    it('emits an order event', async () => {
      const log = result.logs[0]
      log.event.should.equal('Order')

      const event = log.args
      event.id.toString().should.equal('1', 'id is correct')
      event.user.should.equal(userOne, 'user is correct')
      event.tokenGet.should.equal(token.address, 'tokenGet is correct')
      event.amountGet
        .toString()
        .should.equal(tokens(1).toString(), 'amountGet is correct')
      event.tokenGive.toString().should.equal(ETH_ADDR, 'tokenGive is correct')
      event.amountGive
        .toString()
        .should.equal(ether(1).toString(), 'amountGive is correct')
      event.timestamp
        .toString()
        .length.should.be.at.least(1, 'timestamp is present')
    })
  })

  describe('order actions', () => {
    beforeEach(async () => {
      await exchange.depositEther({ from: userOne, value: ether(1) })
      await token.transfer(userTwo, tokens(100), { from: deployer })
      await token.approve(exchange.address, tokens(2), { from: userTwo })
      await exchange.depositToken(token.address, tokens(2), { from: userTwo })
      await exchange.makeOrder(token.address, tokens(1), ETH_ADDR, ether(1), {
        from: userOne,
      })
    })

    describe('filling orders', () => {
      let result

      describe('success', async () => {
        beforeEach(async () => {
          result = await exchange.fillOrder('1', { from: userTwo })
        })

        it('executes the trade and charges fees', async () => {
          let balance = await exchange.balanceOf(token.address, userOne)
          balance
            .toString()
            .should.equal(tokens(1).toString(), 'userOne receive tokens')

          balance = await exchange.balanceOf(ETH_ADDR, userTwo)
          balance
            .toString()
            .should.equal(ether(1).toString(), 'userTwo receive ethers')

          balance = await exchange.balanceOf(ETH_ADDR, userOne)
          balance.toString().should.equal('0', 'userTwo ethers deducted')

          balance = await exchange.balanceOf(token.address, userTwo)
          balance
            .toString()
            .should.equal(
              tokens(0.9).toString(),
              'userTwo tokens deducted with fee applied',
            )

          const feeAccount = await exchange.feeAccount()
          balance = await exchange.balanceOf(token.address, feeAccount)
          balance
            .toString()
            .should.equal(tokens(0.1).toString(), 'fee account receives fee')
        })

        it('updates filled orders', async () => {
          const orderFilled = await exchange.orderFilled(1)
          orderFilled.should.equal(true)
        })

        it('emits an "Trade" event', async () => {
          const log = result.logs[0]
          log.event.should.equal('Trade')

          const event = log.args
          event.id.toString().should.equal('1', 'id is correct')
          event.user.should.equal(userOne, 'user is correct')
          event.tokenGet.should.equal(token.address, 'tokenGet is correct')
          event.amountGet
            .toString()
            .should.equal(tokens(1).toString(), 'amountGet is correct')
          event.tokenGive
            .toString()
            .should.equal(ETH_ADDR, 'tokenGive is correct')
          event.amountGive
            .toString()
            .should.equal(ether(1).toString(), 'amountGive is correct')
          event.timestamp
            .toString()
            .length.should.be.at.least(1, 'timestamp is present')
        })
      })

      describe('failure', async () => {
        it('rejects invalid order ids', async () => {
          const invalidOrderId = 9999
          await exchange
            .fillOrder(invalidOrderId, { from: userOne })
            .should.be.rejectedWith(EVM_ERR)
        })

        it('rejects already filled orders', async () => {
          await exchange.fillOrder('1', { from: userTwo }).should.be.fulfilled
          await exchange
            .fillOrder('1', { from: userTwo })
            .should.be.rejectedWith(EVM_ERR)
        })

        it('rejects cancelled orders', async () => {
          await exchange.cancelOrder('1', { from: userOne }).should.be.fulfilled
          await exchange
            .fillOrder('1', { from: userTwo })
            .should.be.rejectedWith(EVM_ERR)
        })
      })
    })

    describe('cancelling order', async () => {
      let result

      describe('success', async () => {
        beforeEach(async () => {
          result = await exchange.cancelOrder('1', { from: userOne })
        })

        it('updates cancelled orders', async () => {
          const orderCancelled = await exchange.orderCancelled(1)
          orderCancelled.should.equal(true)
        })

        it('emits an "Cancel" event', async () => {
          const log = result.logs[0]
          log.event.should.equal('Cancel')

          const event = log.args
          event.id.toString().should.equal('1', 'id is correct')
          event.user.should.equal(userOne, 'user is correct')
          event.tokenGet.should.equal(token.address, 'tokenGet is correct')
          event.amountGet
            .toString()
            .should.equal(tokens(1).toString(), 'amountGet is correct')
          event.tokenGive
            .toString()
            .should.equal(ETH_ADDR, 'tokenGive is correct')
          event.amountGive
            .toString()
            .should.equal(ether(1).toString(), 'amountGive is correct')
          event.timestamp
            .toString()
            .length.should.be.at.least(1, 'timestamp is present')
        })
      })

      describe('failure', async () => {
        it('rejects invalid order id', async () => {
          const invalidOrderId = 9999
          await exchange
            .cancelOrder(invalidOrderId, { from: userOne })
            .should.be.rejectedWith(EVM_ERR)
        })

        it('rejects unatuthorized cancelations', async () => {
          await exchange
            .cancelOrder('1', { from: userTwo })
            .should.be.rejectedWith(EVM_ERR)
        })
      })
    })
  })
})
