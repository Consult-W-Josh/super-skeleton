import { AxiosError, AxiosResponse } from "axios";

export function notifyClientOfSuccess<T>( response: AxiosResponse<T> | T ) {
	return {
		success: true,
		data: response instanceof Object && "data" in response ? response.data : response,
		statusCode: 200,
	};
}

export function notifyClientOfFailure( error: { error: AxiosError } ) {
	const statusCode = error.error.response?.status || 500;
	const message = error.error.response?.data || "An unexpected error occurred";

	return {
		success: false,
		message,
		statusCode,
	};
}