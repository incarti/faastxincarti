import React from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes, defaultProps, getContext, mapProps } from 'recompose'
import { Trans } from 'react-i18next'

export default compose(
  setDisplayName('T'),
  setPropTypes({
    block: PropTypes.bool,
    tag: PropTypes.string || PropTypes.func,
    ...Trans.propTypes,
    i18nKey: PropTypes.string.isRequired,
    translate: PropTypes.bool,
  }),
  defaultProps({
    block: false,
    tag: 'span',
    translate: true,
  }),
  mapProps(({ block, parent, tag, ...rest }) => ({
    parent: block ? 'div' : (parent || tag),
    ...rest,
  })),
  getContext(Trans.contextTypes)
)((props) => {
  const { i18nKey, children, translate, } = props
  if (!translate) {
    return children
  }
  if (!(/^[\w.:]+$/).test(i18nKey)) {
    console.error(`Invalid i18nKey '${i18nKey}' provided to T for: ${children}`)
    return null
  }
  return (<Trans {...props}/>)
})
