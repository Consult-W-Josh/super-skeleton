import { makeHttpRequest, Auth, Proxy } from "./make-http-request.function";
import { notifyClientOfSuccess } from "./send-api-response.function";

export type ApiParams<Input, QueryInput> = {
  serviceUri: string;
  endpoint: {
    path: string;
    fullPath: string;
    method: string;
  };
  headers?: unknown;
  body?: Input;
  query?: Input | QueryInput;
  params?: {
    [key: string]: string;
  };
  proxy?: Proxy;
  auth?: Auth;
};

export async function callApi<Input, Output, QueryInput = unknown>(
	requestParams: ApiParams<Input, QueryInput>,
	rawResponse = false
): Promise<Output> {
	try {
		if ( requestParams.params ) {
			for ( const p in requestParams.params ) {
				requestParams.endpoint.fullPath = requestParams.endpoint.fullPath.replace(
					`:${p}`,
					requestParams.params[p]
				);
			}
		}
		const response = await makeHttpRequest( {
			method: requestParams.endpoint.method,
			body: requestParams.body,
			query: requestParams.query,
			headers: requestParams.headers,
			url: `${requestParams.serviceUri}${requestParams.endpoint.fullPath}`,
			auth: requestParams.auth,
			proxy: requestParams.proxy,
		} );
		return ( !rawResponse ? response.data : response );
	} catch ( e ) {
		console.log( e );
		throw new Error();
	}
}
