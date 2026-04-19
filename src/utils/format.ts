export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('zh-CN').format(value)
}

export const formatPercent = (value: number): string => {
  return `${value.toFixed(1)}%`
}

export const formatDateTime = (value: string | number | Date): string => {
  const date = new Date(value)
  return `${date.toLocaleDateString('zh-CN')} ${date.toLocaleTimeString('zh-CN', { hour12: false })}`
}
