import React from 'react'
import { Text } from 'react-native'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'

interface HighlightedTextProps {
  text: string
  keywords: string[]
}

export function HighlightedText({ text, keywords }: HighlightedTextProps) {
  if (!text || !keywords || keywords.length === 0) {
    return text
  }

  const regex = new RegExp(`(${keywords.join('|')})`, 'g')
  const parts = text.split(regex)
  const keywordSet = new Set(keywords)

  return (
    <Text className={cn(AppStyles.textRegular, 'text-charcoalGrey mb-6')}>
      {parts.map((part, index) =>
        keywordSet.has(part) ? (
          <Text key={index} className={AppStyles.textBold}>
            {part}
          </Text>
        ) : (
          part
        )
      )}
    </Text>
  )
}
