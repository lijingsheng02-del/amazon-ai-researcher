export {}

declare global {
  interface Window {
    researchApi: {
      init: () => Promise<{
        settings: {
          apiKey: string
          baseUrl: string
          model: string
          engineMode: 'offline' | 'api-enhanced'
        }
        personas: Array<{
          id: string
          ageRange: string
          occupation: string
          incomeTier: string
          residence: string
          family: string
          habits: string
          priceSensitivity: string
          concerns: string[]
        }>
        reports: Array<unknown>
      }>
      saveSettings: (settings: {
        apiKey: string
        baseUrl: string
        model: string
        engineMode: 'offline' | 'api-enhanced'
      }) => Promise<{
        apiKey: string
        baseUrl: string
        model: string
        engineMode: 'offline' | 'api-enhanced'
      }>
      runResearch: (product: unknown, engineMode: 'offline' | 'api-enhanced') => Promise<{ report: unknown }>
      listReports: (search: string) => Promise<Array<unknown>>
      getReport: (reportId: number) => Promise<unknown>
      deleteReport: (reportId: number) => Promise<boolean>
      onProgress: (callback: (payload: {
        stage: string
        progress: number
        activePersonaIds: string[]
      }) => void) => () => void
    }
  }
}
