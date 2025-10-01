"use client"

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios"
import qs from "qs"

const selfApi: AxiosInstance = axios.create({
  baseURL: "/api",
  headers: { accept: "application/json" },
  paramsSerializer: {
    serialize: (params) => qs.stringify(params, { arrayFormat: "brackets" }),
  },
})

export async function apiRequest<T = unknown>(
  endpoint: string,
  options: AxiosRequestConfig = {}
): Promise<T> {
  try {
    const response: AxiosResponse<T> = await selfApi.request({
      url: endpoint,
      ...options,
    })
    return response.data
  } catch (error) {
    console.error(`Erro na requisição [${options.method || "GET"} ${endpoint}]`, error)
    throw error
  }
}

export { selfApi }
