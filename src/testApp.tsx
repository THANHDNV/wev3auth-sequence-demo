
import { sequence, } from '0xsequence'
import { useEffect } from 'react'
import { ethers } from 'ethers'
import { RpcRelayer } from '@0xsequence/relayer'
import { Wallet } from '@0xsequence/wallet'

const privateKey = '0x0ba46d111dbdedc270ebd7909cf3abe16665cac2b329d54c69ba05891d9db9b3'
const publicKey = '0x014Fb83bEAcF6B8dFD9F637c9C61797b98268e74'

const TestApp = () => {
  useEffect(() => {
    const init = async () => {
      const walletEOA = new ethers.Wallet(privateKey, new ethers.providers.JsonRpcProvider('https://rpc.ankr.com/polygon_mumbai	'))
      const relayer = new RpcRelayer({ url: 'https://polygon-relayer.sequence.app' })
      const wallet = (await Wallet.singleOwner(walletEOA)).connect(walletEOA.provider, relayer)

      console.log(wallet)
    }

    init()
  }, [])

  return (
    null
  )
}

export default TestApp
