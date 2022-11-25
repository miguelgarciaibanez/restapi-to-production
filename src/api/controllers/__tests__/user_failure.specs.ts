import request from 'supertest'
import { Express } from 'express-serve-static-core'
import { faker } from '@faker-js/faker';
import UserService from '@exmpl/api/services/user'
import { createServer } from '@exmpl/utils/server'

jest.mock('@exmpl/api/services/user')

let server: Express
beforeAll(async () => {
  server = await createServer()
})

describe('auth failure', () => {
  it('should return 500 & valid response if auth rejects with an error', async () => {
    (UserService.auth as jest.Mock).mockRejectedValue(new Error())
    const result = await request(server).get('/api/v1/goodbye').set('Authorization', 'Bearer fakeToken');
    expect(result.statusCode).toEqual(500);
    expect(JSON.parse(result.text)).toMatchObject({ error: { type: 'internal_server_error', message: 'Internal Server Error' } });
  })
});

describe('createUser failure', () => {
  it('should return 500 & valid response if auth rejects with an error', async () => {
    (UserService.createUser as jest.Mock).mockResolvedValue({ error: { type: 'unkonwn' } })
    const result = await request(server)
      .post('/api/v1/user')
      .send({
        email: faker.internet.email(),
        password: faker.internet.password(),
        name: faker.name.firstName()
      })
      .set('Accept', 'application/json');
    expect(result.statusCode).toEqual(500);
    expect(JSON.parse(result.text)).toMatchObject({ error: { type: 'internal_server_error', message: 'Internal Server Error' } });
  })
})