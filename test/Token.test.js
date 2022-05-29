const tokens = (num) => {
  return new web3.utils.BN(web3.utils.toWei(num.toString(), 'ether'))
}
const ETH_ADDR = '0x0000000000000000000000000000000000000000'
const EVM_ERR = 'VM Exception while processing transaction: revert'
const Token = artifacts.require('./Token')

require('chai').use(require('chai-as-promised')).should()

contract('Token', ([deployer, acOne, exchange]) => {
  const name = 'EthereumPlus'
  const symbol = 'ETHP'
  const decimals = '18'
  const totalSupply = tokens(1000000).toString()
  let token

  beforeEach(async () => {
    token = await Token.new()
  })

  describe('deployment', () => {
    it('trcks name', async () => {
      const result = await token.name()
      result.should.equal(name)
    })

    it('tracks symbol', async () => {
      const result = await token.symbol()
      result.should.equal(symbol)
    })

    it('tracks decimals', async () => {
      const result = await token.decimals()
      result.toString().should.equal(decimals)
    })

    it('tracks total supply', async () => {
      const result = await token.totalSupply()
      //   console.log(result.toString())
      result.toString().should.equal(totalSupply.toString())
    })

    it('assigns total supply to deployer', async () => {
      const result = await token.balanceOf(deployer)
      //   console.log(result.toString())
      result.toString().should.equal(totalSupply.toString())
    })
  })

  describe('sending tokens', () => {
    let amount, result

    describe('success', () => {
      beforeEach(async () => {
        amount = tokens(100)
        result = await token.transfer(acOne, amount)
      })

      it('sends token', async () => {
        const tokensAfter = await token.balanceOf(deployer)
        const tokensOfAc = await token.balanceOf(acOne)
      })

      it('emits a transfer event', async () => {
        // console.log(result.logs)
        const log = result.logs[0]
        log.event.should.eq('Transfer')

        const event = log.args
        event.from.toString().should.equal(deployer, 'from field is correct')
        event.to.toString().should.equal(acOne, 'to field is correct')
        event.value
          .toString()
          .should.eq(amount.toString(), 'value field is correct')
      })
    })

    describe('failure', () => {
      it('rejects insufficient balances', async () => {
        let invalidAmount
        invalidAmount = tokens(1000000000)
        await token
          .transfer(acOne, invalidAmount)
          .should.be.rejectedWith(EVM_ERR)

        await token
          .transfer(deployer, invalidAmount, { from: acOne })
          .should.be.rejectedWith(EVM_ERR)
      })

      it('rejects invalid recipients', async () => {
        await token.transfer(ETH_ADDR, amount).should.be.rejectedWith(EVM_ERR)
      })
    })
  })

  describe('approving tokens', () => {
    let result, amount

    beforeEach(async () => {
      amount = tokens(100)
      result = await token.approve(exchange, amount, { from: deployer })
    })

    describe('success', () => {
      it('allocates allowance for delegate token spending on exchange', async () => {
        const allowance = await token.allowance(deployer, exchange)
        allowance.toString().should.equal(amount.toString())
      })

      it('emits a approval event', async () => {
        const log = result.logs[0]
        log.event.should.eq('Approval')
        const event = log.args
        event._owner.toString().should.equal(deployer, 'owner field is correct')
        event._spender
          .toString()
          .should.equal(exchange, 'spender field is correct')
        event._value
          .toString()
          .should.eq(amount.toString(), 'value field is correct')
      })
    })

    describe('failure', () => {
      it('rejects invalid spender', async () => {
        await token.transfer(ETH_ADDR, amount).should.be.rejectedWith(EVM_ERR)
      })
    })
  })

  describe('delegate token transfer', () => {
    let amount, result

    beforeEach(async () => {
      amount = tokens(100)
      await token.approve(exchange, amount, { from: deployer })
    })

    describe('success', () => {
      beforeEach(async () => {
        amount = tokens(100)
        result = await token.transferFrom(deployer, acOne, amount, {
          from: exchange,
        })
      })

      it('sends token', async () => {
        const tokensAfter = await token.balanceOf(deployer)
        const tokensOfAc = await token.balanceOf(acOne)
      })

      it('resets allowance', async () => {
        const allowance = await token.allowance(deployer, exchange)
        allowance.toString().should.eq('0')
      })

      it('emits a transfer event', async () => {
        const log = result.logs[0]
        log.event.should.eq('Transfer')
        const event = log.args
        event.from.toString().should.equal(deployer, 'from field is correct')
        event.to.toString().should.equal(acOne, 'to field is correct')
        event.value
          .toString()
          .should.eq(amount.toString(), 'value field is correct')
      })
    })

    describe('failure', () => {
      it('rejects insufficient balances', async () => {
        let invalidAmount
        invalidAmount = tokens(1000000000)
        await token
          .transfer(acOne, invalidAmount)
          .should.be.rejectedWith(EVM_ERR)
        await token
          .transferFrom(deployer, acOne, invalidAmount, { from: exchange })
          .should.be.rejectedWith(EVM_ERR)
      })

      it('rejects invalid recipients', async () => {
        await token.transfer(ETH_ADDR, amount).should.be.rejectedWith(EVM_ERR)
      })
    })
  })
})
