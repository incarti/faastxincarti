import React, { Fragment } from 'react'
import { push } from 'react-router-redux'
import { createStructuredSelector } from 'reselect'
import { Card, CardHeader, CardBody } from 'reactstrap'
import { connect } from 'react-redux'
import { compose, setDisplayName, lifecycle, withState } from 'recompose'
import classNames from 'class-names'
import LoginForm from './form'

import { withAuth } from 'Components/Auth'
import MakerLayout from 'Components/Maker/Layout'
import { isMakerLoggedIn, makerId } from 'Selectors/maker'
import LoadingFullscreen from 'Components/LoadingFullscreen'

import { card, cardHeader, smallCard } from '../style'

const MakerLogin = ({ isLoading }) => {
  return isLoading ? (
    <LoadingFullscreen bgColor='#fff' />
  ) : (
    <Fragment>
      <MakerLayout className='pt-5'>
        <Card className={classNames(card, smallCard, 'mx-auto')}>
          <CardHeader className={classNames(cardHeader, 'text-center')}>
            <span>Maker Login</span>
          </CardHeader>
          <CardBody className={card}>
            <LoginForm/>
          </CardBody>
        </Card>
      </MakerLayout>
    </Fragment>
  )
}

export default compose(
  setDisplayName('MakerLogin'),
  withAuth(),
  connect(createStructuredSelector({
    loggedIn: isMakerLoggedIn,
    makerId
  }), {
    push: push,
  }),
  withState('isLoading', 'updateIsLoading', true),
  lifecycle({
    componentDidMount() {
      const { auth, updateIsLoading, makerId, push } = this.props
      if (auth.isAuthenticated() && makerId) {
        push('/makers/login/loading')
      } else {
        auth.login()
        setTimeout(() => {
          updateIsLoading(false)
        }, 3000)
      }
    }
  })
)(MakerLogin)
