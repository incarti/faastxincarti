import React from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes, lifecycle, withHandlers, withProps } from 'recompose'
import { Modal, ModalHeader, ModalBody, Card, CardBody, Input, Button, Row, Col } from 'reactstrap'
import { pick } from 'lodash'

import routes from 'Routes'
import { routerPathToUri } from 'Utilities/helpers'
import toastr from 'Utilities/toastrWrapper'
import WalletSummary from 'Components/WalletSummary'
import T from 'Components/i18n/T'

const closeCondition = ({ wallet }) => !wallet.address

export default compose(
  setDisplayName('ShareModal'),
  setPropTypes({
    wallet: PropTypes.object.isRequired,
    ...Modal.propTypes
  }),
  withHandlers(() => {
    let inputRef
    return {
      handleRef: () => (ref) => {
        inputRef = ref
      },
      handleFocus: () => (event) => {
        event.target.select()
      },
      handleCopy: () => () => {
        inputRef.select()
        document.execCommand('copy')
        toastr.info('Link copied to clipboard')
      },
    }
  }),
  lifecycle({
    componentWillMount() {
      if (this.props.isOpen && closeCondition(this.props)) {
        this.props.toggle()
      }
    },
    componentWillReceiveProps(next) {
      if (next.isOpen && closeCondition(next)) {
        next.toggle()
      }
    }
  }),
  withProps(({ wallet }) => {
    const walletUri = routerPathToUri(routes.viewOnlyAddress(wallet.address))
    return {
      walletUri,
      showDirectLink: walletUri !== window.location.href,
    }
  }),
)(({ wallet, walletUri, showDirectLink, toggle, handleRef, handleFocus, handleCopy, ...props }) => (
  <Modal size='sm' toggle={toggle} {...pick(props, Object.keys(Modal.propTypes))}>
    <ModalHeader tag='h3' className='text-primary' toggle={toggle}>
      <T tag='span' i18nKey='app.shareModal.share'>Share Portfolio</T>
    </ModalHeader>
    <ModalBody>
      <Card tag={CardBody} color='ultra-dark' className='flat mb-3'>
        <WalletSummary wallet={wallet} showLink={showDirectLink}/>
      </Card>
      <T tag='p' i18nKey='app.shareModal.permalink' className='mb-2'>Permalink:</T>
      <Row className='gutter-2'>
        <Col>
          <Input type='text' autoFocus readOnly onFocus={handleFocus} innerRef={handleRef}
            value={walletUri}/>
        </Col>
        <Col xs='auto'>
          <Button color='link' className='p-2' onClick={handleCopy}>
            <i className='fa fa-copy'/>
          </Button>
        </Col>
      </Row>
    </ModalBody>
  </Modal>
))
      