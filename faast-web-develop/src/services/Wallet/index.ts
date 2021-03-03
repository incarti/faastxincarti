if (typeof window === 'undefined') {
  throw new Error(`You really shouldnt be importing ${__filename} outsite of the app`)
}

export * from './lib'

import queryString from 'query-string'
import log from 'Utilities/log'
import blockstack from 'Utilities/blockstack'
import { sessionStorageGet, sessionStorageSet, sessionStorageRemove,
  sessionStorageForEach, localStorageSet, localStorageGet, localStorageRemove,
  localStorageForEach } from 'Utilities/storage'
import { Wallet, WalletSerializer, MultiWallet } from './lib'
import { AssetProvider } from './lib/types'

const legacyStorageKey = 'wallet'
const walletStorageKeyPrefix = 'faast-wallet-'
const multiWalletStorageKeyPrefix = 'faast-multiwallet-' // Deprecated

const walletStorageKey = (id: string) => `${walletStorageKeyPrefix}${id}`

const getStorageKey = (wallet: Wallet) => walletStorageKey(wallet.getId())

export class WalletService {

  activeWallets: { [id: string]: Wallet } = {}
  walletAssetProvider: AssetProvider = () => ({})

  setAssetProvider(assetProvider: AssetProvider) {
    this.walletAssetProvider = assetProvider
    Object.values(this.activeWallets).forEach((wallet) => wallet.setAssetProvider(assetProvider))
  }

  getStoredWalletKeys = (customType?: string) => {
    const walletKeys: string[] = []
    const multiWalletKeys: string[] = []
    const type = customType || localStorageGet('remember_wallets')
    const storageForEach = type === 'session' ? sessionStorageForEach : localStorageForEach
    const storageGet = type === 'session' ? sessionStorageGet : localStorageGet
    const storageRemove = type === 'session' ? sessionStorageRemove : localStorageRemove
    const storageSet = type === 'session' ? sessionStorageSet : localStorageSet
    storageForEach((key: string) => {
      if (key.startsWith(walletStorageKeyPrefix)) {
        walletKeys.push(key)
      } else if (key.startsWith(multiWalletStorageKeyPrefix)) {
        multiWalletKeys.push(key)
      }
    })
    // Migrate deprecated multiwallet keys
    multiWalletKeys.forEach((key) => {
      const newKey = key.replace(multiWalletStorageKeyPrefix, walletStorageKeyPrefix)
      const data = storageGet(key)
      storageRemove(key)
      storageSet(newKey, data)
      walletKeys.push(newKey)
    })
    return walletKeys
  }

  put = (wallet: Wallet) => {
    if (wallet) {
      wallet.setAssetProvider(this.walletAssetProvider)
      wallet.setWalletGetter(this.get)
      this.activeWallets[wallet.getId()] = wallet
    }
    return wallet
  }

  /** Get all wallets as array */
  getAll = () => Object.values(this.activeWallets)

  /** Get all wallets as an object mapped by ID */
  getAllById = () => ({ ...this.activeWallets })

  /** Get a Wallet by ID. Returns if already a Wallet */
  get = (walletOrId: Wallet | string) => {
    if (walletOrId instanceof Wallet) {
      return walletOrId
    }
    const id = walletOrId
    return this.activeWallets[id]
  }

  getOrThrow = (id: string, errorMessage?: string) => {
    const wallet = this.get(id)
    if (!wallet) {
      throw new Error(errorMessage || `Cannot get wallet with id ${id}. Please try to reconnect your wallet.`)
    }
    return wallet
  }

  /** Remove the provided Wallet or Wallet with specified ID and delete from session */
  remove = (walletOrId: Wallet | string) => {
    let id: string
    if (walletOrId instanceof Wallet) {
      id = walletOrId.getId()
    } else {
      id = walletOrId
    }
    const removedWallet = this.activeWallets[id]
    if (removedWallet) {
      delete this.activeWallets[id]
      this.deleteFromStorage(removedWallet)
    }
    return removedWallet
  }

  /** Removes all Wallets and clears any stored in the session */
  removeAll = () => {
    const type = localStorageGet('remember_wallets')
    Object.keys(this.activeWallets).map((w) => this.remove(w))
  }

  /** Load the wallet from session at the provided storage key */
  loadFromStorage = (storageKey: string, customType?: string) => {
    const type = customType || localStorageGet('remember_wallets')
    const walletString = type === 'session' ? sessionStorageGet(storageKey) : localStorageGet(storageKey)
    if (walletString) {
      const wallet = WalletSerializer.parse(walletString)
      if (wallet) {
        log.debug('wallet loaded from session', wallet.getId())
      } else {
        log.debug('failed to load wallet from session key', storageKey)
      }
      return wallet
    }
  }

