import request from './request'

export const getCollectionOverview = async () => {
  return request.post('/data-collection/overview')
}

export const getCollectionTasks = async () => {
  return request.post('/data-collection/tasks')
}

export const createCollectionTask = async (payload: any) => {
  return request.post('/data-collection/tasks/create', payload)
}

export const getTimeDistribution = async () => {
  return request.post('/data-collection/distribution/time')
}

export const getSpatialDistribution = async () => {
  return request.post('/data-collection/distribution/spatial')
}
