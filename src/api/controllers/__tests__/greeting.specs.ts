import request from 'supertest';
import { Express } from 'express-serve-static-core';

import { createServer } from '@exmpl/utils/server';
import {createDummyAndAuthorize} from '@exmpl/tests/user.specs'
import db from '@exmpl/utils/db';


let server:Express;

beforeAll(async()=>{
    await db.open()
    server = await createServer();
});

afterAll(async () => {
  await db.close()
})

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
      });

      it('should return 401 & valid eror response to invalid authorization token', async () => {
        const result = await request(server).get(`/api/v1/goodbye`).set('Authorization', 'Bearer invalidFakeToken');
        expect(result.statusCode).toEqual(401);
        expect(result.headers[`content-type`]).toMatch('application/json');
        expect(JSON.parse(result.text)).toMatchObject({error: {type: 'unauthorized', message: 'Authentication Failed'}});
      })
    
      it('should return 401 & valid eror response if authorization header field is missed', async () => {
        const result = await request(server).get(`/api/v1/goodbye`);
        expect(result.statusCode).toEqual(401);
        expect(result.headers[`content-type`]).toMatch('application/json');
        expect(JSON.parse(result.text)).toMatchObject({'error': {
            type: 'request_validation', 
            message: 'Authorization header required', 
            errors: expect.anything()
        }});
      })
});

/*
describe('GET /goodbye', () => {
  it('should return 200 & valid response to authorization with fakeToken request', async () => {
    const dummy = await createDummyAndAuthorize()
    console.log(dummy.token)
    const result = await request(server)
                    .get(`/api/v1/goodbye`)
                    .set('Authorization', `Bearer ${dummy.token}`);
        expect(result.statusCode).toEqual(200);
        expect(result.headers[`content-type`]).toMatch('application/json');
        expect(JSON.parse(result.text)).toMatchObject({'message': `Goodbye, ${dummy.userId}!`});
  })
})*/