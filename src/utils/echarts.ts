import type { EChartsOption } from 'echarts'

export const chartThemeColors = ['#409EFF', '#00F0FF', '#67C23A', '#E6A23C', '#F56C6C', '#909399']

export const createCommonOption = (option: EChartsOption): EChartsOption => {
  return {
    textStyle: {
      color: '#b7c7e8',
      fontFamily: 'Microsoft YaHei, PingFang SC, Segoe UI, sans-serif',
    },
    grid: {
      left: 28,
      right: 20,
      top: 30,
      bottom: 24,
      containLabel: true,
    },
    ...option,
  }
}
