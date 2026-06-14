import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 120000,
})

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    console.error('[StoryLens API]', err.response?.data || err.message)
    return Promise.reject(err)
  }
)

export const storiesAPI = {
  list: (params) => api.get('/stories/', { params }),
  get: (index) => api.get(`/stories/${index}`),
  metadata: () => api.get('/stories/metadata'),
}

export const zipfAPI = {
  all: () => api.get('/zipf/'),
  byStyle: (style) => api.get(`/zipf/${encodeURIComponent(style)}`),
}

export const parsingAPI = {
  all: (maxStories = 50) =>
    api.get('/parsing/', { params: { max_stories: maxStories } }),
}

export const styleAPI = {
  features: () => api.get('/style/'),
}

export const classifyAPI = {
  w2v: () => api.get('/classify/w2v'),
  bertConfig: () => api.get('/classify/bert-config'),
  modernbertConfig: () => api.get('/classify/modernbert-config'),
}

export const sentimentAPI = {
  sentiment: (maxPerTheme = 40) =>
    api.get('/sentiment/', { params: { max_per_theme: maxPerTheme } }),
  emotion: (maxPerTheme = 30) =>
    api.get('/sentiment/emotion', { params: { max_per_theme: maxPerTheme } }),
}

export const qaAPI = {
  storyQA: (index) => api.get(`/qa/story/${index}`),
  datasetSample: (n = 10) => api.get('/qa/dataset/sample', { params: { n } }),
  ask: (question, context) => api.post('/qa/ask', { question, context }),
  finetuneConfig: () => api.get('/qa/finetune-config'),
}
