import React, { useCallback, useMemo } from 'react'
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { Icons } from '@/assets/icons'
import { Button } from '@/components/buttons'
import { useToolbar } from '@/components/toolbar/hooks/useToolbar'
import { useLanguage } from '@/i18n/useLanguage'
import { AppStackScreenProps } from '@/navigators'
import AppStyles from '@/theme/AppStyles'
import colors from '@/theme/colors'
import { cn } from '@/theme/theme-config'
import { getStatusBadgeStyle, getStatusTextStyle } from '@/utils/CommonUtils'
import { SHORT_DATE_TIME_FORMAT } from '@/utils/Constants'
import { convertString } from '@/utils/DateFormatUtils'
import { InfoAssetRow } from './component/InfoAssetRow'
import { useAssetInventoryDetail } from './hooks/useAssetInventoryDetail'

interface Props extends AppStackScreenProps<'AssetInventoryDetail'> {}

export default function AssetInventoryDetailScreen({
  navigation,
  route,
}: Props) {
  const { id } = route.params

  const { t } = useLanguage()

  const {
    assetDetail,
    refetchDetail,
    isLoadingDetail,
    isError,
    formatDate,
    formatContactPerson,
  } = useAssetInventoryDetail({ id })

  const assetNames = useMemo(() => {
    const getValue = (primary?: string, fallback?: string) =>
      primary ?? fallback
    const getSublabel = (condition?: string, key?: any) =>
      condition && key ? t(key) : ''

    return {
      assetType: getValue(
        assetDetail?.asset_type?.name,
        assetDetail?.other_asset_type_name
      ),
      assetModel: getValue(
        assetDetail?.asset_model?.name,
        assetDetail?.other_asset_model_name
      ),
      manufacturer: getValue(
        assetDetail?.manufacture?.name,
        assetDetail?.other_manufacture_name
      ),
      budgetSource: getValue(
        assetDetail?.budget_source?.name,
        assetDetail?.other_budget_source_name
      ),
      borrowedFrom: getValue(
        assetDetail?.borrowed_from?.name,
        assetDetail?.other_borrowed_from_entity_name
      ),

      sublabels: {
        assetModel: getSublabel(
          assetDetail?.other_asset_model_name,
          'asset.detail_other_asset_model'
        ),
        manufacturer: getSublabel(
          assetDetail?.other_manufacture_name,
          'asset.detail_other_manufacture'
        ),
        budgetSource: getSublabel(
          assetDetail?.other_budget_source_name,
          'asset.detail_other_budget_source'
        ),
        borrowedFrom: getSublabel(
          assetDetail?.other_borrowed_from_entity_name,
          'asset.detail_other_borrowed_from'
        ),
      },
    }
  }, [assetDetail, t])

  useToolbar({ title: t('asset.asset_inventory_detail') })

  useFocusEffect(
    useCallback(() => {
      refetchDetail()
    }, [refetchDetail])
  )

  if (isLoadingDetail) {
    return (
      <SafeAreaView className='flex-1 bg-white justify-center items-center'>
        <ActivityIndicator size='large' color={colors.honeyFlower} />
      </SafeAreaView>
    )
  }

  if (isError || !assetDetail) {
    return (
      <SafeAreaView className='flex-1 bg-white justify-center items-center'>
        <Text>Asset not found</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className='flex-1 bg-lightBlueGray gap-2'>
      <ScrollView contentContainerClassName='bg-white p-4 gap-2'>
        <Text className={cn(AppStyles.textBold, 'text-midnightBlue')}>
          {t('asset.asset_inventory_detail')}
        </Text>
        <View className='gap-4'>
          <View className='gap-1'>
            <View className='flex-row items-center gap-1 flex-wrap'>
              <Text className={cn(AppStyles.textBold, 'text-midnightBlue')}>
                {assetNames.assetType}
              </Text>
              {assetDetail?.other_asset_type_name ? (
                <Text className={AppStyles.labelRegular}>
                  {t('asset.detail_other_asset_type')}
                </Text>
              ) : null}
            </View>
            <Text className={cn(AppStyles.labelRegular, 'text-[10px]')}>
              {`${t('label.updated_at')} ${convertString(assetDetail.updated_at, SHORT_DATE_TIME_FORMAT).toUpperCase()}`}
            </Text>
          </View>

          {/* Asset Spesification */}
          <View className='gap-1'>
            <Text className={AppStyles.labelBold}>
              {t('asset.asset_specification')}
            </Text>
            <InfoAssetRow
              label={t('asset.serial_number')}
              value={assetDetail.serial_number}
              valueClassName={cn(AppStyles.textBoldSmall)}
            />
            <InfoAssetRow
              label={t('asset.asset_model')}
              subLabel={assetNames.sublabels.assetModel}
              value={assetNames.assetModel}
            />
            <InfoAssetRow
              label={t('asset.manufacturer')}
              subLabel={assetNames.sublabels.manufacturer}
              value={assetNames.manufacturer}
            />
          </View>

          <View className={AppStyles.borderBottom} />

          {/* Working Status */}
          <View className={AppStyles.rowBetween}>
            <Text className={AppStyles.labelBold}>
              {t('asset.working_status')}
            </Text>
            <View
              className={getStatusBadgeStyle(assetDetail.working_status.id)}>
              <Text
                className={getStatusTextStyle(assetDetail.working_status.id)}>
                {assetDetail?.working_status.name ?? '-'}
              </Text>
            </View>
          </View>

          <View className={AppStyles.borderBottom} />

          {/* Entity */}
          <View className='gap-1'>
            <Text className={AppStyles.labelBold}>{t('asset.entity')}</Text>
            <InfoAssetRow
              label={t('asset.entity')}
              value={assetDetail.entity.name}
            />
            <InfoAssetRow
              label={t('asset.contact_person')}
              value={formatContactPerson(
                assetDetail?.contact_person?.first?.name,
                assetDetail?.contact_person?.first?.number
              )}
            />
            <InfoAssetRow
              label={`${t('asset.contact_person')} 2`}
              value={formatContactPerson(
                assetDetail?.contact_person?.second?.name,
                assetDetail?.contact_person?.second?.number
              )}
            />
            <InfoAssetRow
              label={`${t('asset.contact_person')} 3`}
              value={formatContactPerson(
                assetDetail?.contact_person?.third?.name,
                assetDetail?.contact_person?.third?.number
              )}
            />
          </View>

          <View className={AppStyles.borderBottom} />

          {/* Ownership */}
          <View className='gap-1'>
            <Text className={AppStyles.labelBold}>{t('asset.ownership')}</Text>
            <InfoAssetRow
              label={t(
                assetDetail.ownership.id === 1
                  ? 'asset.owned_amount'
                  : 'asset.borrowed_amount'
              )}
              value={assetDetail.ownership.qty ?? '-'}
            />
            <InfoAssetRow
              label={t('asset.ownership_status')}
              value={assetDetail.ownership?.name}
            />
            <InfoAssetRow
              label={t('asset.borrowed_from')}
              value={assetNames.borrowedFrom ?? '-'}
              subLabel={assetNames.sublabels.borrowedFrom}
            />
          </View>

          <View className={AppStyles.borderBottom} />

          {/* Budget */}
          <View className='gap-1'>
            <Text className={AppStyles.labelBold}>{t('asset.budget')}</Text>
            <InfoAssetRow
              label={t('asset.production_year')}
              value={assetDetail.production_year}
            />
            <InfoAssetRow
              label={t('asset.budget_year')}
              subLabel={assetNames.sublabels.budgetSource}
              value={assetDetail.budget_source.year}
            />
            <InfoAssetRow
              label={t('asset.budget_source')}
              value={assetNames.budgetSource}
            />
          </View>

          <View className={AppStyles.borderBottom} />

          {/* Electricity */}
          <View className='gap-1'>
            <Text className={AppStyles.labelBold}>
              {t('asset.electricity')}
            </Text>
            <InfoAssetRow
              label={t('asset.electricity_availability_time')}
              value={assetDetail.electricity?.name ?? '-'}
            />
          </View>

          <View className={AppStyles.borderBottom} />

          {/* Warranty */}
          <View className='gap-1'>
            <Text className={AppStyles.labelBold}>{t('asset.warranty')}</Text>
            <InfoAssetRow
              label={t('asset.warranty_start_date')}
              value={formatDate(assetDetail.warranty.start_date)}
            />
            <InfoAssetRow
              label={t('asset.warranty_end_date')}
              value={formatDate(assetDetail.warranty.end_date)}
            />
            <InfoAssetRow
              label={t('asset.vendor')}
              value={assetDetail.warranty.asset_vendor_name ?? '-'}
            />
          </View>

          <View className={AppStyles.borderBottom} />

          {/* Calibration */}
          <View className='gap-1'>
            <Text className={AppStyles.labelBold}>
              {t('asset.calibration')}
            </Text>
            <InfoAssetRow
              label={t('asset.last_calibration_date')}
              value={formatDate(assetDetail.calibration.last_date)}
            />
            <InfoAssetRow
              label={t('asset.calibration_schedule')}
              value={assetDetail.calibration?.name ?? '-'}
            />
            <InfoAssetRow
              label={t('asset.vendor')}
              value={assetDetail.calibration?.asset_vendor_name ?? '-'}
            />
          </View>

          <View className={AppStyles.borderBottom} />

          {/* Maintenance */}
          <View className='gap-1'>
            <Text className={AppStyles.labelBold}>
              {t('asset.maintenance')}
            </Text>
            <InfoAssetRow
              label={t('asset.last_maintenance_date')}
              value={formatDate(assetDetail.maintenance?.last_date)}
            />
            <InfoAssetRow
              label={t('asset.maintenance_schedule')}
              value={assetDetail.maintenance?.name ?? '-'}
            />
            <InfoAssetRow
              label={t('asset.vendor')}
              value={assetDetail.maintenance?.asset_vendor_name ?? '-'}
            />
          </View>
        </View>
      </ScrollView>
      <View className='bg-white p-4'>
        <Button
          preset='outlined-primary'
          textClassName={cn(AppStyles.textMedium, 'ml-2 text-main')}
          text={t('button.edit_asset')}
          LeftIcon={Icons.IcEdit}
          leftIconColor={colors.main()}
          onPress={() =>
            navigation.navigate('AddAssetInventory', {
              isEdit: true,
              data: assetDetail,
            })
          }
        />
      </View>
    </SafeAreaView>
  )
}
