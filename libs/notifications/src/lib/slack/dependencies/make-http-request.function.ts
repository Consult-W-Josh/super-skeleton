import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

export type Auth = {
  username: string;
  password: string;
};

export type Proxy = {
  host: string;
  port: number;
  auth?: Auth;
};

export type MakeHttpRequestParams = {
  method: string;
  url: string;
  headers?: unknown;
  body?: unknown;
  query?: unknown;
  auth?: Auth;
  proxy?: Proxy;
};

export async function makeHttpRequest(params: MakeHttpRequestParams): Promise<AxiosResponse> {
  const config: AxiosRequestConfig = {
    method: params.method,
    url: params.url,
    headers: params.headers as Record<string, string>,
    data: params.body,
    params: params.query,
    auth: params.auth,
    proxy: params.proxy,
  };

  return axios(config);
}