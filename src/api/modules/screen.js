import { get } from '@/api/request'

export function getScreenOverview() {
  return get('/screen/overview')
}
