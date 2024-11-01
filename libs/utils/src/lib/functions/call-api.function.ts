import { Endpoint } from '../types';
import axios, { AxiosResponse, Method } from 'axios';

export function makeHttpRequest( {
	method,
	url,
	body,
	params,
	headers,
	query
}: {
  method: Method;
  url: string;
  body?: unknown;
  params?: Array<string>;
  headers?: any;
  query?: any;
} ): Promise<AxiosResponse> {
	return axios( {
		method,
		url,
		data: body,
		headers: headers,
		params: query
	} );
}

export async function callApi<Input, Output, Query = Input>(
	requestParams: {
    serviceUri: string;
    endpoint: Endpoint;
    headers?: unknown;
    body?: Input;
    params?: Array<string>;
    query?: Query;
  },
	rawResponse = false
): Promise<Output> {
	const response = await makeHttpRequest( {
		method: requestParams.endpoint.method,
		body: requestParams.body,
		query: requestParams.query,
		headers: requestParams.headers,
		params: requestParams.params,
		url: `${requestParams.serviceUri}${requestParams.endpoint.fullPath}`
	} );
	return ( !rawResponse ? response.data : response ) as Output;
}
