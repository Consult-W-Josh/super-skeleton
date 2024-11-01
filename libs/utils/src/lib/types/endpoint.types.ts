export enum HttpMethods {
  Post = 'post',
  Put = 'put',
  Get = 'get',
  Patch = 'patch',
  Delete = 'delete'
}

export class Endpoint<
  ResponseType = unknown,
  BodyType = unknown,
  QueryType = unknown
> {
	path: string;
	method: HttpMethods;
	fullPath: string;
	parentModule?: string;
	schemaNames?: {
    body?: string;
    response?: string;
    query?: string;
  };
	dto?: new () => unknown;
	query?: new () => unknown;
	response?: new () => ResponseType;
	name?: string;
	tags?: Array<string>;
	description?: string;
	responseType?: ResponseType;
	bodyType?: BodyType;
	queryType?: QueryType;

	constructor( path: string, method: HttpMethods, fullPath: string ) {
		this.path = path;
		this.method = method;
		this.fullPath = fullPath;
	}
}
