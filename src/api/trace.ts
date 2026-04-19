import request from './request'

export const getTraceOverview = async () => request.post('/trace/overview')

export const getSpreadPath = async () => request.post('/trace/spread-path')

export const getSourceTrace = async () => request.post('/trace/source-trace')

export const getSpreadMap = async () => request.post('/trace/spread-map')

