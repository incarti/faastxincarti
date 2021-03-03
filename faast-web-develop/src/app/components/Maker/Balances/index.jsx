import React from 'react'
import { compose, setDisplayName } from 'recompose'
import MakerLayout from 'Components/Maker/Layout'
import BalancesTable from 'Components/Maker/BalanceTable'


const MakerBalances = () => {
  return (
    <MakerLayout className='pt-4'>
      <BalancesTable />
    </MakerLayout>
  )
}

export default compose(
  setDisplayName('MakerBalances'),
)(MakerBalances)
