import React from 'react'
import { I18nManager } from 'react-native'
import type { SvgProps } from 'react-native-svg'

// Directional icons (back, chevron, arrow) must point the other way in RTL.
export const flipInRtl = (Icon: React.FC<SvgProps>) => {
  const Flipped = (props: SvgProps) =>
    I18nManager.isRTL ? (
      <Icon {...props} style={[{ transform: [{ scaleX: -1 }] }, props.style]} />
    ) : (
      <Icon {...props} />
    )
  Flipped.displayName = `FlipInRtl(${Icon.displayName ?? Icon.name ?? 'Icon'})`
  return Flipped
}
