import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getMonitorData } from '@/api/monitor'

export const useMonitorStore = defineStore('monitor', () => {
  const topics = ref<string[]>([])

  const fetchTopics = async () => {
    const data = await getMonitorData()
    topics.value = data.topics
  }

  return { topics, fetchTopics }
})
