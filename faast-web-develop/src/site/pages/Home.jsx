import { pick } from 'lodash'
import * as React from 'react'
import { connect } from 'react-redux'
import { withRouteData } from 'react-static'
import { createStructuredSelector } from 'reselect'
import { compose, setDisplayName, lifecycle, withProps } from 'recompose'
import withTracker from 'Site/components/withTracker'

// import logoImg from 'Img/faast-logo.png'

import Features from 'Site/components/Features'
import Footer from 'Site/components/Footer'
import Hero from 'Site/components/Hero'

import { fetchGeoRestrictions } from 'Common/actions/app'
import { retrieveAssets } from 'Common/actions/asset'
import { getAllAssetsArray, areAssetsLoaded } from 'Common/selectors/asset'



export default compose(
  setDisplayName('Home'),
  withTracker,
  connect(createStructuredSelector({
    assets: getAllAssetsArray,
    areAssetsLoaded: areAssetsLoaded
  }), {
    retrieveAssets,
    fetchGeoRestrictions
  }),
  withProps(({ assets }) => ({
    assetList: assets.filter(({ deposit, receive }) => deposit || receive)
      .map((asset) => pick(asset, 'symbol', 'name', 'iconUrl', 'marketCap'))
  })),
  lifecycle({
    componentWillMount() {
      const { fetchGeoRestrictions, retrieveAssets } = this.props
      fetchGeoRestrictions()
      retrieveAssets()
    }
  }),
  withRouteData,
)(({ supportedAssets, areAssetsLoaded, assetList, translations = {} }) => {
  supportedAssets = areAssetsLoaded ? assetList : supportedAssets
  return (
    <div>
      <Hero supportedAssets={supportedAssets} translations={translations} className='mb-md-5 mb-0'/>
      <Features translations={translations} supportedAssets={supportedAssets} />
      <Footer translations={translations} />
    </div>
  )
})
