import request from './request'

export const getAnalysisOverview = async () => request.post('/analysis/overview')

export const getSentimentData = async () => request.post('/analysis/sentiment')

export const getOpinionData = async () => request.post('/analysis/opinion')

export const getTimeSpatialData = async () => request.post('/analysis/time-spatial')

export const getPortraitData = async () => request.post('/analysis/portrait')

export const getMultiModalData = async () => request.post('/analysis/multi-modal')

export const getPolicyInterpretData = async () => request.post('/analysis/policy')

export const getHistoryCompareData = async () => request.post('/analysis/history-compare')

