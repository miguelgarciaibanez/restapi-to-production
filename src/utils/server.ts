import bodyParser from "body-parser";
import express from "express";
import * as OpenApiValidator from "express-openapi-validator";
import { Express } from "express-serve-static-core";
import morgan from "morgan";
import morganBody from "morgan-body";
import { connector, summarise } from "swagger-routes-express";
import YAML from "yamljs";

import * as api from '@exmpl/api/controllers';
import { expressDevLogger } from '@exmpl/utils/express_dev_logger';


export async function createServer(): Promise<Express> {
    const yamlSpecFile = './config/openapi.yml';
    const apiDefinition =  YAML.load(yamlSpecFile);
    const apiSummary = summarise(apiDefinition);
    console.log(apiSummary);

    const server = express();

    const validatorOptions = {
        coerceTypes:true,
        apiSpec: yamlSpecFile,
        validateRequests: true,
        validateResponses: false
    }

    server.use(OpenApiValidator.middleware(validatorOptions));

    // error customization, if request is invalid
    
    server.use((err: any, req:express.Request, res:express.Response, next: express.NextFunction)=>{
        res.status(err.status).json({
            error:{
                type:'request_validation',
                message: err.message,
                errors: err.errors
            }
        })
    })
    
    server.use(morgan(':method :url :status :response-time ms - :res[content-length]'))
  
    morganBody(server)
  
    server.use(expressDevLogger)

    const connect = connector(api , apiDefinition,{
        onCreateRoute:(method: string, descriptor:any[]) => {
            descriptor.shift();
            console.log(`${method}:${descriptor[0]}: ${(descriptor[1] as any)?.name}`);
        },
        security: {
            bearerAuth:api.auth
        }
    });

    connect(server);

    return server;
}