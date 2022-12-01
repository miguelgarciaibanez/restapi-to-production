import { faker } from '@faker-js/faker';

import User from '@exmpl/api/models/user'
import UserService from '@exmpl/api/services/user'

type DummyUser = {email: string, password: string, name: string, userId: string}
type AuthorizedDummyUser = {email: string, password: string, name: string, userId: string, token: string}

export function dummy() {
  return {
    email: faker.internet.email(),
    password: faker.internet.password(),
    name: faker.name.firstName()
  }
}

export async function createDummy(): Promise<DummyUser> {
  return new Promise(async (resolve,reject) =>{
    const user = dummy()
    const dbUser = new User(user)
    await dbUser.save()
    resolve ({...user, userId: dbUser._id.toString()});
  })
  
}

export async function createDummyAndAuthorize(): Promise<AuthorizedDummyUser> {
  return new Promise( async (resolve, reject)=>{
    const user = await createDummy()
    const authToken = await UserService.createAuthToken(user.userId)
    resolve ({ ...user, token: authToken.token});
  })

}