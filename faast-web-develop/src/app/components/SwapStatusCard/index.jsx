import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes, defaultProps, withProps } from 'recompose'
import { Row, Col, Card, CardBody, CardFooter, Alert, Collapse, Button } from 'reactstrap'
import classNames from 'class-names'
import config from 'Config'
import withToggle from 'Hoc/withToggle'

import ChangePercent from 'Components/ChangePercent'
import ArrowIcon from 'Components/ArrowIcon'
import PriceArrowIcon from 'Components/PriceArrowIcon'
import CoinIcon from 'Components/CoinIcon'
import Units from 'Components/Units'
import UnitsLoading from 'Components/UnitsLoading'
import WalletLabel from 'Components/WalletLabel'
import Spinner from 'Components/Spinner'
import DataLayout from 'Components/DataLayout'
import T from 'Components/i18n/T'
import { statusIcons } from 'Components/TradeTable'

import style from './style.scss'

const StatusFooter = ({ className, light, children, ...props }) => (
  <CardFooter className={classNames('font-size-xs py-2 px-3', light && style.light, className)} {...props}>
    {children}
  </CardFooter>
)

const priceChange = (date, asset) => {
  const { change1, change7d, change24 } = asset
  // falsey date => hasn't loaded yet so default to 1h change
  date = new Date(date)
  const hoursSinceTrade = !date ? 0 : (Date.now() - date.getTime()) / 3600000
  const timespan = hoursSinceTrade <= 1 ? '1hr: ' : hoursSinceTrade >= 24 ? '7d: ' : '24hrs: '
  var priceChange = hoursSinceTrade <= 1 ? change1 : hoursSinceTrade >= 24 ? change7d : change24
  return (
    <span><T tag='span' i18nKey='app.swapStatusCard.last'>Last</T> {timespan}
      <ChangePercent>{priceChange}</ChangePercent>
      <PriceArrowIcon 
        className={classNames('swapChangeArrow', priceChange.isZero() ? 'd-none' : null)} 
        size={.58} dir={priceChange < 0 ? 'down' : 'up'} 
        color={priceChange < 0 ? 'danger' : priceChange > 0 ? 'success' : null}
      />
    </span>
  )
}

const getShortStatus = (swap) => {
  const { tx, status: { code, detailsCode, labelClass, label } } = swap
  if (detailsCode === 'signed') {
    return (<T tag='span' i18nKey='app.swapStatusCard.signed' className='text-success'>Signed</T>)
  } else if (detailsCode === 'signing_unsupported') {
    return (<T tag='span' i18nKey='app.swapStatusCard.ready' className='text-success'>Ready</T>)
  } else if (detailsCode === 'signing') {
    return (<T tag='span' i18nKey='app.swapStatusCard.awaiting' className='text-warning blink'>Awaiting signature</T>)
  } else if (detailsCode.includes('error')) {
    return (<T tag='span' i18nKey='app.swapStatusCard.failed' className='text-danger'>Failed</T>)
  } else if (detailsCode === 'sending') {
    return (<T tag='span' i18nKey='app.swapStatusCard.sending' className='text-primary'>Sending</T>)
  } else if ((tx && tx.sent) || code === 'failed') {
    return (<span className={labelClass}>{label}</span>)
  } else if (detailsCode === 'unsigned') {
    return null
  } else if (detailsCode === 'creating_tx' || detailsCode === 'fetching_rate') {
    return (<Spinner size='sm' inline/>)
  }
  return (<span>{label || code}</span>)
}

