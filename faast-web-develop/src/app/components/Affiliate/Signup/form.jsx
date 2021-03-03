import React from 'react'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { compose, setDisplayName, withHandlers } from 'recompose'
import { Form, Button } from 'reactstrap'
import { reduxForm } from 'redux-form'
import ReduxFormField from 'Components/ReduxFormField'
import classNames from 'class-names'

import { input, text } from '../style'

import { register } from 'Actions/affiliate'
import { areSwapsLoading } from 'Selectors'

const AffiliateSignupForm = ({ handleSubmit, areSwapsLoading }) => {
  return (
    <Form onSubmit={handleSubmit}>
      <ReduxFormField
        name='affiliateId'
        type='text'
        placeholder='ex: FaastApp123456'
        inputClass={classNames('flat', input)}
        label={<small><p className={classNames('mt-0 mb-0 font-weight-bold', text)}>Choose an Affiliate ID</p></small>}
      />
      <ReduxFormField
        name='address'
        type='text'
        placeholder='BTC Wallet to Receive Payments'
        inputClass={classNames('flat', input)}
        label={<small><p className={classNames('mt-0 mb-0 font-weight-bold', text)}>BTC Wallet to Receive Payments</p></small>}
      />
      <ReduxFormField
        name='email'
        type='text'
        placeholder='example@gmail.com'
        inputClass={classNames('flat', input)}
        label={<small><p className={classNames('mt-0 mb-0 font-weight-bold', text)}>Contact Email Address</p></small>}
      />
      <small>
        <a href='/partners' target='_blank noreferrer' style={{ color: '#8aa2b5' }} className='pb-3 d-block'>
          Want to learn more about the Affiliate Program? Click here.
        </a>
      </small>
      <Button className='w-100 flat' color='primary' type='submit' disabled={areSwapsLoading}>Signup</Button>
    </Form>
  )
}

export default compose(
  setDisplayName('AffiliateSignupForm'),
  connect(createStructuredSelector({
    areSwapsLoading: areSwapsLoading,
  }), {
    register
  }),
  withHandlers({
    onSubmit: ({ register }) => ({ affiliateId, address, email }) => {
      register(affiliateId, address, email)
    }
  }),
  reduxForm({
    form: 'affiliate_signup',
    enableReinitialize: true,
    keepDirtyOnReinitialize: true,
    updateUnregisteredFields: true,
  }),
)(AffiliateSignupForm)
