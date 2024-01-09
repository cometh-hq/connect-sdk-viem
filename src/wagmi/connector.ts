import {
  ComethWallet,
  ConnectAdaptor,
  SupportedNetworks,
  UIConfig
} from '@cometh/connect-sdk'
import { a } from '@wagmi/connectors/dist/base-e6cfa360'
import { toHex } from 'viem'
import { Chain, Connector } from 'wagmi'

import {
  ConnectClient,
  getConnectViemClient
} from '../client/getConnectViemClient'

export interface WagmiConfigConnectorParams {
  apiKey: string
  disableEoaFallback?: boolean
  walletAddress?: string
  uiConfig?: UIConfig
  baseUrl?: string
}

function _isSupportedNetwork(value: string): value is SupportedNetworks {
  return Object.values(SupportedNetworks).includes(value as any)
}

export class ComethConnectConnector extends Connector<
  undefined,
  WagmiConfigConnectorParams
> {
  id = 'cometh-connect'
  name = 'Cometh Connect'
  ready = true
  wallet: ComethWallet
  client: ConnectClient
  walletAddress?: string

  constructor({
    chains,
    options: options_
  }: {
    chains?: Chain[]
    options: WagmiConfigConnectorParams
  }) {
    const options = {
      shimDisconnect: false,
      ...options_
    }
    super({
      chains,
      options
    })
    const { apiKey, disableEoaFallback, baseUrl, walletAddress, uiConfig } =
      this.options

    const chainId = toHex(this.chains[0].id)

    if (_isSupportedNetwork(chainId)) {
      this.wallet = new ComethWallet({
        authAdapter: new ConnectAdaptor({
          chainId,
          apiKey,
          disableEoaFallback,
          baseUrl
        }),
        apiKey,
        uiConfig,
        baseUrl
      })

      this.client = getConnectViemClient({ wallet: this.wallet })
      this.walletAddress = walletAddress
    } else {
      throw new Error('Network not supported')
    }
  }

  async connect(): Promise<Required<a>> {
    if (this.walletAddress) {
      await this.wallet.connect(this.walletAddress)
      window.localStorage.setItem('walletAddress', this.walletAddress)
    } else {
      const localStorageAddress = window.localStorage.getItem('walletAddress')

      if (localStorageAddress) {
        await this.wallet.connect(localStorageAddress)
      } else {
        await this.wallet.connect()
        const walletAddress = await this.wallet.getAddress()
        window.localStorage.setItem('walletAddress', walletAddress)
      }
    }

    return {
      account: this.wallet.getAddress() as `0x${string}`,
      chain: {
        id: this.wallet.chainId,
        unsupported: false
      }
    }
  }
  disconnect(): Promise<void> {
    return this.wallet.logout()
  }
  async getAccount(): Promise<`0x${string}`> {
    return this.wallet.getAddress() as `0x${string}`
  }
  async getChainId(): Promise<number> {
    return await this.wallet.chainId
  }
  /* eslint-disable */
  async getProvider(): Promise<any> {
    return this.client
  }
  /* eslint-disable */
  async getWalletClient(): Promise<any> {
    return this.client
  }
  async isAuthorized(): Promise<boolean> {
    return false
  }
  protected onAccountsChanged(): void {
    throw new Error('method is not available')
    return
  }
  protected onChainChanged(): void {
    throw new Error('method is not available')
    return
  }
  protected onDisconnect(): void {
    throw new Error('method is not available')
    return
  }
}
