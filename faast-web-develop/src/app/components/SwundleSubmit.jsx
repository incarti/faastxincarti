import {
  compose, setDisplayName, withHandlers, withProps,
} from 'recompose'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'

import {
  getCurrentSwundle, 
  isCurrentSwundleReadyToSign, isCurrentSwundleReadyToSend,
  isCurrentSwundleSigning, isCurrentSwundleSending,
  doesCurrentSwundleRequireSigning, isCurrentSwundleSent
} from 'Selectors'
import { signSwundle, sendSwundle, removeSwundle } from 'Actions/swundle'

import SwapSubmit from 'Components/SwapSubmit'

export default compose(
  setDisplayName('SwundleSubmit'),
  connect(createStructuredSelector({
    swundle: getCurrentSwundle,
    requiresSigning: doesCurrentSwundleRequireSigning,
    readyToSign: isCurrentSwundleReadyToSign,
    readyToSend: isCurrentSwundleReadyToSend,
    startedSigning: isCurrentSwundleSigning,
    startedSending: isCurrentSwundleSending,
    finishedSending: isCurrentSwundleSent,
  }), {
    removeSwundle,
    signSwundle,
    sendSwundle,
  }),
  withHandlers({
    onCancel: ({ swundle, removeSwundle }) => () => removeSwundle(swundle),
    onSign: ({ swundle, signSwundle }) => () => signSwundle(swundle).then((swundle) => swundle.swaps),
    onSend: ({ swundle, sendSwundle }) => () => sendSwundle(swundle).then((swundle) => swundle.swaps),
  }),
  withProps(({ swundle }) => ({
    swap: swundle ? swundle.swaps : null
  }))
)(SwapSubmit)
