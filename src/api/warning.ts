import request from './request'

export const getWarningOverview = async () => request.post('/warning/overview')

export const getAlertList = async () => request.post('/warning/alerts')

export const getWarningRules = async () => request.post('/warning/rules')

export const saveWarningRule = async (payload: {
  name: string
  condition: string
  notify: string
  enabled: boolean
}) => request.post('/warning/rules/save', payload)

export const getReportPreview = async () => request.post('/warning/report-preview')

