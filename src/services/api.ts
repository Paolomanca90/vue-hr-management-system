const baseUrl = 'https://api.example.com'

export class ApiService {
  static async getDomainsByUsername(username: string) {
    const response = await fetch(`${baseUrl}/domains?username=${username}`)
    if (!response.ok) {
      throw new Error(`Error fetching Domains: ${response.statusText}`)
    }
    const data = await response.json()
    return data as DomainsResponse
  }

  static async setDomain(domain: string) {
    const response = await fetch(`${baseUrl}/domains/${domain}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    if (!response.ok) {
      throw new Error(`Error setting Domain: ${response.statusText}`)
    }
    const data = await response.json()
    return data as { success: boolean }
  }
}

export interface DomainsResponse {
  domains: string[]
  total: number
}
