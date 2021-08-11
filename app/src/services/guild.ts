import { Contract, ethers, utils } from 'ethers'
import { Web3Provider } from 'ethers/providers'
import { BigNumber } from 'ethers/utils'

import { getContractAddress } from '../util/networks'

const GuildAbi = [
  {
    inputs: [{ internalType: 'uint256', name: 'amount', type: 'uint256' }],
    name: 'lockTokens',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'tokensLocked',
    outputs: [
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
      { internalType: 'uint256', name: 'timestamp', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'tokenVault',
    outputs: [{ internalType: 'contract TokenVault', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'token',
    outputs: [{ internalType: 'contract IERC20Upgradeable', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'lockTime',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalLocked',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'amount', type: 'uint256' }],
    name: 'releaseTokens',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
]

class OmenGuildService {
  user: ethers.providers.JsonRpcSigner
  network: number
  provider: any
  omenGuildAddress: string
  contract?: Contract

  constructor(provider: Web3Provider, network: number) {
    const signer = provider.getSigner()
    this.user = signer
    this.network = network
    this.provider = provider
    this.omenGuildAddress = getContractAddress(network, 'omenGuildProxy')
    if (this.omenGuildAddress) {
      this.contract = new ethers.Contract(this.omenGuildAddress, GuildAbi, provider.getSigner()).connect(signer)
    }
  }

  get getOmenGuildAddress(): string {
    return this.omenGuildAddress
  }

  static encodeLockTokens = (amount: any) => {
    const guildInterface = new utils.Interface(GuildAbi)
    return guildInterface.functions.lockTokens.encode([amount])
  }

  static encodeUnlockTokens = (amount: BigNumber) => {
    const guildInterface = new utils.Interface(GuildAbi)
    return guildInterface.functions.releaseTokens.encode([amount])
  }

  lockTokens = async (amount: BigNumber) => {
    return await this.contract?.lockTokens(amount)
  }

  unlockTokens = async (amount: BigNumber) => {
    return await this.contract?.releaseTokens(amount)
  }

  tokensLocked = async (address: string) => {
    return this.contract?.tokensLocked(address)
  }

  totalLocked = async () => {
    return this.contract?.totalLocked()
  }

  omenTokenAddress = async () => {
    return await this.contract?.token()
  }

  tokenVault = async () => {
    return this.contract?.tokenVault()
  }

  lockTime = async () => {
    return this.contract?.lockTime()
  }
}

export { OmenGuildService }
