import React, { Fragment } from 'react'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import { createStructuredSelector } from 'reselect'
import { isDefaultPortfolioEmpty } from 'Selectors/portfolio'
import { compose, setDisplayName, withPropsOnChange } from 'recompose'
import { Row, Col } from 'reactstrap'
import Layout from 'Components/Layout'
import * as qs from 'query-string'
import { withRouter } from 'react-router'
import { isAppBlocked } from 'Selectors'
import Link from 'Components/Link'

import Blocked from 'Components/Blocked'
import StepOne from './StepOne'
import StepTwo from './StepTwo'

const SwapWidget = ({ orderId, blocked, stepOne, isDefaultPortfolioEmpty }) => (
  <Fragment>
    <Helmet>
      <title>Instantly and Safely Trade 70+ Cryptocurrencies - Faa.st</title>
      <meta name='description' content='Trade your crypto directly from your hardware or software wallet. Swap Bitcoin, Ethereum, Litecoin, Monero, Tron, and more with near-zero fees.' /> 
    </Helmet>
    {blocked ? (
      <Blocked/>
    ) : null}
    <Layout className='pt-3 p-0 p-sm-3'>
      <Row 
        tag={'a'}
        href='https://academy.binance.com/en/glossary/bep-20'
        target='_blank noreferrer'
        className='px-3 py-2 mb-3 mx-0 custom-hover cursor-default' 
        style={{ background: 'linear-gradient(45deg, #e0b01f 0%, #b88e11 100%)', borderRadius: 2, }}>
        <Col>
          <span className='text-white'>IMPORTANT: Faa.st does not support binance smart chain tokens. Any BEP-20 tokens sent to a Faa.st address will be lost forever.</span>
        </Col>
      </Row>
      {!orderId
        ? (<StepOne {...stepOne}/>) 
        : (<StepTwo orderId={orderId} />)}
      {!isDefaultPortfolioEmpty && (
        <div className='text-center mt-3 font-sm'>
          <Link to='/rebalance'>Want to swap multiple coins at once? Use our rebalance tool.</Link>
        </div>
      )}
    </Layout>
  </Fragment>
)

export default compose(
  setDisplayName('SwapWidget'),
  connect(createStructuredSelector({
    blocked: isAppBlocked,
    isDefaultPortfolioEmpty,
  }),{
  }),
  withRouter,
  withPropsOnChange(['location'], ({ location }) => {
    const urlParams = qs.parse(location.search)
    let { id, from, fromAmount, fromAddress, to, toAmount, toAddress } = urlParams
    fromAmount = fromAmount && parseFloat(fromAmount)
    toAmount = toAmount && parseFloat(toAmount)
    return {
      orderId: id,
      stepOne: {
        sendSymbol: from,
        receiveSymbol: to,
        defaultSendAmount: fromAmount,
        defaultReceiveAmount: toAmount,
        defaultRefundAddress: fromAddress,
        defaultReceiveAddress: toAddress,
      },
    }
  })
)(SwapWidget)
