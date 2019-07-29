import axios, { AxiosRequestConfig, AxiosResponse, AxiosStatic } from 'axios'

export abstract class BaseApiService {
  protected api: AxiosStatic

  constructor () {
    this.api = axios
  }

  protected callMethod (method: string, url: string, requestData?: object, responseKey?: string | null, config?: AxiosRequestConfig) : any {
    const requestedMethod = method.toLowerCase()

    switch (requestedMethod) {
      case 'get':
        return this.api.get(url, config)
          .then((response: AxiosResponse) => {
            return responseKey && response.data.hasOwnProperty(responseKey)
              ? response.data[responseKey] : response.data
          })

      case 'post':
        return this.api.post(url, requestData, config)
          .then((response: AxiosResponse) => {
            return responseKey && response.data.hasOwnProperty(responseKey)
              ? response.data[responseKey] : response.data
          })

      default:
        throw new Error('An undefined method called.')
    }
  }
}
