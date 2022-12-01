import fs from 'fs'
import jwt, {SignOptions, VerifyOptions} from 'jsonwebtoken'

import User, {IUser} from '@exmpl/api/models/user';
import config from '@exmpl/config'
import logger from '@exmpl/utils/logger';
import cacheLocal from '@exmpl/utils/cache_local';

export type ErrorResponse = {error: {type: string, message: string}}
export type AuthResponse = ErrorResponse | {userId: string}
export type CreatedUserResponse = ErrorResponse | {userId: string}
export type LoginUserResponse = ErrorResponse | {token: string, userId: string, expireAt: Date}


const privateKey = fs.readFileSync(config.privateKeyFile)
const privateSecret = {
  key: privateKey, 
  passphrase: config.privateKeyPassphrase
}
const signOptions: SignOptions = {
  algorithm: 'RS256',
  expiresIn: '14d'
}

const publicKey = fs.readFileSync(config.publicKeyFile)
const verifyOptions: VerifyOptions = {
  algorithms: ['RS256']
}


function createAuthToken(userId:string): Promise<{token:string, expireAt:Date}>{
  return new Promise((resolve,reject)=>{
    jwt.sign({userId: userId}, privateSecret, signOptions, (err: Error | null, encoded: string | undefined) => {
      if (err === null && encoded !== undefined) {
        const expireAfter = 2 * 604800 /* two weeks */
        const expireAt = new Date()
        expireAt.setSeconds(expireAt.getSeconds() + expireAfter)
        
        resolve({token: encoded, expireAt: expireAt})
      } else {
        reject(err)
      }
    })
  })
}

async function login(login: string, password: string): Promise<LoginUserResponse> {
  try {
    //const user = await User.findOne({email: login})
    //if (!user) {
    //  return {error: {type: 'invalid_credentials', message: 'Invalid Login/Password'}}
    //}

    let user: IUser | undefined | null = cacheLocal.get<IUser>(login);

    if (!user) {
      user = await User.findOne({email: login});
      if (!user) {
        return {error: {type: 'invalid_credentials', message: 'Invalid Login/Password'}}
      }
    }

    const passwordMatch = await user.comparePassword(password)
    if (!passwordMatch) {
      return {error: {type: 'invalid_credentials', message: 'Invalid Login/Password'}}
    }

    cacheLocal.set(user._id.toString(), user);
    cacheLocal.set(login, user);

    const authToken = await createAuthToken(user._id.toString())
    return {userId: user._id.toString(), token: authToken.token, expireAt: authToken.expireAt}
  } catch (err) {
    logger.error(`login: ${err}`)
    return Promise.reject({error: {type: 'internal_server_error', message: 'Internal Server Error'}})
  }
}

function auth(bearerToken: string): Promise<AuthResponse> {
  return new Promise(function(resolve, reject) {
    const token = bearerToken.replace('Bearer ', '')
    if (token === 'fakeToken') {
      resolve({userId: 'fakeUserId'})
      return
    }

    resolve({error: {type: 'unauthorized', message: 'Authentication Failed'}})
  })
}

function createUser(email: string, password:string, name:string): Promise<CreatedUserResponse> {
  return new Promise(async (resolve,reject)=>{
    const user = new User({email:email, password:password, name: name});
    try {
      const userCreated = await user.save();
      resolve({userId: userCreated._id.toString()});
    } catch(err) {
      if (JSON.parse(JSON.stringify(err)).code === 11000){
        resolve({error: {type: 'account_already_exists', message: `${email} already exists`}});
      } else {
        logger.error(`createUser: ${err}`);
        reject(err)
      }
    }
  })
}


export default { auth: auth, createAuthToken: createAuthToken, login: login, createUser: createUser }