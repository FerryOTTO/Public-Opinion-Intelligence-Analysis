import { agentList, agentLogs, agentOverview } from '@/mock/agent'

export const getAgentOverview = async () => Promise.resolve(agentOverview)

export const getAgentList = async () => Promise.resolve(agentList)

export const getAgentLogs = async () => Promise.resolve(agentLogs)
