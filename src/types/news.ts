export interface NewsItem {
  title: string
  cleanTitle: string
  originallink: string
  link: string
  description: string
  cleanDescription: string
  pubDate: string
  press: string
}

export interface NewsResponse {
  lastBuildDate?: string
  total: number
  start: number
  display: number
  items: NewsItem[]
  isMock?: boolean
  apiError?: string
}

export interface SearchConfig {
  query: string
  display: number
  sort: "sim" | "date"
}

export interface ApiCredentials {
  clientId: string
  clientSecret: string
}
