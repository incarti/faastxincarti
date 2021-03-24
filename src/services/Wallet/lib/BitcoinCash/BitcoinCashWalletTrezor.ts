import config from 'Config'
import log from 'Utilities/log'
import Trezor, { TrezorOutput } from 'Services/Trezor'
import networks from 'Utilities/networks'

import BitcoinCashWallet from './BitcoinCashWallet'
import { BitcoreTransaction } from '../types'

const typeLabel = config.walletTypes.trezor.name

export default class BitcoinCashWalletTrezor extends BitcoinCashWallet {

  static type = 'BitcoinCashWalletTrezor'

  getType() { return BitcoinCashWalletTrezor.type }

  getTypeLabel() { return typeLabel }

  static fromPath(derivationPath?: string | null) {
    return Trezor.getHdAccount(networks.BCH, derivationPath)
      .then(({ xpub, path }) => new BitcoinCashWalletTrezor(xpub, path))
  }

  _signTx({ txData }: BitcoreTransaction): Promise<Partial<BitcoreTransaction>> {
    return Trezor.signPaymentTx(this._network, this.derivationPath, txData)
  }
}
