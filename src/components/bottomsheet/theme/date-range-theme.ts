import { CalendarTheme } from '@marceloterreiro/flash-calendar'
import colors from '@/theme/colors'
import fonts from '@/theme/fonts'

export const dateRangePickerTheme = (color: string): CalendarTheme => {
  return {
    rowMonth: {
      container: {
        paddingHorizontal: 16,
      },
      content: {
        textAlign: 'left',
        fontFamily: fonts.mainBold,
        color: colors.mediumGray,
        fontSize: 16,
      },
    },
    itemWeekName: {
      content: {
        fontFamily: fonts.mainBold,
        color: colors.marine,
        fontSize: 16,
      },
    },
    itemDayContainer: {
      activeDayFiller: {
        backgroundColor: color,
      },
    },
    itemDay: {
      base: () => ({
        container: {
          borderColor: 'transparent',
          borderRadius: 50,
        },
        content: {
          fontFamily: fonts.mainRegular,
          color: colors.marine,
          fontSize: 16,
        },
      }),
      today: () => ({
        container: {
          borderColor: color,
        },
        content: { color },
      }),
      disabled: () => ({
        content: {
          color: colors.quillGrey,
        },
      }),
      active: ({ isStartOfRange, isEndOfRange }) => {
        return {
          container: {
            backgroundColor: color,
            borderTopLeftRadius: isStartOfRange ? 50 : 0,
            borderBottomLeftRadius: isStartOfRange ? 50 : 0,
            borderTopRightRadius: isEndOfRange ? 50 : 0,
            borderBottomRightRadius: isEndOfRange ? 50 : 0,
          },
          content: {
            color: colors.mainText() ?? colors.white,
          },
        }
      },
    },
  }
}
