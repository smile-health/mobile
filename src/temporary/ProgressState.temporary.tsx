import React, { useState } from 'react'
import { View } from 'react-native'
import { Button } from '@/components/buttons'
import ProgressState from '@/components/ProgressState'
import { useLanguage } from '@/i18n/useLanguage'

export default function ProgressStateScreen() {
  const [modalVisible, setModalVisible] = useState(false)
  const [progress, setProgress] = useState(0)

  const { t } = useLanguage()

  const URL_DOWNLOAD =
    'https://www.freepik.com/free-photos-vectors/desktop-wallpaper-8k'

  const onHandleDownload = async () => {
    setModalVisible(true)
    fetch(URL_DOWNLOAD)
      .then((response) => response.blob())
      .then((blob) => {
        let loaded = 0
        const total = blob.size
        const intervalId = setInterval(() => {
          loaded += 1024 // Simulasi data yang terunduh
          const newProgress = Math.round((loaded / total) * 100)
          setProgress(newProgress)
          if (loaded >= total) {
            setModalVisible(false)
            setProgress(0)
            clearInterval(intervalId)
          }
        }, 100)
      })
  }

  return (
    <View className='flex-1 bg-white justify-center items-center'>
      <ProgressState
        modalVisible={modalVisible}
        text={t('dialog.downloading')}
        progress={progress}
        testID='progress-state'
      />
      <Button
        disabled={modalVisible}
        preset='filled'
        containerClassName='mt-6 bg-bluePrimary'
        text='Download'
        onPress={onHandleDownload}
      />
    </View>
  )
}
