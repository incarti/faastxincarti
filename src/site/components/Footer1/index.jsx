import React from 'react'
import { compose, setDisplayName, setPropTypes, defaultProps } from 'recompose'
import { Row, Col, Button } from 'reactstrap'
import siteConfig from 'Site/config'
import classNames from 'class-names'
import PropTypes from 'prop-types'

import { betaTag } from '../Header/style.scss'

import FooterChart from 'Img/footer-chart.svg'
import LangLink from 'Components/LangLink'
import EmailSub from 'Site/components/EmailSubscription1'

import style from './style.scss'

export default compose(
  setDisplayName('Footer'),
  setPropTypes({
    footerClass: PropTypes.string,
    theme: PropTypes.string
  }),
  defaultProps({
    footerClass: '',
    theme: 'dark'
  })
)(({ footerClass, theme, translations, translations: { static: { footer: t = {} } = {} } }) => (
  <div style={{ backgroundColor: '#191A1D', marginTop: theme == 'dark' ? 320 : 0 }} className='pt-0'>
    <div className='footer-clean position-relative' style={{ backgroundColor: '#191A1D', paddingTop: theme != 'dark' && 70 }}>
      {theme == 'dark' && (
        <div style={{ top: -150 }} className='position-absolute'>
          <img style={{ width: '100vw', height: 260 }} src={FooterChart} />
        </div>
      )}
      <Row className='p-0 m-0'>
        <Col className='px-0'>
          <EmailSub translations={translations} />
        </Col>
      </Row>
      <Row className='m-0 p-0'>
        <Col className={classNames(style.ctaContainer, 'mx-auto d-flex mb-5 px-md-5 px-0 pl-xs-4 pl-md-5 pl-3 py-md-0 py-4')}>
          <Row style={{ flex: 1 }} className='mx-0 px-0 justify-content-between align-items-center'>
            <Col className='p-0 m-0 d-flex' xs='12' md='6'>
              <h2 className='text-white my-3'>{t.readyToTrade}</h2>
            </Col>
            <Col className='p-0 m-0 mt-xs-3 mt-md-0 mt-0 d-flex justify-content-xs-start justify-content-md-end' xs='12' md='6'>
              <Button tag='a' href='/app/connect' className='text-white mr-3' color='primary'>{t.connectYourWallet}</Button>
              <Button tag='a' href='https://api.faa.st' target='_blank' color='white'>{t.apiDocs}</Button>
            </Col>
          </Row>
        </Col>
      </Row>
      <footer>
        <div className={classNames('container', footerClass)} style={{ paddingTop: '40px' }}>
          <div className='row no-gutters'>
            <div className='col-6 col-sm-6 col-md-2 col-xl-2 offset-xl-1 item px-3'>
              <h3 className='text-white mb-4' style={{ fontWeight: 'normal', fontSize: 20 }}>Faa.st</h3>
              <ul>
                <li><a className='text-white' href='/affiliates'>{t.affiliate}</a></li>
                <li><a className='text-white' href='/partners'>Partners</a></li>
                <li><a className='text-white font-xs' href='/app'>{t.portfolio}</a></li>
                <li><a className='text-white' href='/app/swap'>{t.swap}</a></li>
                <li><LangLink className='text-white' to='/market-maker'>{t.marketMaker} <sup className={classNames(betaTag, 'text-primary')}><i>{t.beta}</i></sup></LangLink></li>
                <li><a className='text-white' href='/law-enforcement'>Law Enforcement</a></li>
                <li><a className='text-white' href='https://status.faa.st' target='_blank noreferrer'>Status</a></li>
                <li><a className='text-white' href='/blog'>{t.blog}</a></li>
                <li><a className='text-white' href='https://hackerone.com/bitaccess'>Bug Bounty</a></li>
              </ul>
            </div>
            <div className='col-6 col-sm-6 col-md-2 col-xl-2 item px-3'>
              <h3 className='text-white mb-4' style={{ fontWeight: 'normal', fontSize: 20 }}>{t.assets}</h3>
              <ul>
                <li><a className='text-white' href='/assets'>{t.supportedAssets}</a></li>
                <li><a className='text-white' href='/app/assets'>{t.marketCap}</a></li>
                <li><a className='text-white' href='/app/assets/trending'>{t.trending}</a></li>
                <li><a className='text-white' href='/app/assets/watchlist'>{t.watchlist}</a></li>
              </ul>
            </div>
            <div className='col-6 col-sm-6 col-md-2 col-xl-2 item px-3'>
              <h3 className='text-white mb-4' style={{ fontWeight: 'normal', fontSize: 20 }}>{t.wallets}</h3>
              <ul>
                <li><LangLink className='text-white' to='/wallets/trezor'>{t.trezor}</LangLink></li>
                <li><LangLink className='text-white' to='/wallets/ledger-wallet'>{t.ledger}</LangLink></li>
                <li><LangLink className='text-white' to='/wallets/metamask'>{t.metaMask}</LangLink></li>
                <li><LangLink className='text-white' to='/wallets/mist-browser'>{t.mistBrowser}</LangLink></li>
                <li><LangLink className='text-white' to='/wallets/trust-wallet'>{t.trustWallet}</LangLink></li>
                <li><LangLink className='text-white' to='/wallets/coinbase-wallet'>{t.coinbaseWallet}</LangLink></li>
                <li><LangLink className='text-white' to='/wallets/status'>{t.status}</LangLink></li>
              </ul>
            </div>
            <div className='col-6 col-sm-6 col-md-2 col-xl-2 item px-0'>
              <h3 className='text-white mb-4' style={{ fontWeight: 'normal', fontSize: 20 }}>{t.knowledge}</h3>
              <ul>
                <li><a className='text-white' href='/knowledge'>Crypto knowledge base</a></li>
                <li><a className='text-white' href='/knowledge/article/what-is-a-swap'>What is a swap?</a></li>
                <li><a className='text-white' href='/knowledge/article/how-to-integrate-faast-api'>How to integrate Faa.st API</a></li>
                <li><a className='text-white' href='/knowledge/article/supported-wallets'>Supported Wallets</a></li>
                <li><a className='text-white' href='/knowledge/article/what-is-the-difference-between-an-ico-ito-and-ipo'>What are ICOs, ITOs and IPOs?</a></li>
                <li><a className='text-white' href='/knowledge/article/what-is-the-bitcoin-halving'>What is the Bitcoin halving?</a></li>
              </ul>
            </div>
            <div className='col-6 col-sm-6 col-md-2 col-xl-2 item px-3'>
              <h3 className='text-white mb-4' style={{ fontWeight: 'normal', fontSize: 20 }}>{t.resources}</h3>
              <ul>
                <li><a href='https://api.faa.st/' target='_blank noopener noreferrer' style={{ color: 'rgb(255,255,255)' }}>{t.api}</a></li>
                <li><a href='/static/faast-press-kit.zip' target='_blank noopener noreferrer' style={{ color: 'rgb(255,255,255)' }}>{t.pressKit}</a></li>
              </ul>
            </div>
          </div>
          <Row className='py-4 mt-5'>
            <Col className='item social text-white text-left'>
              <ul className='mt-4'>
                <li className='d-inline-block mr-4'><a href='mailto:support@faa.st' style={{ color: 'rgb(255,255,255)' }}>support@faa.st</a></li>
                <li className='d-inline-block mr-4'><a className='text-white' href='/terms' target='_blank noopener noreferrer'>{t.terms}</a></li>
                <li className='d-inline-block'><a className='text-white' href='/privacy' target='_blank noopener noreferrer'>{t.privacy}</a></li>
              </ul>
            </Col>
            <Col className='item social text-white'>
              <a href='https://github.com/go-faast' target='_blank noopener noreferrer'><i className='icon ion-social-github'></i></a>
              <a href='https://www.facebook.com/Faast-237787136707810' target='_blank noopener noreferrer'><i className='icon ion-social-facebook'></i></a>
              <a href='https://twitter.com/gofaast' target='_blank noopener noreferrer'><i className='icon ion-social-twitter'></i></a>
              <a href='https://slack.faa.st/' target='_blank noopener noreferrer'><i className='fab fa-slack-hash'></i></a>
              <a href='https://www.reddit.com/r/gofaast/' target='_blank noopener noreferrer'><i className='icon ion-social-reddit'></i></a>
              <p className='lead text-white copyright'>© {siteConfig.year} {siteConfig.author}</p>
            </Col>
          </Row>
        </div>
      </footer>
    </div>
  </div>
))
