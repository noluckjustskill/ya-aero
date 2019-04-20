/* tslint:disable:interface-name */

import { Request, Response } from 'express';

import 'express';

declare global {
  interface IRequest<Body> extends Request {
    query: Body;
    body: Body;
    files?: {
      [key: string]: {
        name: string;
        data: Buffer;
        md5: () => string;
      };
    };
  }

  interface IResponse<Body> extends Response {
    send: (body: Body) => IResponse<Body>;
    status: (code: number) => IResponse<Body>;
  }
}
