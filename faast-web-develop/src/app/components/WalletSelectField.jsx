import React, { Fragment } from 'react'
import routes from 'Routes'
import {
  compose, setDisplayName, setPropTypes, defaultProps, withHandlers, withState, lifecycle, withProps,
} from 'recompose'
import { connect } from 'react-redux'
import { formValueSelector } from 'redux-form'
import {
  ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem,
} from 'reactstrap'
import { createStructuredSelector } from 'reselect'
import PropTypes from 'prop-types'
import { push as pushAction } from 'react-router-redux'
import classNames from 'class-names'

import { sortByProperty } from 'Utilities/helpers'
import { getWalletForAsset } from 'Utilities/wallet'
import propTypes from 'Utilities/propTypes'
import { areCurrentPortfolioBalancesLoaded } from 'Selectors/portfolio'
import { getCurrentChildWalletsForSymbol } from 'Selectors/wallet'

import withToggle from 'Hoc/withToggle'
import ReduxFormField from 'Components/ReduxFormField'
import WalletLabel from 'Components/WalletLabel'

const WalletSelectField = ({
  tag: Tag, symbol, handleSelect, dropDownStyle, disableNoBalance, walletHasBalance, showBalances,
  toggleDropdownOpen, isDropdownOpen, connectedWallets, handleConnect,
  selectedWallet, handleSelectManual, addressFieldName, walletIdFieldName,
  onChange, ...props,
}) => {
  const renderInput = ({ className }) => (
    <WalletLabel
      wallet={selectedWallet}
      className={classNames('form-control', className, 'lh-0')} verticalAlign='middle'
      iconProps={{ width: '1.5em', height: '1.5em' }}/>
  )
  const dropDownText = !selectedWallet ? 'External' : 'Wallet'
  return (
    <Fragment>
      <Tag {...props}
        name={addressFieldName}
        autoCorrect='false'
        autoCapitalize='false'
        spellCheck='false'
        onChange={onChange}
        renderInput={selectedWallet && renderInput}
        addonAppend={({ invalid }) => (
          <ButtonDropdown addonType='append' isOpen={isDropdownOpen} toggle={toggleDropdownOpen}>
            <DropdownToggle size='sm' color={invalid ? 'danger' : 'dark'} style={dropDownStyle} caret>
              {dropDownText}
            </DropdownToggle>
            <DropdownMenu right>
              {connectedWallets.map((wallet) => (
                <DropdownItem key={wallet.id}
                  onClick={() => handleSelect(wallet)}
                  active={selectedWallet && selectedWallet.id === wallet.id}
                  disabled={disableNoBalance && !walletHasBalance(wallet)}>
                  <WalletLabel wallet={wallet} showBalance={showBalances && symbol}/>
                </DropdownItem>
              ))}
              <DropdownItem onClick={handleSelectManual} active={!selectedWallet}>
                External {symbol} wallet
              </DropdownItem>
              <DropdownItem divider/>
              <DropdownItem className='text-primary' onClick={handleConnect}>
                <i className='nav-link-icon fa fa-plus'></i> Connect Your Wallet
              </DropdownItem>
            </DropdownMenu>
          </ButtonDropdown>
        )}/>
      <ReduxFormField name={walletIdFieldName} type='hidden'/>
    </Fragment>
  )
}

export default compose(
  setDisplayName('WalletSelectField'),
  setPropTypes({
    addressFieldName: PropTypes.string.isRequired,
    walletIdFieldName: PropTypes.string.isRequired,
    change: PropTypes.func.isRequired, // change prop passed into decorated redux-form component
    untouch: PropTypes.func.isRequired, // untouch prop passed into decorated redux-form component
    dropDownStyle: PropTypes.object,
    handleSelect: PropTypes.func,
    symbol: PropTypes.string,
    tag: propTypes.tag,
    disableNoBalance: PropTypes.bool,
    showBalances: PropTypes.bool,
    defaultValue: PropTypes.string,
    formName: PropTypes.string,
    onChange: PropTypes.func,
  }),
  defaultProps({
    dropDownStyle: {},
    symbol: '',
    tag: ReduxFormField,
    disableNoBalance: false,
    showBalances: true,
  }),
  withProps(({
    formName
  }) => { 
    return ({
      getFormValue: formValueSelector(formName)
    })}),
  connect(createStructuredSelector({
    connectedWallets: (state, { symbol }) => getCurrentChildWalletsForSymbol(state, symbol),
    balancesLoaded: areCurrentPortfolioBalancesLoaded,
    address: (state, { addressFieldName, getFormValue }) => getFormValue(state, addressFieldName),
    walletId: (state, { walletIdFieldName, getFormValue }) => getFormValue(state, walletIdFieldName),
  }), {
    push: pushAction
  }),
  withState('selectedWallet', 'setSelectedWallet', null),
  withToggle('dropdownOpen'),
  withHandlers({
    handleConnect: ({ push }) => () => {
      push({
        pathname: '/connect',
        state: { forwardurl: typeof window !== 'undefined' ? window.location.href : routes.swapWidget() }
      })
    },
    handleSelect: ({ setSelectedWallet, change, untouch, addressFieldName, walletIdFieldName, symbol }) => (wallet) => {
      if (!wallet) {
        setSelectedWallet(null)
        change(walletIdFieldName, 'null')
        change(addressFieldName, '')
        untouch(addressFieldName)
        return
      }
      setSelectedWallet(wallet)
      change(walletIdFieldName, wallet.id)
      const walletInstance = getWalletForAsset(wallet.id, symbol)
      return walletInstance.getFreshAddress(symbol)
        .then((address) => change(addressFieldName, address))
    },
    walletHasBalance: ({ symbol }) => ({ balances }) => Boolean(balances[symbol] && balances[symbol].gt(0))
  }),
  withProps(({ connectedWallets, disableNoBalance, walletHasBalance }) => ({
    selectableWallets: disableNoBalance ? connectedWallets.filter(walletHasBalance) : connectedWallets
  })),
  withHandlers({
    handleSelectManual: ({ handleSelect }) => () => handleSelect(null),
    selectDefault: ({ selectableWallets, handleSelect }) => () => {
      const ordered = sortByProperty(selectableWallets, 'isReadOnly')
      handleSelect(ordered[0] || null)
    },
  }),
  lifecycle({
    componentWillMount() {
      const { defaultValue, selectDefault, handleSelect, selectableWallets, change, addressFieldName, } = this.props
      if (!defaultValue) {
        selectDefault()
      } else {
        let wallet = selectableWallets.find(wallet => wallet.id.toLowerCase() === defaultValue.toLowerCase())
        if (wallet) {
          handleSelect(wallet)
        } else {
          change(addressFieldName, defaultValue)
        }
      }
    },
    componentDidUpdate(prevProps) {
      const {
        symbol, selectedWallet, selectableWallets, selectDefault, handleSelect, balancesLoaded, defaultValue
      } = this.props
      const symbolChange = prevProps.symbol !== symbol
      if (symbolChange && defaultValue) {
        const wallet = selectableWallets.find(wallet => wallet.id.toLowerCase() === defaultValue.toLowerCase())
        if (wallet) {
          handleSelect(wallet)
        }
      }
      if (selectedWallet && symbolChange) {
        if (!selectableWallets.includes(selectedWallet)) {
          selectDefault()
        } else {
          // reselect current to get new address for symbol
          handleSelect(selectedWallet)
        }
      } else if (!selectedWallet && !defaultValue && !prevProps.balancesLoaded && balancesLoaded) {
        selectDefault()
      }
    }
  })
)(WalletSelectField)
  
