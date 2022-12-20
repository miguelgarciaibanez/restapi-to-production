import cacheExternal from '@exmpl/utils/cache_external';
import { createServer } from "@exmpl/utils/server";
import logger from '@exmpl/utils/logger'
import db from '@exmpl/utils/db';

/*
cacheExternal.open()
    .then(()=>db.open())
*/
/*
    db.open()
    .then(()=>createServer())
    .then( server => {
        server.listen(3000, () => {
            logger.info(`Listening on http://localhost:3000`)
        })
    })
    .catch( err => {
        logger.error(`Error: ${err}`)
    })
*/
(async()=>{
    try {
        await cacheExternal.open();
        await db.open();
        const server =  await createServer();
        server.listen(3000, () => {
            logger.info(`Listening on http://localhost:3000`)
        })
    } catch (error) {
        logger.error(`Error: ${error}`)
    }
})();
