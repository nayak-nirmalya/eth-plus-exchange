// contract
const Exchange = artifacts.require('./Exchange')
const Token = artifacts.require('./Token')

// utils for converting ether and tokens
const tokens = (num) => {
  return new web3.utils.BN(web3.utils.toWei(num.toString(), 'ether'))
}
const ether = tokens
const wait = (seconds) => {
  const milliseconds = seconds * 100
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}
const ETHER_ADDRESS = '0x0000000000000000000000000000000000000000' // ether token deposit address

module.exports = async function (callback) {
  try {
    console.log('script running...')

    // fetch all accounts from ganache
    const accounts = await web3.eth.getAccounts()

    // fetch deployed token
    const token = await Token.deployed()
    console.log('token fetched', token.address)

    // fetch deployed exchange
    const exchange = await Exchange.deployed()
    console.log('token fetched', exchange.address)

    // give tokens to account[1]
    const sender = accounts[0]
    const receiver = accounts[1]
    let amount = web3.utils.toWei('10000', 'ether')

    await token.transfer(receiver, amount, { from: sender })
    console.log(`Transferred ${amount} tokens from ${sender} to ${receiver}`)

    // set up exchange users
    const user1 = accounts[0]
    const user2 = accounts[1]

    // user1 deposits ether
    amount = 1
    await exchange.depositEther({ from: user1, value: ether(amount) })
    console.log(`Deposited ${amount} Ether from ${user1}`)

    // user2 approves token
    amount = 1000
    await token.approve(exchange.address, tokens(amount), { from: user2 })
    console.log(`Approved ${amount} Tokens from ${user2}`)

    // user2 deposits token
    await exchange.depositToken(token.address, tokens(amount), { from: user2 })
    console.log(`Deposited ${amount} tokens from ${user2}`)

    //
    // Seed a Cancelled Order
    //

    // User 1 makes order to get tokens
    let result
    let orderId
    result = await exchange.makeOrder(
      token.address,
      tokens(100),
      ETHER_ADDRESS,
      ether(0.1),
      { from: user1 },
    )
    console.log(`Made order from ${user1}`)

    // User 1 cancells order
    orderId = result.logs[0].args.id
    await exchange.cancelOrder(orderId, { from: user1 })
    console.log(`Cancelled order from ${user1}`)

    //
    // Seed Filled Orders
    //

    // User 1 makes order
    result = await exchange.makeOrder(
      token.address,
      tokens(100),
      ETHER_ADDRESS,
      ether(0.1),
      { from: user1 },
    )
    console.log(`Made order from ${user1}`)

    // User 2 fills order
    orderId = result.logs[0].args.id
    await exchange.fillOrder(orderId, { from: user2 })
    console.log(`Filled order from ${user1}`)

    // Wait 1 second
    await wait(1)

    // User 1 makes another order
    result = await exchange.makeOrder(
      token.address,
      tokens(50),
      ETHER_ADDRESS,
      ether(0.01),
      { from: user1 },
    )
    console.log(`Made order from ${user1}`)

    // User 2 fills another order
    orderId = result.logs[0].args.id
    await exchange.fillOrder(orderId, { from: user2 })
    console.log(`Filled order from ${user1}`)

    // Wait 1 second
    await wait(1)

    // User 1 makes final order
    result = await exchange.makeOrder(
      token.address,
      tokens(200),
      ETHER_ADDRESS,
      ether(0.15),
      { from: user1 },
    )
    console.log(`Made order from ${user1}`)

    // User 2 fills final order
    orderId = result.logs[0].args.id
    await exchange.fillOrder(orderId, { from: user2 })
    console.log(`Filled order from ${user1}`)

    // Wait 1 second
    await wait(1)

    //
    // Seed Open Orders
    //

    // User 1 makes 10 orders
    for (let i = 1; i <= 10; i++) {
      result = await exchange.makeOrder(
        token.address,
        tokens(10 * i),
        ETHER_ADDRESS,
        ether(0.01),
        { from: user1 },
      )
      console.log(`Made order from ${user1}`)
      // Wait 1 second
      await wait(1)
    }

    // User 2 makes 10 orders
    for (let i = 1; i <= 10; i++) {
      result = await exchange.makeOrder(
        ETHER_ADDRESS,
        ether(0.01),
        token.address,
        tokens(10 * i),
        { from: user2 },
      )
      console.log(`Made order from ${user2}`)
      // Wait 1 second
      await wait(1)
    }
  } catch (error) {
    console.error(error)
  }
  callback()
}
