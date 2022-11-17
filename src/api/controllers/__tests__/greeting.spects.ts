import request from 'supertest';
import { Express } from 'express-serve-static-core';

import { createServer } from '@exmpl/utils/server';


let server:Express;

beforeAll(async()=>{
    server = await createServer();
});

describe('GET /hello',()=>{
    it('should return 200 & valid response if request param is empty', async() =>{
        const result = await request(server).get('/api/v1/hello');
        expect(result.statusCode).toEqual(200);
        expect(result.headers[`content-type`]).toEqual('application/json');
        expect(JSON.parse(result.text).message).toEqual("Hello, stranger!");
    });

    it('should return 200 & valid response if name param is set', async () => {
        const result = await request(server).get(`/api/v1/hello?name=Test%20Name`);
        expect(result.statusCode).toEqual(200);
        expect(result.headers[`content-type`]).toEqual('application/json');
        expect(JSON.parse(result.text).message).toEqual("Hello, Test Name!");
      })
      
      it('should return 400 & valid error response if name param is empty', async () => {
        const result = await request(server).get(`/api/v1/hello?name=`);
        expect(result.statusCode).toEqual(400);
        expect(result.headers[`content-type`]).toMatch('application/json');
        expect(JSON.parse(result.text)).toMatchObject({'error': {
            type: 'request_validation', 
            message: expect.stringMatching(/Empty.*\'name\'/), 
            errors: expect.anything()
          }});
      })
});