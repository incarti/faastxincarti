import React from 'react'
import { createStructuredSelector } from 'reselect'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { ListGroup, ListGroupItem, Row, Col, Button, Card } from 'reactstrap'
import classNames from 'class-names'
import { setCurrentPortfolioAndWallet } from 'Actions/portfolio'
import { getCurrentPortfolioWalletIds, getCurrentWalletId, getCurrentPortfolioId } from 'Selectors'
import WalletSummary from 'Components/WalletSummary'
import ListGroupButton from 'Components/ListGroupButton'
import T from 'Components/i18n/T'

const WalletListButton = ({ id, active, nested, onClick, className, ...props }) => (
  <ListGroupButton active={active} onClick={onClick} className={classNames({ 'compact': nested }, className)} {...props}>
    <WalletSummary.Connected id={id} hideIcon={!nested} />
  </ListGroupButton>
)

const WalletSelector = ({
  portfolioId, portfolioWalletIds, currentWalletId, setCurrentPortfolioAndWallet, className
}) => (
  <Row className={classNames('gutter-3 align-items-end', className)}>
    <Col>
      <T tag='h4' i18nKey='app.walletSelector.wallets' className='m-0 text-primary'>Wallets</T>
    </Col>
    <Col xs='auto'>
      <Button tag={Link} color='success' outline size='sm' to='/connect'><i className='fa fa-plus'/> <T tag='span' i18nKey='app.walletSelector.addWallet'>add wallet</T></Button>
    </Col>
    <Col xs='12'>
      <Card>
        <ListGroup>
          <WalletListButton id={portfolioId}
            active={currentWalletId === portfolioId}
            onClick={() => setCurrentPortfolioAndWallet(portfolioId, portfolioId)}/>
          <ListGroupItem className='p-1'/>
          {portfolioWalletIds.length > 0
            ? portfolioWalletIds.map((walletId) => (
              <WalletListButton key={walletId} id={walletId} nested
                active={currentWalletId === walletId}
                onClick={() => setCurrentPortfolioAndWallet(portfolioId, walletId)}/>
            ))
            : (<ListGroupItem><T tag='i' i18nKey='app.walletSelector.noWallets' className='text-muted'>No wallets in this portfolio</T></ListGroupItem>)}
        </ListGroup>
      </Card>
    </Col>
  </Row>
)

const mapStateToProps = createStructuredSelector({
  currentWalletId: getCurrentWalletId,
  portfolioId: getCurrentPortfolioId,
  portfolioWalletIds: getCurrentPortfolioWalletIds,
})

const mapDispatchToProps = {
  setCurrentPortfolioAndWallet,
}

export default connect(mapStateToProps, mapDispatchToProps)(WalletSelector)
