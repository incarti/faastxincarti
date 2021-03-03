import React, { Fragment } from 'react'
import { createStructuredSelector } from 'reselect'
import { Row, Col, Card, CardHeader, CardBody, Button, CardDeck, Input } from 'reactstrap'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import { Link } from 'react-router-dom'
import { compose, setDisplayName, lifecycle } from 'recompose'
import PieChart from './pieChart'
import AffiliateLayout from 'Components/Affiliate/Layout'
import SwapsTable from 'Components/Affiliate/SwapsTable'
import WithdrawalTable from 'Components/Affiliate/WithdrawalTable';
// import StatsChart from './statsChart'
import Units from 'Components/Units'
import LoadingFullScreen from 'Components/LoadingFullscreen'

import { getStats } from 'Actions/affiliate'
import classNames from 'class-names'

import { affiliateStats, getAffiliateBalance, getMinimumWithdrawal, 
  isLoadingLogin, isAffiliateLoggedIn, affiliateId } from 'Selectors'

import { statContainer, row, statCol } from './style'
import { card, cardHeader, text, smallCard, withdrawalOutline, input } from '../style'
import config from 'Config'


const AffiliateDashboard = ({ minimumWithdrawal, affiliateId, stats: { swaps_completed = 0, 
  value_btc = 0, affiliate_payouts_btc = 0, } = {}, isLoadingLogin, balance }) => {
  return (
    <Fragment>
      {isLoadingLogin ? (
        <LoadingFullScreen label='Loading Affiliate Stats...' />
      ) : (
        <AffiliateLayout className='pt-3'>
          {/* <StatsChart /> */}
          {swaps_completed > 0 ? (
            <Fragment>
              <Row className={classNames(row, statContainer, 'text-center mt-3')}>
                <Col className={classNames('mt-0', statCol)} sm='12' md='4'>
                  <div className={classNames('mx-auto')}>
                    <p className='text-center mb-0'>Swaps Completed</p>
                    <p className='pt-0 mb-0'>{swaps_completed}</p>
                  </div>
                </Col>
                <Col className={classNames('mt-xs-3 mt-md-0 mt-0', statCol)} sm='12' md='4'>
                  <div className={classNames('mx-auto')}>
                    <p className='text-center mb-0'>BTC Value of Swaps</p>
                    <p className='pt-0 mb-0'>{value_btc}</p>
                  </div>
                </Col>
                <Col className={classNames('mt-xs-3 mt-md-0 mt-0', statCol)} sm='12' md='4'>
                  <div className={classNames('mx-auto')}>
                    <p className='text-center mb-0'>BTC Earned</p>
                    <p className='pt-0 mb-0'>{affiliate_payouts_btc}</p>
                  </div>
                </Col>
              </Row>
              <Row className='mt-4'>
                <CardDeck style={{ flex: 1 }}>
                  <SwapsTable size='small'/>
                  <Card className={classNames(card, smallCard)}>
                    <CardHeader className={cardHeader}>Earnings Ready for Payout</CardHeader>
                    <CardBody className='text-center'>
                      <p className='mb-0' style={{ fontSize: 70 }}>🎉</p>
                      <Units value={balance} symbol='BTC' precision={6} style={{ fontSize: 50 }} className={classNames('font-weight-bold mt-0 mb-4 d-block', text)}/>
                      <Button 
                        tag={Link} 
                        to='/affiliates/settings' 
                        className={classNames(withdrawalOutline, 'flat px-4 mb-3')} 
                        color='primary'
                        disabled={balance < minimumWithdrawal}
                      >
                Initiate a Withdrawal
                      </Button>
                      {minimumWithdrawal && (
                        <p className={text}>
                          <small>** The minimum withdrawal is: {minimumWithdrawal} BTC</small>
                        </p>
                      )}
                    </CardBody>
                  </Card>
                </CardDeck>
              </Row>
              <Row className='mt-4'>
                <CardDeck style={{ flex: 1 }}>
                  <Card className={classNames(card, smallCard)}>
                    <CardHeader className={cardHeader}>Distribution of Swaps</CardHeader>
                    <CardBody>
                      <PieChart/>
                    </CardBody>
                  </Card>
                  <WithdrawalTable size='small'/>
                </CardDeck>
              </Row>
            </Fragment>
          ) : (
            <Fragment>
              <h2 className='text-dark mb-0 mt-3' style={{ fontWeight: 600 }}>Getting Started</h2>
              <Row>
                <Col>
                  <Row className='mt-4'>
                    <CardDeck style={{ flex: 1 }}>
                      <Card className={classNames(card, smallCard)}>
                        <CardHeader className={cardHeader}>Referral Link</CardHeader>
                        <CardBody>
                          <p className={classNames('mt-0 mb-4', text)}>
                          Present this link to your users or social media audience and earn {config.affiliateSettings.affiliate_margin}% on each swap they complete:
                          </p>
                          <Input className={classNames('flat', input)} value={`https://faa.st/swap?aid=${affiliateId}`} type='text' autoFocus readOnly/>
                          <div className='text-center'>
                            <Button 
                              tag={Link} 
                              to='/affiliates/settings' 
                              className={classNames(withdrawalOutline, 'flat px-4 mb-3 mt-4')} 
                              color='primary'
                            >
                            View in Settings
                            </Button>
                          </div>
                        </CardBody>
                      </Card>
                      <Card className={classNames(card, smallCard)}>
                        <CardHeader className={cardHeader}>API Integration</CardHeader>
                        <CardBody>
                          <p className={classNames('mt-0 mb-4', text)}>Provide swap support within your website or app and choose the fee you’ll earn on each transaction:</p>
                          <ul className='text-dark'>
                            <li><a href='https://api.faa.st' target='_blank noreferrer'>API Docs</a></li>
                            <li><a href='https://faa.st/knowledge/article/how-to-integrate-faast-api' target='_blank noreferrer'>Integration Tutorial</a></li>
                          </ul>
                        </CardBody>
                      </Card>
                    </CardDeck>
                  </Row>
                </Col>
              </Row>
            </Fragment>
          )}
        </AffiliateLayout>
      )}
    </Fragment>
  )
}

export default compose(
  setDisplayName('AffiliateDashboard'),
  connect(createStructuredSelector({
    stats: affiliateStats,
    balance: getAffiliateBalance,
    minimumWithdrawal: getMinimumWithdrawal,
    isLoadingLogin,
    loggedIn: isAffiliateLoggedIn,
    affiliateId,
  }), {
    getStats,
    push: push,
  }),
  lifecycle({
    componentDidMount() {
      const { loggedIn, push, isLoadingLogin } = this.props
      if (!loggedIn && !isLoadingLogin) {
        push('/affiliates/login')
      }
    },
    componentDidUpdate() {
      const { loggedIn, push, isLoadingLogin } = this.props
      if (!loggedIn && !isLoadingLogin) {
        push('/affiliates/login')
      }
    }
  })
)(AffiliateDashboard)
