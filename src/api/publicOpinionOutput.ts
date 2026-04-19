import request from './request'
import type { OutputFormat, OutputTone } from '@/mock/publicOpinionOutput'

export interface GeneratePublicOpinionPayload {
  keyword: string
  tone: OutputTone
  format: OutputFormat
  scene: string
  extraPrompt?: string
}

export interface GeneratePublicOpinionResult {
  title: string
  content: string
  tags: string[]
  scenario: string
  riskLevel: '低' | '中' | '高'
}

export const generatePublicOpinionContent = async (data: GeneratePublicOpinionPayload) => {
  return request.post('/public-opinion-output/generate', data) as Promise<GeneratePublicOpinionResult>
}
