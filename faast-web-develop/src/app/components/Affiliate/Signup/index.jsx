import React, { Fragment } from 'react'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'
import { Card, CardHeader, CardBody } from 'reactstrap'
import { compose, setDisplayName } from 'recompose'
import classNames from 'class-names'
import LoginForm from './form'

import AffiliateLayout from 'Components/Affiliate/Layout'

import { card, cardHeader, smallCard } from '../style'

const AffiliateSignup = () => {
  return (
    <Fragment>
      <Helmet>
        <title>JUNK</title>
        <meta name='description' content='Earn Bitcoin on each cryptocurrency trade that is made using your affiliate id. Integrate the Faa.st API into your application and easily allow your users to trade their crypto.' /> 
      </Helmet>
      <AffiliateLayout className='pt-5'>
        <Card className={classNames(card, smallCard, 'mx-auto')}>
          <CardHeader className={classNames(cardHeader, 'text-center')}>
            <span>Affiliate API Signup</span>
          </CardHeader>
          <CardBody className={card}>
            <LoginForm/>
          </CardBody>
        </Card>
        <small className='text-center'>
          <Link to='/affiliates/login' style={{ color: '#8aa2b5' }} className='pt-3 d-block font-weight-bold'>
          Already registered with the Faa.st Affiliate API? Login here.
          </Link>
        </small>
      </AffiliateLayout>
    </Fragment>
  )
}

export default compose(
  setDisplayName('AffiliateSignup'),
)(AffiliateSignup)
