import ledgerLogo from '../../res/img/wallet/ledger.png'
import inverseLedgerLogo from '../../res/img/wallet/ledger-black-logo.png'
import trezorLogo from '../../res/img/wallet/trezor.png'
import inverseTrezorLogo from '../../res/img/wallet/trezor-black-logo.png'
import blockstackLogo from '../../res/img/wallet/blockstack.png'
import metamaskLogo from '../../res/img/wallet/metamask.png'
import mistLogo from '../../res/img/wallet/mist.png'
import parityLogo from '../../res/img/wallet/parity.svg'
import coinbaseLogo from '../../res/img/wallet/coinbase.png'
import trustLogo from '../../res/img/wallet/trust.png'
import statusLogo from '../../res/img/wallet/status.png'

import ledgerGraphic from '../../res/img/wallet/ledgerGraphic.png'
import trezorGraphic from '../../res/img/wallet/trezorGraphic.png'
import blockstackGraphic from '../../res/img/wallet/blockstackGraphic.jpg'
import metamaskGraphic from '../../res/img/wallet/metamaskGraphic.png'
import mistGraphic from '../../res/img/wallet/mistGraphic.png'
import parityGraphic from '../../res/img/wallet/parityGraphic.jpg'
import coinbaseGraphic from '../../res/img/wallet/coinbaseGraphic.png'
import trustGraphic from '../../res/img/wallet/trustGraphic.png'
import statusGraphic from '../../res/img/wallet/statusGraphic.png'

import { i18nTranslate as t } from '../utilities/translate'

const switchPathSegwit = {
  primaryPrefix: 'm/49',
  primaryLabel: 'segwit account',
  secondaryPrefix: 'm/44',
  secondaryLabel: t('app.walletTypes.nonSegwit', 'legacy (non-segwit) account'),
}

const commonSupportedAssets = {
  BTC: {
    derivationPath: 'm/49\'/0\'/0\'',
    switchPath: switchPathSegwit,
  },
  BCH: {
    derivationPath: 'm/44\'/145\'/0\'',
    switchPath: {
      primaryPrefix: 'm/44\'/145\'',
      primaryLabel: 'post-fork account',
      secondaryPrefix: 'm/44\'/0\'',
      secondaryLabel: t('app.walletTypes.preFork', 'legacy (pre-fork) account'),
    }
  },
  LTC: {
    derivationPath: 'm/49\'/2\'/0\'',
    switchPath: switchPathSegwit,
  }
}

