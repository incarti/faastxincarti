
import React, { Fragment } from 'react'
import { createStructuredSelector } from 'reselect'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'
import {
  ListGroup, ListGroupItem, Card, Badge, Media,
  Dropdown, DropdownToggle, DropdownMenu, DropdownItem,
} from 'reactstrap'
import { compose, setDisplayName, withState, withProps } from 'recompose'
import {
  getWatchlist, getTrendingPositive, getTrendingNegative, getWalletIdsOfDefaultNestedWallets,
  getCurrentPortfolioId, getCurrentWalletWithHoldings, getTradeableAssetFilter,
} from 'Selectors'
import { setCurrentPortfolioAndWallet } from 'Actions/portfolio'

import ChangePercent from 'Components/ChangePercent'
import ChangeFiat from 'Components/ChangeFiat'
import WatchlistStar from 'Components/WatchlistStar'
import CoinIcon from 'Components/CoinIcon'
import Icon from 'Components/Icon'
import WalletLabel from 'Components/WalletLabel'
import Units from 'Components/Units'
import T from 'Components/i18n/T'

import chart from 'Img/chart.svg?inline'
import withToggle from 'Hoc/withToggle'

import { sidebarLabel } from './style'

const Sidebar = ({
  watchlist, trendingPositive, currentPortfolioId, portfolioWalletIds,
  trendingNegative, isTrendingDropDownOpen, toggleTrendingDropDownOpen, toggleDropdownOpen, isDropdownOpen, currentWallet,
  timeFrame, updateTimeFrame, trendingTimeFrame, updateTrendingTimeFrame, className, push, setCurrentPortfolioAndWallet
}) => {
  const { id: currentWalletId, totalFiat, totalChange, totalFiat24hAgo, 
    totalFiat7dAgo, totalFiat1hAgo, totalChange1h, totalChange7d, label, typeLabel } = currentWallet

  const portfolioPercentChange = timeFrame === '1d' ? totalChange : timeFrame === '7d' ? totalChange7d : totalChange1h
  const portfolioBasedOnTimeFrame = timeFrame === '1d' ? totalFiat24hAgo : timeFrame === '7d' ? totalFiat7dAgo : totalFiat1hAgo

  return (
    <Card className={className}>
      <ListGroup>
        <ListGroupItem className='text-center position-relative'>
          <Icon 
            style={{ top: '2px', left: 0, width: '100%', zIndex: 0 }} 
            className='position-absolute d-none d-md-block' 
            src={chart} 
          />
          <Dropdown group isOpen={isDropdownOpen} size="sm" toggle={toggleDropdownOpen}>
            <DropdownToggle className='m-0 cursor-pointer' tag='p' caret>
              <small><Badge 
                className='mr-2 cursor-pointer font-size-xxs' 
                color='light'
              >
                {portfolioWalletIds.length}
              </Badge>{currentWalletId === 'default' ? label : typeLabel}</small>
            </DropdownToggle>
            <DropdownMenu>
              <DropdownItem
                onClick={() => setCurrentPortfolioAndWallet(currentPortfolioId, currentPortfolioId)}
                active={currentWalletId === currentPortfolioId}
              >
                <WalletLabel.Connected id={currentPortfolioId} showBalance hideIcon/>
              </DropdownItem>
              <DropdownItem divider/>
              {portfolioWalletIds.map((walletId) => (
                <DropdownItem 
                  key={walletId} 
                  onClick={() => setCurrentPortfolioAndWallet(currentPortfolioId, walletId)}
                  active={walletId === currentWalletId}
                >
                  <WalletLabel.Connected id={walletId} showBalance grouped />
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
          <div style={{ zIndex: 99 }} className='position-relative'>
            <h2 className='m-0 mt-2 font-weight-bold'>
              <Units value={totalFiat} precision={6} currency symbolSpaced={false} prefixSymbol />
            </h2>
            <ChangeFiat>{totalFiat.minus(portfolioBasedOnTimeFrame)}</ChangeFiat>
            <small> <ChangePercent parentheses>{portfolioPercentChange}</ChangePercent></small>
            <div>
              <Badge 
                className='mr-2 cursor-pointer' 
                color={timeFrame == '7d' ? 'light' : 'ultra-dark'}
                onClick={() => updateTimeFrame('7d')}
              >
                7d
              </Badge>
              <Badge 
                className='mr-2 cursor-pointer' 
                color={timeFrame == '1d' ? 'light' : 'ultra-dark'}
                onClick={() => updateTimeFrame('1d')}
              >
                1d
              </Badge>
              <Badge 
                className='cursor-pointer' 
                color={timeFrame == '1h' ? 'light' : 'ultra-dark'}
                onClick={() => updateTimeFrame('1h')}
              >
                1h
              </Badge>
            </div>
          </div>
        </ListGroupItem>
        <ListGroupItem className='p-0 text-center d-none d-md-block'>
          <T tag='small' i18nKey='app.sidebar.watchlist'><p className={sidebarLabel}>Watchlist</p></T>
          <OverlayScrollbarsComponent
            options={{ scrollbars: { autoHide: 'scroll' } }}
            className='os-host-flexbox'
            style={{ maxHeight: '171px' }}>
            {watchlist.map((asset) => {
              const { symbol, price, change24, change7d, change1, price24hAgo, price7dAgo, price1hAgo } = asset
              const percentChange = timeFrame === '1d' ? change24 : timeFrame === '7d' ? change7d : change1
              const priceChangeBasedOnTime = timeFrame === '1d' ? price24hAgo : timeFrame === '7d' ? price7dAgo : price1hAgo
              return (
                <Fragment key={symbol}>
                  <Media style={{ borderBottom: '1px solid #292929' }} className='text-left px-3 py-0 cursor-pointer'>
                    <Media left>
                      <WatchlistStar className='pt-2 mt-1' symbol={symbol}/>
                    </Media>
                    <Media style={{ flex: '0 0 100%' }} onClick={() => push(`/assets/${symbol}`)}>
                      <Media style={{ width: '35px' }} className='ml-4 mr-3' left>
                        <CoinIcon 
                          symbol={symbol} 
                          inline
                          size='sm'
                        /> 
                        <Media className='m-0'>
                          <span className='font-xxs'>{symbol}</span>
                        </Media>
                      </Media>
                      <Media body>
                        <Media className='m-0' heading>
                          <Units className='font-xxs' value={price} symbolSpaced={false} expand={false} prefixSymbol currency></Units>
                        </Media>
                        <Media style={{ top: '-2px' }} className='position-relative'>
                          <span className='font-xs mr-1'><ChangeFiat>{price.minus(priceChangeBasedOnTime)}</ChangeFiat></span>
                          <span className='font-xs'><ChangePercent parentheses>{percentChange}</ChangePercent></span>
                        </Media>
                      </Media>
                    </Media>
                  </Media>
                </Fragment>
              )
            })}
          </OverlayScrollbarsComponent>
        </ListGroupItem>
        <ListGroupItem className='border-bottom-0 p-0 text-center d-none d-md-block'>
          <small>
            <div className={sidebarLabel}><T tag='span' i18nKey='app.sidebar.trending'>Trending</T>
              <Dropdown group isOpen={isTrendingDropDownOpen} size="sm" toggle={toggleTrendingDropDownOpen}>
                <DropdownToggle 
                  tag='span' 
                  style={{ lineHeight: '15px' }}
                  className='cursor-pointer rounded border py-0 ml-1 px-1 flat' 
                  size='sm' 
                  color='ultra-dark' 
                  caret
                >
                  <small>{trendingTimeFrame}</small>
                </DropdownToggle>
                <DropdownMenu className='p-0'>
                  <DropdownItem 
                    active={trendingTimeFrame === '7d'}
                    onClick={() => updateTrendingTimeFrame('7d')}
                  >
                    7d
                  </DropdownItem>
                  <DropdownItem className='m-0' divider/>
                  <DropdownItem 
                    active={trendingTimeFrame === '1d'}
                    onClick={() => updateTrendingTimeFrame('1d')}
                  >
                    1d
                  </DropdownItem>
                  <DropdownItem className='m-0' divider/>
                  <DropdownItem 
                    active={trendingTimeFrame === '1h'}
                    onClick={() => updateTrendingTimeFrame('1h')}
                  >
                    1h
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          </small>
          
          <OverlayScrollbarsComponent
            options={{ scrollbars: { autoHide: 'scroll' } }} 
            style={{ maxHeight: '214px', overflowY: 'auto' }}
            className='os-host-flexbox'
          >
            {trendingPositive.map((asset, i) => {
              const { symbol, price, change24, change7d, change1, price24hAgo, price7dAgo, price1hAgo } = asset
              const percentChange = trendingTimeFrame === '1d' ? change24 : trendingTimeFrame === '7d' ? change7d : change1
              const priceChangeBasedOnTime = trendingTimeFrame === '1d' ? price24hAgo : trendingTimeFrame === '7d' ? price7dAgo : price1hAgo
              return (
                <Fragment key={symbol}>
                  <Media 
                    onClick={() => push(`/assets/${symbol}`)}
                    style={i !== trendingPositive.length - 1 ? { borderBottom: '1px solid #292929' } : {}} 
                    className='text-left px-3 py-0 cursor-pointer'
                  >
                    <Media left>
                      <small className='pt-2 mt-1 d-inline-block'>{i + 1}</small>
                    </Media>
                    <Media style={{ width: '35px' }} className='ml-4 mr-3' left>
                      <CoinIcon 
                        symbol={symbol} 
                        inline
                        size='sm'
                      /> 
                      <Media className='m-0'>
                        <span className='font-xxs'>{symbol}</span>
                      </Media>
                    </Media>
                    <Media body>
                      <Media style={{ top: '1px' }} className='m-0 position-relative' heading>
                        <small>
                          <Units className='font-xs' value={price} expand={false} symbolSpaced={false} prefixSymbol currency></Units>
                        </small>
                      </Media>
                      <Media style={{ top: '-2px' }} className='position-relative'>
                        <span className='font-xs mr-1'><ChangeFiat>{price.minus(priceChangeBasedOnTime)}</ChangeFiat></span>
                        <span className='font-xs'><ChangePercent parentheses>{percentChange}</ChangePercent></span>
                      </Media>
                    </Media>
                  </Media>
                </Fragment>
              )
            })}
            <div style={{ borderTop: '1px dashed #292929' }} className='p-0 text-center'>
              {trendingNegative.map((asset, i) => {
                const { symbol, price, change24, change7d, change1, price24hAgo, price7dAgo, price1hAgo } = asset
                const percentChange = trendingTimeFrame === '1d' ? change24 : trendingTimeFrame === '7d' ? change7d : change1
                const priceChangeBasedOnTime = trendingTimeFrame === '1d' ? price24hAgo : trendingTimeFrame === '7d' ? price7dAgo : price1hAgo
                return (
                  <Fragment key={symbol}>
                    <Media 
                      onClick={() => push(`/assets/${symbol}`)}
                      style={{ borderBottom: '1px solid #292929' }} 
                      className='text-left px-3 py-0 cursor-pointer'
                    >
                      <Media left>
                        <small className='pt-2 mt-1 d-inline-block'>{i + 1}</small>
                      </Media>
                      <Media style={{ width: '35px' }} className='ml-4 mr-3' left>
                        <CoinIcon 
                          symbol={symbol} 
                          inline
                          size='sm'
                        /> 
                        <Media className='m-0'>
                          <span className='font-xxs'>{symbol}</span>
                        </Media>
                      </Media>
                      <Media body>
                        <Media style={{ top: '1px' }} className='m-0 position-relative' heading>
                          <small>
                            <Units className='font-xs' value={price} expand={false} symbolSpaced={false} prefixSymbol currency></Units>
                          </small>
                        </Media>
                        <Media style={{ top: '-2px' }} className='position-relative'>
                          <span className='font-xs mr-1'><ChangeFiat>{price.minus(priceChangeBasedOnTime)}</ChangeFiat></span>
                          <span className='font-xs'><ChangePercent parentheses>{percentChange}</ChangePercent></span>
                        </Media>
                      </Media>
                    </Media>
                  </Fragment>
                )
              })}
            </div>
          </OverlayScrollbarsComponent>
        </ListGroupItem>
      </ListGroup>
    </Card>
  )
}

export default compose(
  setDisplayName('Sidebar'),
  withToggle('dropdownOpen'),
  withToggle('trendingDropDownOpen'),
  connect(createStructuredSelector({
    currentWallet: getCurrentWalletWithHoldings,
    filterTradeable: getTradeableAssetFilter
  }), {
  }),
  withState('timeFrame', 'updateTimeFrame', '1d'),
  withState('trendingTimeFrame', 'updateTrendingTimeFrame', '1d'),
  withProps(({ trendingTimeFrame }) => {
    const sortField = trendingTimeFrame === '7d' ? 'change7d' : trendingTimeFrame === '1d' ? 'change24' : 'change1'
    return ({
      sortField 
    })
  }),
  connect(createStructuredSelector({
    trendingPositive: (state, { sortField, filterTradeable }) => getTrendingPositive(state, { sortField, filterTradeable }),
    trendingNegative: (state, { sortField, filterTradeable }) => getTrendingNegative(state, { sortField, filterTradeable }),
    watchlist: getWatchlist,
    currentPortfolioId: getCurrentPortfolioId,
    currentWallet: getCurrentWalletWithHoldings,
    portfolioWalletIds: getWalletIdsOfDefaultNestedWallets,
  }), {
    setCurrentPortfolioAndWallet: setCurrentPortfolioAndWallet,
    push: push,
  }),
)(Sidebar)
