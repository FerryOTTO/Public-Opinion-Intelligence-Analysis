import request from './request'

export const getSecurityOverview = async () => request.post('/security/overview')

export const getThreatDetectData = async () => request.post('/security/threat-detect')

export const getRumorDetectData = async () => request.post('/security/rumor-detect')

export const getSecurityMapData = async () => request.post('/security/map')

