import BigNumber from 'bignumber.js'
import Wallet from './Wallet'
import { Asset, FeeRate } from 'Types'
import { PaymentTx } from 'Services/Bitcore'
import { AddressFormat } from 'Utilities/addressFormat'

export { FeeRate }

export type Amount = BigNumber

export interface TransactionOutput {
  address: string
  amount: Amount
}

export interface Transaction {
  walletId: string
  type: string
  outputs: TransactionOutput[]
  assetSymbol: string
  feeAmount: Amount
  feeSymbol: string
  hash: string | null
  signed: boolean
  sent: boolean
  txData?: object | null
  signedTxData?: any
}

export interface BitcoreTransaction extends Transaction {
  txData?: PaymentTx | null
  signedTxData?: string | null
}

export interface Balances {
  [symbol: string]: Amount
}

export type AssetProvider = () => (Asset[] | { [symbol: string]: Asset })
export type WalletGetter = (id: string) => Wallet | null

export interface Web3Receipt {
  blockNumber: number
  status: boolean | number | string
}

export interface Receipt {
  confirmed: boolean
  succeeded: boolean
  blockNumber: number
  raw: object
}

export interface ConnectResult {
  derivationPath: string
  getAccount: (index: number) => Promise<Wallet>
}

// Used to specify address format to functions that return addresses
export interface AddressFormatOption {
  addressFormat?: AddressFormat | string // string for AddressFormat.type
}
