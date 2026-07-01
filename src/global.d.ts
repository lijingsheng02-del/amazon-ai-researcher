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
      fetchAmazonProduct: (url: string) => Promise<{
        sourceUrl: string
        asin: string
        title: string
        price: string
        category: string
        bullets: string[]
        image?: {
          id: string
          name: string
          type: string
          size: number
          dataUrl: string
          addedAt: string
        }
        warnings: string[]
      }>
      runResearch: (product: unknown, engineMode: 'offline' | 'api-enhanced') => Promise<{ report: unknown }>
      listReports: (search: string) => Promise<Array<unknown>>
      getReport: (reportId: number) => Promise<unknown>
      deleteReport: (reportId: number) => Promise<boolean>
      renameReport: (reportId: number, title: string) => Promise<unknown>
      exportReportExcel: (reportId: number) => Promise<{ canceled: boolean; filePath?: string }>
      onProgress: (callback: (payload: {
        stage: string
        progress: number
        activePersonaIds: string[]
      }) => void) => () => void
    }
  }
}