  switchBetweenStorage = (type: string) => {
    if (type === 'session') {
      this.getStoredWalletKeys('local').forEach((key) => {
        const wallet = this.loadFromStorage(key, 'local')
        this.saveToStorage(wallet)
        this.deleteFromStorage(wallet, 'local')
      })
    } else {
      this.getStoredWalletKeys('session').forEach((key) => {
        const wallet = this.loadFromStorage(key, 'session')
        this.saveToStorage(wallet)
        this.deleteFromStorage(wallet, 'session')
      })
    }
  }

  /** Save the provided wallet to session storage */
  saveToStorage = (wallet: Wallet | null) => {
    const type = localStorageGet('remember_wallets')
    if (wallet && wallet.isPersistAllowed()) {
      const id = wallet.getId()
      const storageKey = getStorageKey(wallet)
      if (type === 'session') {
        sessionStorageSet(storageKey, WalletSerializer.stringify(wallet))
      } else {
        localStorageSet(storageKey, WalletSerializer.stringify(wallet))
      }
      log.debug('wallet saved to session', id)
    }
    return wallet
  }

  deleteFromStorage = (wallet: Wallet | null, customType?: string) => {
    const type = customType || localStorageGet('remember_wallets')
    if (wallet) {
      const id = wallet.getId()
      const key = getStorageKey(wallet)
      if (type === 'session') {
        if (sessionStorageGet(key)) {
          sessionStorageRemove(key)
          log.debug('wallet deleted from session', id)
        }
      } else {
        if (localStorageGet(key)) {
          localStorageRemove(key)
          log.debug('wallet deleted from localstorage', id)
        }
      }
    }
    return wallet
  }

  /** Restore all wallets stored in session */
  restoreStorage = () => this.getStoredWalletKeys().map((key) => {
    const type = localStorageGet('remember_wallets')
    const wallet = this.loadFromStorage(key)
    if (wallet) {
      const newStorageKey = getStorageKey(wallet)
      if (key !== newStorageKey) {
        if (type === 'session') {
          sessionStorageRemove(key)
        } else {
          localStorageRemove(key)
        }
        this.saveToStorage(wallet)
        log.debug(`migrated wallet from session key ${key} to ${newStorageKey}`)
      }
      this.put(wallet)
    }
  })

  /** Convert legacy wallet to new storage format, store in the new format and return the wallet */
  restoreLegacy = () => {
    const legacyWallet = this.loadFromStorage(legacyStorageKey)
    if (legacyWallet) {
      log.debug('restored legacy wallet', legacyWallet.getId())
      this.saveToStorage(legacyWallet)
      this.put(legacyWallet)
    }
    sessionStorageRemove(legacyStorageKey)
    return legacyWallet
  }

  /** Parse the wallet from url query string and store in session */
  restoreQueryString = () => {
    if (typeof window !== 'undefined') {
      const { wallet: walletParam } = queryString.parse(window.location.search)
      if (walletParam) {
        const encodedWallets = Array.isArray(walletParam) ? walletParam : [walletParam]
        return encodedWallets.map((encoded) => {
          const encryptedWalletString = Buffer.from(encoded, 'base64').toString()
          const wallet = WalletSerializer.parse(encryptedWalletString)
          if (wallet) {
            log.debug('restored querystring wallet', wallet.getId())
            this.saveToStorage(wallet)
            this.put(wallet)
            return wallet
          }
      })
    }
    }
  }

  restoreBlockstack = () => {
    const wallet = blockstack.restoreWallet()
    if (wallet) {
      log.debug('restored blockstack wallet', wallet.getId())
      this.put(wallet)
      return wallet
    }
  }

  add = (wallet: any) => {
    if (wallet instanceof Wallet) {
      const id = wallet.getId()
      if (!this.activeWallets.hasOwnProperty(id)) {
        log.debug('adding new wallet', id)
      }
      this.put(wallet)
      this.saveToStorage(wallet)
    } else {
      log.error('not a wallet', wallet)
    }
    return wallet
  }

  update = this.add

  restoreAll = () => {
    this.restoreStorage()
    this.restoreLegacy()
    this.restoreQueryString()
    this.restoreBlockstack()
    // Filter invalid wallet references
    const activeWalletIds = new Set(Object.keys(this.activeWallets))
    const activeWalletsList = Object.values(this.activeWallets)
    activeWalletsList.forEach((wallet) => {
      if (wallet instanceof MultiWallet) {
        wallet.walletIds = new Set(Array.from(wallet.walletIds).filter((walletId) => activeWalletIds.has(walletId)))
      }
    })
    log.debug('wallets restored', Object.keys(this.activeWallets))
    return activeWalletsList
  }
}

const defaultWalletService = new WalletService()

export default defaultWalletService
