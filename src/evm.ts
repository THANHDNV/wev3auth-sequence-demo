import type { SafeEventEmitterProvider } from "@web3auth/base";
import Web3 from "web3";
import { Accounts } from 'web3-eth-accounts';
import { BigNumber, Contract, ethers, Signer } from 'ethers'
import { Wallet } from '@0xsequence/wallet'
import { RpcRelayer } from '@0xsequence/relayer'
import { sequence } from "0xsequence";
import { Interface } from "ethers/lib/utils";
import erc20Abi from './abi/erc20.json'
import mintNftAbi from './abi/mintnft.json'
import marketplaceAbi from './abi/marketplace.json'

const USDT = '0x3813e82e6f7098b9583FC0F33a962D02018B6803'
const MintNFT = '0xcBda60c05037b79A381b66Bc59E6999efDFF4b7a'
const Marketplace = '0x83a74411e5D09153BB8851D7bF03BB5b1b0Ad85B'
const assetHolder = '0xCa477c248d9735E5d9F2A4C0B2ac8E5F20D8Ac0b'

export default class EthereumRpc {
  private provider: SafeEventEmitterProvider;
  private wallet?: Wallet;
  private relayer?: RpcRelayer;

  constructor(provider: SafeEventEmitterProvider) {
    this.provider = provider;
  }

  async getRelayer(): Promise<RpcRelayer> {
    if (this.relayer) {
      return this.relayer
    }

    const eth = new ethers.providers.Web3Provider(this.provider as any)
    this.relayer = new RpcRelayer({ url: 'https://cors-anywhere.herokuapp.com/https://mumbai-relayer.sequence.app', provider: eth.getSigner().provider })
    return this.relayer
  }

  async getWallet(): Promise<Wallet> {
    if (this.wallet) {
      return this.wallet
    }

    const eth = new ethers.providers.Web3Provider(this.provider as any)
    const relayer = await this.getRelayer()

    this.wallet = (await Wallet.singleOwner(eth.getSigner())).connect(eth.getSigner().provider, relayer)

    return this.wallet;
  }

  async getAccounts(): Promise<Accounts> {
    try {
      const web3 = new Web3(this.provider as any);
      console.log('web3auth wallet', await web3.eth.getAccounts())
      const accounts = web3.eth.accounts;

      return accounts;
    } catch (error: unknown) {
      throw error
    }
  }

  async getSequenceAddress(): Promise<string> {
    try {
      return (await this.getWallet()).address
    } catch (error) {
      throw error
    }
  }

  async getToken1Balance(): Promise<string> {
    try {
      const wallet = await this.getWallet()

      const contract = new Contract(MintNFT, mintNftAbi, wallet.provider)
      return (await contract.balanceOf(wallet.address, 1)).toString()
    } catch (error) {
      throw error
    }
  }

  async buyToken1(): Promise<any> {
    try {
      const wallet = await this.getWallet()

      const contract = new Contract(Marketplace, marketplaceAbi, wallet.provider)
      const USDTcontract = new Contract(USDT, erc20Abi, wallet.provider)

      const allowance = await USDTcontract.allowance(wallet.address, assetHolder)
      if (allowance.lt(BigNumber.from(10).pow(6).div(100))) {
        await (await wallet.sendTransaction({
          to: USDT,
          data: USDTcontract.interface.encodeFunctionData('approve', [
            assetHolder,
            ethers.constants.MaxUint256
          ])
        })).wait()
      }

      const transaction = {
        to: Marketplace,
        data: contract.interface.encodeFunctionData('placeBuyOrder', [
          1,
          BigNumber.from(10).pow(6).div(100).toString(),
          1,
          BigNumber.from(10).pow(6).div(100).toString(),
          false,
          false
        ])
      }

      const tx = await wallet.sendTransaction(transaction)
      await tx.wait()

      return tx
    } catch (error) {
      throw error
    }
  }

  async getBalance(): Promise<string> {
    try {
      const web3 = new Web3(this.provider as any);
      const accounts = await web3.eth.getAccounts();
      const balance = await web3.eth.getBalance(accounts[0]);
      return balance;
    } catch (error) {
      return error as string;
    }
  }

  async getUSDTBalance(): Promise<any> {
    try {
      const wallet = await this.getWallet()
      const contract = new Contract(USDT, erc20Abi, wallet.provider)

      return (await contract.balanceOf(wallet.address)).toString()
    } catch (error) {
      return error as string;
    }
  }

  async signMessage() {
    try {
      const web3 = new Web3(this.provider as any);
      const accounts = await web3.eth.getAccounts();
      const message = "0x47173285a8d7341e5e972fc677286384f802f8ef42a5ec5f03bbfa254cb01fad";
      (web3.currentProvider as any)?.send(
        {
          method: "eth_sign",
          params: [accounts[0], message],
          from: accounts[0],
        },
        (err: Error, result: any) => {
          if (err) {
            return console.error(err);
          }
          return result;
        }
      );
    } catch (error) {
      return error as string;
    }
    return;
  }

  async signTransaction(): Promise<string> {
    try {
      const web3 = new Web3(this.provider as any);
      const accounts = await web3.eth.getAccounts();
      const txRes = await web3.eth.signTransaction({
        from: accounts[0],
        to: accounts[0],
        value: web3.utils.toWei("0.01"),
      });
      return txRes.raw;
    } catch (error) {
      return error as string;
    }
  }

  async signAndSendTransaction(): Promise<string> {
    try {
      const web3 = new Web3(this.provider as any);
      const accounts = await web3.eth.getAccounts();

      const txRes = await web3.eth.sendTransaction({
        from: accounts[0],
        to: accounts[0],
        value: web3.utils.toWei("0.01"),
      });
      return txRes.transactionHash;
    } catch (error) {
      return error as string;
    }
  }

  async signAndSendNative(): Promise<any> {
    try {
      const wallet = await this.getWallet()

      const transaction = {
        to: '0x95ca0F1174563B5cDca1Cb1B982b2F9A31F7DA0a',
        value: '10000000000000000'
      }

      const tx = await wallet.sendTransaction(transaction)
      console.log(tx)
      return tx;
    } catch (error) {
      return error as string;
    }
  }

  async sendUSDT(): Promise<any> {
    try {
      const wallet = await this.getWallet()
      const contract = new Contract(USDT, erc20Abi, wallet.provider)

      const transaction = {
        to: USDT,
        data: contract.interface.encodeFunctionData('transfer', ['0x95ca0F1174563B5cDca1Cb1B982b2F9A31F7DA0a', '1000'])
      }

      const tx = await wallet.sendTransaction(transaction)
      console.log(tx)
    } catch (error) {
      return error as string;
    }
  }
}
