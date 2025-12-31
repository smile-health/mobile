import React from 'react'
import Banner from '@/components/banner/Banner'
import ListTitle from '@/components/list/ListTitle'
import { useLanguage } from '@/i18n/useLanguage'

interface Props {
  itemCount: number
}
function TransferStockProgramHeader({ itemCount }: Readonly<Props>) {
  const { t } = useLanguage()
  return (
    <React.Fragment>
      <Banner
        title={t('transfer_stock.program_info')}
        testID='select-program-info'
        containerClassName='mb-0'
      />
      <ListTitle
        title={t('transfer_stock.destination_program_list')}
        itemCount={itemCount}
        className='px-0'
      />
    </React.Fragment>
  )
}

export default React.memo(TransferStockProgramHeader)
