import { faker } from '@faker-js/faker';
import request from 'supertest';
import { Express } from 'express-serve-static-core';
import db from '@exmpl/utils/db';
import { createServer } from '@exmpl/utils/server';

let server: Express

beforeAll(async () => {
    await db.open()
    server = await createServer()
})

afterAll(async () => {
    await db.close()
})



describe('POST /api/v1/user', () => {
    it('should return 201 & valid response for valid user', async () => {
        const data = {
            email: faker.internet.email(),
            password: faker.internet.password(),
            name: faker.name.firstName()
        }
        const result = await request(server)
            .post('/api/v1/user')
            .send(data);
        console.log(result);
        expect(result.statusCode).toEqual(201);
        expect(JSON.parse(result.text)).toMatchObject({
            userId: expect.stringMatching(/^[a-f0-9]{24}$/)
        });
    })

    it('should return 409 & valid response for duplicated user', async () => {
        const data = {
            email: faker.internet.email(),
            password: faker.internet.password(),
            name: faker.name.firstName()
        }
        const result = await request(server)
            .post('/api/v1/user')
            .send(data);
        expect(result.statusCode).toEqual(201);
        const result2 = await request(server)
            .post('/api/v1/user')
            .send(data);
        expect(result2.statusCode).toEqual(409);
        expect(JSON.parse(result.text)).toMatchObject({
            error: {
                type: 'account_already_exists',
                message: expect.stringMatching(/already exists/)
            }
        });
    });

    it('should return 400 & valid response for invalid request', async () => {
        const data = {
            mail: faker.internet.email(),
            password: faker.internet.password(),
            name: faker.name.firstName()
        }
        const result = await request(server)
            .post('/api/v1/user')
            .send(data);
        expect(result.statusCode).toEqual(400);
        expect(JSON.parse(result.text)).toMatchObject({
            error: { type: 'request_validation', message: expect.stringMatching(/email/) }
        });
    })
});