export default {
  ledger: {
    name: 'Ledger Wallet',
    icon: ledgerLogo,
    inverseIcon: inverseLedgerLogo,
    website: 'https://www.ledger.com/',
    hardware: true,
    slogan: 'Keep your crypto secure, everywhere.', 
    description: 'Ledger offers smartcard-based crypto asset hardware wallets bringing optimal protection level to your bitcoins, ethereums, ripple and more - without sacrificing usability or control.',
    graphic: ledgerGraphic,
    howTo: 'https://medium.com/faast/how-to-make-effortless-cross-chain-trades-with-a-ledger-wallet-d71f5d16a43d',
    translationKey: 'app.walletTypes.ledger',
    supportedAssets: {
      ETH: {
        derivationPath: 'm/44\'/60\'/0\'/0',
        legacy: 'm/44\'/60\'/0\''
      },
      XRP: {
        derivationPath: 'm/44\'/144\'/0\'/0'
      },
      ...commonSupportedAssets,
    },
    active: true
  },
  trezor: {
    name: 'TREZOR',
    icon: trezorLogo,
    inverseIcon: inverseTrezorLogo,
    graphic: trezorGraphic,
    slogan: 'The safe place for your coins.',
    description: 'Trezor offers you a secure vault for your digital assets. Store bitcoins, litecoins, passwords, logins, and keys without worries.',
    howTo: 'https://medium.com/faast/how-to-make-effortless-cross-chain-trades-with-a-trezor-wallet-50f6e85fe923',
    website: 'https://trezor.io/',
    hardware: true,
    translationKey: 'app.walletTypes.trezor',
    supportedAssets: {
      ETH: {
        derivationPath: 'm/44\'/60\'/0\'/0'
      },
      ...commonSupportedAssets,
    },
    active: true
  },
  blockstack: {
    name: 'Blockstack',
    icon: blockstackLogo,
    website: 'https://blockstack.org',
    graphic: blockstackGraphic,
    slogan: 'The easiest way to start building decentralized blockchain apps.',
    description: 'Blockstack is building an ecosystem that gives your users control over their fundamental digital rights.',
    active: false,
    translationKey: 'app.walletTypes.blockstack',
  },
  metamask: {
    name: 'MetaMask',
    website: 'https://metamask.io/',
    icon: metamaskLogo,
    web3: true,
    graphic: metamaskGraphic,
    slogan: 'Bring Ethereum to your browser.',
    description: 'MetaMask is a bridge that allows you to visit the distributed web of tomorrow in your browser today. It allows you to run Ethereum dApps right in your browser.', 
    howTo: 'https://medium.com/faast/metamask-faast-the-easiest-way-to-diversify-your-cryptocurrency-portfolio-4551ea649439',
    active: true,
    translationKey: 'app.walletTypes.metamask',
  },
  mist: {
    name: 'Mist Browser',
    website: 'https://github.com/ethereum/mist',
    icon: mistLogo,
    web3: true,
    graphic: mistGraphic,
    slogan: 'Mist. Browse and use Ðapps on the Ethereum network.',
    description: 'The Mist browser is the tool of choice to browse and use Ðapps.',
    active: false,
    translationKey: 'app.walletTypes.mist',
  },
  parity: {
    name: 'Parity',
    icon: parityLogo,
    website: 'https://www.parity.io/',
    web3: true,
    graphic: parityGraphic,
    slogan: 'Blockchain Infrastructure for the Decentralised Web.',
    description: 'Parity Technologies builds core blockchain infrastructure. From Parity Ethereum, the most advanced Ethereum client, to Polkadot, the next-generation interoperable blockchain network.',
    active: false,
    translationKey: 'app.walletTypes.parity',
  },
  coinbase: {
    name: 'Coinbase Wallet',
    website: 'https://wallet.coinbase.com/',
    icon: coinbaseLogo,
    web3: true,
    graphic: coinbaseGraphic,
    slogan: 'The easiest and most secure crypto wallet.',
    description: 'Coinbase: the simple, safe way to buy, manage and sell your cryptocurrency.',
    howTo: 'https://medium.com/faast/how-to-use-coinbase-wallet-with-faast-and-swap-cryptocurrency-on-your-smartphone-846e8a5f93d1',
    active: true,
    translationKey: 'app.walletTypes.coinbase',
  },
  trust: {
    name: 'Trust Wallet',
    website: 'https://trustwalletapp.com/',
    icon: trustLogo,
    web3: true,
    graphic: trustGraphic,
    slogan: 'Secure wallet for Ethereum, ERC20, ERC223 & ERC721 tokens.',
    description: 'Trust Wallet is the best ethereum wallet and multi cryptocurrency wallet to store your favourite ERC721 &  ERC20 tokens.',
    active: true,
    translationKey: 'app.walletTypes.trust',
  },
  status: {
    name: 'Status',
    website: 'https://status.im/',
    icon: statusLogo,
    web3: true,
    graphic: statusGraphic,
    slogan: 'Access a Better Web, Anywhere.',
    description: 'With Status you can chat, browse and transact securely in an open source community committed to bringing the power of Ethereum and a more distributed internet to your pocket.',
    howTo: 'https://medium.com/faast/how-to-use-status-mobile-ethereum-wallet-with-faast-4936620e96fd',
    active: true,
    translationKey: 'app.walletTypes.status',
  }
}
