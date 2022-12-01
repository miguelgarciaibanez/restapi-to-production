import * as express from 'express'
import GreetingService from '@exmpl/api/services/greeting'
import {writeJsonResponse} from '@exmpl/utils/express'
import logger from '@exmpl/utils/logger'
 
export function hello(req: express.Request, res: express.Response): void {
  const name = req.query.name || 'stranger'
  writeJsonResponse(res, 200, {"message": `Hello, ${name}!`})
}


export async function goodbye(req: express.Request, res: express.Response): Promise<void> {
  const userId = res.locals.auth.userId
  try {
    const message = await GreetingService.goodbye(userId);
    writeJsonResponse(res, 200, message)
  } catch (error) {
    logger.error(`goodbye: ${error}`)
      writeJsonResponse(res, 500, {error: {type: 'internal_server_error', message: 'Internal Server Error'}})
  }
}