import React, { ComponentType } from 'react'
import { Linking, Pressable } from 'react-native'
import { SvgProps } from 'react-native-svg'
import { Icons } from '@/assets/icons'
import { FieldValue } from '@/components/list/FieldValue'
import { getTestID, showError } from '@/utils/CommonUtils'

interface Props {
  type: string
  label: string
  content: string
  url: string
  Icon: ComponentType<SvgProps>
  error?: string
}

function ContactItem(props: Readonly<Props>) {
  const { type, label, content, url, Icon, error } = props

  const handleOpenUrl = () => {
    Linking.openURL(url).catch(() => {
      if (error) showError(error)
    })
  }
  return (
    <Pressable
      className='flex-row items-center gap-x-2 p-2 border-b border-quillGrey'
      onPress={handleOpenUrl}
      {...getTestID(`contact-item-${type}`)}>
      <Icon />
      <FieldValue
        label={label}
        value={content}
        containerClassName='flex-1'
        labelClassName='text-[10px] text-mediumGray'
      />
      <Icons.IcChevronRight />
    </Pressable>
  )
}

export default React.memo(ContactItem)
