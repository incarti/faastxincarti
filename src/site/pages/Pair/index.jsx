import { pick } from 'lodash'
import * as React from 'react'
import { connect } from 'react-redux'
import { withRouteData } from 'react-static'
import { createStructuredSelector } from 'reselect'
import { compose, setDisplayName, lifecycle, withProps } from 'recompose'
import withTracker from 'Site/components/withTracker'

import PriceChart from 'Components/PriceChart'

import Footer from 'Site/components/Footer'
import Features from 'Site/components/Features'
import Hero from 'Site/components/Hero'

import { fetchGeoRestrictions } from 'Common/actions/app'
import { retrieveAssets } from 'Common/actions/asset'
import { getAllAssetsArray, areAssetsLoaded } from 'Common/selectors/asset'

export default compose(
  setDisplayName('Pairs'),
  withTracker,
  connect(createStructuredSelector({
    assets: getAllAssetsArray,
    areAssetsLoaded: areAssetsLoaded,
  }), {
    retrieveAssets,
    fetchGeoRestrictions
  }),
  withProps(({ assets }) => ({
    assetList: assets.filter(({ deposit, receive }) => deposit || receive)
      .map((asset) => pick(asset, 'symbol', 'name', 'iconUrl', 'cmcIDno'))
  })),
  lifecycle({
    componentWillMount() {
      const { fetchGeoRestrictions, retrieveAssets } = this.props
      fetchGeoRestrictions()
      retrieveAssets()
    }
  }),
  withRouteData,
)(({ supportedAssets, areAssetsLoaded, translations, assetList, symbol, name, cmcIDno, type, descriptions = {} }) => {
  supportedAssets = areAssetsLoaded ? assetList : supportedAssets
  const toSymbol = type === 'buy' ? symbol : symbol === 'ETH' ? 'BTC' : 'ETH'
  const fromSymbol = type === 'sell' ? symbol : symbol === 'BTC' ? 'ETH' : 'BTC'
  return (
    <div>
      <Hero 
        to={toSymbol} 
        from={fromSymbol} 
        supportedAssets={supportedAssets}
        translations={translations}
        headline={(
          <h1 className='hero-title mb-4' style={{ fontWeight: 'normal' }}>
            <span className='special-word'>Instantly</span> {type} {name} ({symbol}) from your Ledger, Trezor, or MetaMask.
          </h1>
        )} 
        showMacScreenShot={false}
      />
      <div style={{ backgroundColor: '#fff' }}>
        <div 
          className='features-clean pb-0 text-center cursor-pointer'
        > 
          <h2 className='text-center' style={{ marginBottom: '15px', fontWeight: 'normal' }}>
            {name} ({symbol}) Information
          </h2>
          <div className='mx-auto' style={{ minHeight: 300, maxWidth: 960 }}>
            <p>{descriptions[symbol] ? descriptions[symbol].overview : null}</p>
            <PriceChart cmcIDno={cmcIDno} chartOpen/> 
          </div>
        </div>
      </div>
      <Features translations={translations} supportedAssets={supportedAssets} />
      <Footer translations={translations} />
    </div>
  )
})
