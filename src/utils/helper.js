export const tokens = (num) => {
  return new web3.utils.BN(web3.utils.toWei(num.toString(), 'ether'))
}

export const EVM_ERR = 'VM Exception while processing transaction: revert'

export const INVALID_ADDR =
  'invalid address (argument="address", value=0, code=INVALID_ARGUMENT, version=address/5.0.5) (argument="_to", value=0, code=INVALID_ARGUMENT, version=abi/5.0.7)'
