import { Request, Response } from 'express';
import { PaginationParams } from './todo.js';

export interface TypedRequest<T = unknown> extends Omit<Request, 'body'> {
  body: T;
}

export interface TypedRequestQuery<T = unknown> extends Omit<Request, 'query'> {
  query: T & Request['query'];
}

export interface PaginatedRequest extends TypedRequestQuery<PaginationParams> {}

export interface TypedResponse<T = unknown> extends Omit<Response, 'json'> {
  json: (body: T) => this;
}