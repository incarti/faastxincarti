import Faast from 'Services/Faast'
import { newScopedCreateAction, idPayload } from 'Utilities/action'
import log from 'Log'
import toastr from 'Utilities/toastrWrapper'
import { getWalletForAsset } from 'Utilities/wallet'
import { toNumber, toBigNumber } from 'Utilities/convert'
import { retrievePairData } from 'Common/actions/rate'
import { createTx, updateTxReceipt, pollTxReceipt } from 'Actions/tx'
import uuid from 'uuid/v4'

import { getSwap } from 'Common/selectors/swap'

/** A special value passed to the backend when not sending/receiving from a connected wallet */
const EXTERNAL_WALLET_TYPE = 'External'

const createAction = newScopedCreateAction(__filename)

export const swapAdded = createAction('ADDED')
export const swapInitStarted = createAction('INIT_STARTED', idPayload)
export const swapOrderStatusUpdated = createAction('STATUS_UPDATED', (id, status) => ({ id, orderStatus: status }))
export const swapInitSuccess = createAction('INIT_SUCCESS', idPayload)
export const swapInitFailed = createAction('INIT_FAILED', (id, errorMessage) => ({ id, error: errorMessage }))
export const swapUpdated = createAction('UPDATED', (id, data) => ({ id, ...data }))
export const swapError = createAction('ERROR', (id, error, errorType = '') => ({ id, error, errorType }))
export const restoreSwaps = createAction('RESTORE_SWAPS', swaps => swaps)

export const getSwapsByAddress = (walletId, page = 1, limit = 100) => () => {
  return Faast.fetchOrders(walletId, page, limit, false)
    .then((orders) => orders)
}

export const getSwapByOrderId = (swapId) => () => {
  return Faast.fetchSwap(swapId, false)
    .then((swap) => swap)
}

const getFreshAddress = (walletInstance, symbol) => walletInstance
  ? walletInstance.getFreshAddress(symbol)
  : undefined

const getMetaWalletType = (walletInstance) => {
  if (!walletInstance) {
    return EXTERNAL_WALLET_TYPE
  }
  const type = walletInstance.getType()
  if (walletInstance.providerName) {
    return `${type}_${walletInstance.providerName}`
  }
  return type
}

const createSwapFinish = (type, swap) => (dispatch, getState) => (errorMessage, updatedFields) => {
  if (errorMessage) {
    dispatch(swapError(swap.id, errorMessage, type))
  }
  if (updatedFields && Object.keys(updatedFields).length > 0) {
    dispatch(swapUpdated(swap.id, updatedFields))
  }
  const finishedSwap = getSwap(getState(), swap.id)
  dispatch(pollOrderStatus(finishedSwap)) 
  return finishedSwap
}

export const createOrder = (swap) => (dispatch) => {
  if (!swap) {
    log.error(`Cannot create swap order for ${swap}`)
    return
  }
  let {
    id, sendAmount, sendSymbol, receiveSymbol, sendWalletId, receiveWalletId, receiveAmount: withdrawalAmount,
    receiveAddressExtraId, refundAddressExtraId,
  } = swap
  return Promise.resolve().then(() => {
    if (swap.error) return swap
    const finish = dispatch(createSwapFinish('createOrder', swap))
    return dispatch(retrievePairData(sendSymbol, receiveSymbol, sendAmount, withdrawalAmount))
      .then((pairData) => {
        if (sendAmount) {
          const minDeposit = toBigNumber(pairData.minimum_deposit)
          const maxDeposit = toBigNumber(pairData.maximum_deposit)
          if (minDeposit.gt(sendAmount)) {
            return finish(`Send amount must be at least ${minDeposit} ${sendSymbol}`)
          }
          if (sendAmount.gt(maxDeposit)) {
            return finish(`Send amount cannot be greater than ${maxDeposit} ${sendSymbol} to ensure efficient pricing.`)
          }
        }
        if (!receiveWalletId && !swap.receiveAddress) {
          throw new Error('Must specify receive wallet or receive address')
        }
        const sendWalletInstance = sendWalletId ? getWalletForAsset(sendWalletId, sendSymbol) : null
        const receiveWalletInstance = receiveWalletId ? getWalletForAsset(receiveWalletId, receiveSymbol) : null
        const userId = sendWalletInstance ? sendWalletInstance.getId() : undefined
        const sendWalletType = getMetaWalletType(sendWalletInstance)
        const receiveWalletType = getMetaWalletType(receiveWalletInstance)
        log.info(`Creating faast order for swap ${id}`)
        return Promise.all([
          swap.receiveAddress || getFreshAddress(receiveWalletInstance, receiveSymbol),
          swap.refundAddress || getFreshAddress(sendWalletInstance, sendSymbol),
        ]).then(([receiveAddress, refundAddress]) => Faast.createNewOrder({
          sendSymbol,
          receiveSymbol,
          receiveAddress,
          receiveAddressExtraId, // optional
          withdrawalAmount: withdrawalAmount ? toNumber(withdrawalAmount) : undefined, // optional
          refundAddress,  // optional
          refundAddressExtraId, // optional
          sendAmount: sendAmount ? toNumber(sendAmount) : undefined, // optional
          userId, // optional
          meta: {
            sendWalletType, // optional
            receiveWalletType, // optional
          },
        }))
          .then((order) => {
            const updatedFields = {
              ...order,
              sendWalletId: sendWalletInstance ? sendWalletInstance.getId() : swap.sendWalletId,
              receiveWalletId: receiveWalletInstance ? receiveWalletInstance.getId() : swap.receiveWalletId
            }
            return finish(null, updatedFields)
          })
      })
      .catch((e) => {
        log.error('createOrder', e)
        return finish(`Failed to create swap for pair ${sendSymbol}->${receiveSymbol}, please contact support@faa.st. Error: ${e.message}`)
      })
  })
}

