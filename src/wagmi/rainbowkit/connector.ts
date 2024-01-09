import { UIConfig } from '@cometh/connect-sdk'
import { Chain, Wallet } from '@rainbow-me/rainbowkit'

import { ComethConnectConnector } from '../connector'

export interface RainbowKitConnectorParams {
  apiKey: string
  chain: Chain
  disableEoaFallback?: boolean
  walletAddress?: string
  uiConfig?: UIConfig
  baseUrl?: string
}

export const rainbowkitComethConnect = ({
  apiKey,
  chain,
  disableEoaFallback,
  walletAddress,
  uiConfig,
  baseUrl
}: RainbowKitConnectorParams): Wallet => ({
  id: 'cometh-connect',
  name: 'Cometh Connect',
  iconUrl:
    'https://pbs.twimg.com/profile_images/1679433363818442753/E2kNVLBe_400x400.jpg',
  iconBackground: '#ffffff',
  /* eslint-disable */
  createConnector: () => {
    return {
      connector: new ComethConnectConnector({
        chains: [chain],
        options: { apiKey, disableEoaFallback, walletAddress, uiConfig, baseUrl }
      })
    }
  }
})
