import { Request, Response } from 'express';
import { PaginationParams } from './todo.js';

export interface TypedRequest<T = any> extends Request {
  body: T;
}

export interface TypedRequestQuery<T = any> extends Request {
  query: T;
}

export interface PaginatedRequest extends TypedRequestQuery<PaginationParams> {}

export interface TypedResponse<T = any> extends Response {
  json: (body: T) => TypedResponse<T>;
}