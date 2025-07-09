import { Injectable, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { IncomingHttpHeaders } from 'http';

@Injectable()
export class RequestService {
  constructor(@Inject(REQUEST) private readonly _request: Request) {}

  get request(): Request {
    return this._request;
  }

  get headers(): IncomingHttpHeaders {
    return this.request.headers;
  }
}