export const refreshSwap = (swapOrderId) => (dispatch, getState) => {
  return Faast.refreshSwap(swapOrderId)
    .then((swap) => {
      const existingSwap = getSwap(getState(), swapOrderId)
      swap.id = existingSwap ? existingSwap.id : swap.orderId
      dispatch(swapUpdated(swap.id, swap))
    })
    .catch((e) => {
      log.error(`Failed to refresh swap ${swapOrderId}`, e)
      toastr.error(`Failed to refresh swap ${swapOrderId}`)
      throw e
    })
}

export const setSwapTx = (swapId, tx, outputIndex = 0) => (dispatch) => {
  dispatch(swapUpdated(swapId, { sendAmount: tx.outputs[outputIndex].amount, txId: tx.id }))
}

export const createSwapTx = (swap, options) => (dispatch) => Promise.resolve().then(() => {
  if (swap.error) return swap
  log.debug('createSwapTx', swap)
  const { sendAmount, sendSymbol, sendWalletId, depositAddress } = swap
  const finish = dispatch(createSwapFinish('createSwapTx', swap))
  return dispatch(createTx(sendWalletId, depositAddress, sendAmount, sendSymbol, options))
    .then((tx) => {
      dispatch(setSwapTx(swap.id, tx))
      return tx
    })
    .catch((e) => {
      log.error('createSwapTx', e)
      return finish('Error creating deposit transaction')
    })
})

export const createSwap = (swapParams, options) => (dispatch, getState) => {
  const swapId = (swapParams.id = swapParams.id || uuid())
  dispatch(swapAdded(swapParams))
  dispatch(swapInitStarted(swapParams.id))
  return dispatch(createOrder(swapParams))
    .then((swap) => {
      if (swap.error) {
        throw new Error(swap.error)
      }
      swap.id = swapId
      options = {
        ...options,
        extraId: swap.depositAddressExtraId
      }
      if (swap.sendWalletId) {
        return dispatch(createSwapTx(swap, options))
      }
      return swap
    })
    .then(() => dispatch(swapInitSuccess(swapId)))
    .then(() => getSwap(getState(), swapId))
    .catch((e) => {
      log.error('Failed to create swap', swapParams, e)
      if (e) {
        toastr.error(e.message)
      } else {
        toastr.error('Failed to create swap, please contact support@faa.st')
      }
      dispatch(swapInitFailed(swapId, e.message || e))
      throw e
    })
}

const updateOrderStatus = (swap) => (dispatch) => {
  const { id, orderId, orderStatus } = swap
  if (!orderId) {
    log.info(`updateOrderStatus: swap ${id} has no orderId`)
    return
  }
  return Faast.fetchSwap(orderId)
    .then((order) => {
      if (order.orderStatus !== orderStatus) {
        dispatch(swapOrderStatusUpdated(id, order.orderStatus))
      }
      return order
    })
    .catch(log.error)
}

const isSwapFinalized = (swap) => swap && (swap.orderStatus === 'complete' || swap.orderStatus === 'failed' || swap.orderStatus === 'cancelled')

export const pollOrderStatus = (swap) => (dispatch) => {
  const { id, orderId, orderStatus, tx, errorType, isManual, createdAt } = swap
  const createdAtInt = createdAt ? createdAt.getTime() : Date.now()
  const over2DayOld = (Date.now() - createdAtInt) > 86400000 * 2
  if (!orderId) {
    log.warn(`pollOrderStatus: swap ${id} has no orderId`)
    return
  }
  if (isSwapFinalized(swap)) {
    log.debug(`pollOrderStatus: swap ${id} is finalized, won't poll`)
    return
  }
  if ((orderStatus === 'awaiting deposit' && (errorType === 'createSwapTx' || (tx && !tx.sent))
    && !isManual)) {
    log.debug(`pollOrderStatus: swap ${id} has unsent tx, won't poll`)
    return
  }
  if (orderStatus === 'awaiting deposit' && over2DayOld) {
    log.debug(`pollOrderStatus: swap ${id} is old won't poll`)
    return
  }
  const orderStatusInterval = window.setInterval(() => {
    dispatch(updateOrderStatus(swap))
      .then((order) => {
        if (isSwapFinalized(order)) {
          clearInterval(orderStatusInterval)
        }
      })
  }, 10000)

  window.faast.intervals.orderStatus.push(orderStatusInterval)
}

export const restoreSwapPolling = (swapId) => (dispatch, getState) => {
  let swap = getSwap(getState(),  swapId)
  if (!swap) {
    log.debug(`restoreSwapPolling: could not find swap ${swapId}`)
    return
  }
  return Promise.all([
    swap.txId ? updateTxReceipt(swap.txId) : null,
    updateOrderStatus(swap)
  ]).then(() => {
    swap = getSwap(getState(), swap.id)
    const { tx } = swap
    if (tx && tx.sent && !tx.receipt) {
      dispatch(pollTxReceipt(swap.txId))
        .then(() => {
          Faast.provideSwapDepositTx(swap.orderId, tx.hash)
          return pollOrderStatus(swap)
        })
    } else {
      dispatch(pollOrderStatus(swap))
    }
  }).catch((e) => {
    console.log('error restoring', e)
  })
}