/* eslint-disable react/jsx-key */
export default compose(
  setDisplayName('SwapStatusCard'),
  setPropTypes({
    swap: PropTypes.object.isRequired,
    showWalletLabels: PropTypes.bool,
    showFees: PropTypes.bool,
    showDetails: PropTypes.bool,
    expanded: PropTypes.bool,
    showShortStatus: PropTypes.bool,
    light: PropTypes.bool
  }),
  defaultProps({
    showWalletLabels: true,
    showFees: false,
    showDetails: false,
    expanded: null,
    light: false,
  }),
  withToggle('expandedState'),
  withProps(({ swap, expanded, isExpandedState, toggleExpandedState }) => ({
    isExpanded: expanded === null ? isExpandedState : expanded,
    togglerProps: expanded === null ? { tag: Button, color: 'ultra-dark', onClick: toggleExpandedState } : {},
    shortStatus: getShortStatus(swap),
  }))
)(({
  swap: {
    orderId, sendWalletId, sendSymbol, sendAsset, sendAmount, marketMakerName,
    receiveWalletId, receiveSymbol, receiveAsset, receiveAmount, receiveAddress,
    error, friendlyError, rate, fee: swapFee, hasFee: hasSwapFee, depositTxId,
    tx: { feeAmount: txFee, feeSymbol: txFeeSymbol },
    status: { code, details, detailsCode }, createdAt, createdAtFormatted, initializing, isManual
  },
  shortStatus, showShortStatus, showDetails, isExpanded, togglerProps, expanded, light
}) => {
  const isComplete = code === 'complete'
  const explorerURL = txFeeSymbol ? config.explorerUrls[txFeeSymbol] : sendAsset.ERC20 ? config.explorerUrls['ETH'] : config.explorerUrls[sendSymbol]
  const loadingValue = (error
    ? (<span className='text-danger'>-</span>)
    : (<Spinner inline size='sm'/>))
  return (
    <Card className={classNames('flat', light && style.light)}>
      <CardBody
        className={classNames('py-2 pr-3 pl-2 border-0 lh-0', light && style.light, { 'py-3': !receiveAmount && !sendAmount })}
        style={{ minHeight: '4rem' }}
        {...togglerProps}>
        <Row className='gutter-0 align-items-center font-size-small text-muted'>
          <Col xs='auto'>
            { expanded === null ? <i style={{ transition: 'all .15s ease-in-out' }} className={classNames('fa fa-chevron-circle-down text-primary px-2 mr-2', { ['fa-rotate-180']: isExpanded })}/> : false }
          </Col>
          <Col>
            <Row className='gutter-2 align-items-center text-center text-sm-left'>
              <Col xs='12' sm='auto'><CoinIcon symbol={sendSymbol}/></Col>
              <Col xs='12' sm>
                <Row className='gutter-2'>
                  <Col xs='12' className={classNames('order-sm-2 font-size-sm pt-0', !light ? 'text-white' : style.textDark)}>{sendAsset.name}</Col>
                  {sendAmount ? (<Col xs='12' className={classNames(!light ? 'text-white' : style.textDark)}>
                    <Units value={sendAmount} symbol={sendSymbol} prefix='-'/>
                  </Col>) : null}
                  {sendAsset ? (<Col xs='12' className={classNames('mt-0 pt-0 order-sm-3 font-size-xs', !light ? 'text-white' : style.textDark)}>{priceChange(createdAt, sendAsset)}</Col>)
                    : null}
                </Row>
              </Col>
            </Row>
          </Col>
          <Col xs='auto' className='text-center'>
            <ArrowIcon inline size={1.5} dir='right' color={error ? 'danger' : 'success'}/><br/>
            {showShortStatus && (<small className='lh-0'>{shortStatus}</small>)}
          </Col>
          <Col>
            <Row className='gutter-2 align-items-center text-center text-sm-right'>
              <Col xs='12' sm='auto' className='order-sm-2'><CoinIcon symbol={receiveSymbol}/></Col>
              <Col xs='12' sm>
                <Row className='gutter-2'>
                  <Col xs='12' className={classNames('order-sm-2 font-size-sm pt-0', !light ? 'text-white' : style.textDark)}>{receiveAsset ? receiveAsset.name : receiveSymbol}</Col>
                  {receiveAmount ? (<Col xs='12' className={classNames(!light ? 'text-white' : style.textDark)}>
                    <UnitsLoading value={receiveAmount} symbol={receiveSymbol} error={error} prefix='+'/>
                  </Col>) : null}
                  {receiveAsset ? (<Col xs='12' className={classNames('mt-0 pt-0 order-sm-3 font-size-xs', !light ? 'text-white' : style.textDark)}>{priceChange(createdAt, receiveAsset)}</Col>)
                    : null}
                </Row>
              </Col>
            </Row>
          </Col>
        </Row>
      </CardBody>
      {error 
        ? (<StatusFooter tag={Alert} color='danger' className='m-0 text-center'>{friendlyError || error}</StatusFooter>)
        : (showDetails && details && (
          <StatusFooter className='text-center text-muted'>{details}</StatusFooter>
        ))}
      <Collapse isOpen={isExpanded}>
        <StatusFooter light={light}>
          <DataLayout rows={[
            [
              <T tag='span' i18nKey='app.swapStatusCard.status'>Status:</T>,
              <span className={classNames({
                'text-success': isComplete,
                'text-warning': detailsCode === 'contact_support',
                'text-danger': code === 'failed'
              })}>{details}</span>
            ],
            (!isManual || rate) && [
              <T tag='span' i18nKey='app.swapStatusCard.rate'>Rate:</T>,
              <UnitsLoading value={rate} symbol={sendSymbol} error={error} precision={null} prefix={`1 ${receiveSymbol} = `}/>
            ],
            (txFee || initializing) && [
              <T tag='span' i18nKey='app.swapStatusCard.network'>Network fee:</T>,
              <UnitsLoading value={txFee} symbol={txFeeSymbol} error={error} precision={null} showFiat />
            ],
            hasSwapFee && [
              <T tag='span' i18nKey='app.swapStatusCard.swapFee'>Swap fee:</T>,
              <UnitsLoading value={swapFee} symbol={receiveSymbol} error={error} precision={null}/>
            ],
            [
              isComplete ? <T tag='span' i18nKey='app.swapStatusCard.sent'>Sent:</T> : <span><T tag='span' i18nKey='app.swapStatusCard.sending'>Sending</T>:</span>,
              <Fragment>
                <UnitsLoading value={sendAmount} symbol={sendSymbol} error={error} precision={null}/>
                {sendWalletId && (
                  <span className='d-none d-xs-inline ml-2'>
                    <T tag='i' i18nKey='app.swapStatusCard.usingWallet'>using wallet</T> <WalletLabel.Connected id={sendWalletId} tag='span' hideIcon />
                  </span>
                )}
              </Fragment>
            ],
            [
              isComplete ? <T tag='span' i18nKey='app.swapStatusCard.received'>Received:</T> : <T tag='span' i18nKey='app.swapStatusCard.receiving'>Receiving:</T>,
              <Fragment>
                <UnitsLoading value={receiveAmount} symbol={receiveSymbol} error={error} precision={null}/>
                <span className='d-none d-xs-inline ml-2'>
                  {receiveWalletId ? (
                    <Fragment><T tag='i' i18nKey='app.swapStatusCard.usingWallet'>using wallet</T> <WalletLabel.Connected id={receiveWalletId} tag='span' hideIcon/></Fragment>
                  ) : (
                    <Fragment><T tag='i' i18nKey='app.swapStatusCard.atAddress'>at address</T> {receiveAddress}</Fragment>
                  )}
                </span>
              </Fragment>
            ],
            [
              <T tag='span' i18nKey='app.swapStatusCard.date'>Date:</T>,
              !createdAtFormatted ? loadingValue : createdAtFormatted
            ],
            marketMakerName && [
              <T tag='span' i18nKey='app.swapStatusCard.marketMaker'>Trading with:</T>,
              marketMakerName
            ],
            [
              <T tag='span' i18nKey='app.swapStatusCard.orderId'>Order ID:</T>,
              orderId ? orderId : loadingValue
            ],
            depositTxId && explorerURL && [
              <T tag='span' i18nKey='app.swapStatusCard.sentTx'>Sent txn:</T>,
              <Fragment>
                <a href={`${explorerURL}/tx/${depositTxId}`} target='_blank' rel='noopener noreferrer' className='word-break-all mr-2'>{depositTxId}</a> 
                {statusIcons[detailsCode] || statusIcons[code]}
              </Fragment>
            ]
          ]}/>
        </StatusFooter>
      </Collapse>
    </Card>
  )
})
