"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createServer = void 0;
const express_1 = __importDefault(require("express"));
const OpenApiValidator = __importStar(require("express-openapi-validator"));
const swagger_routes_express_1 = require("swagger-routes-express");
const yamljs_1 = __importDefault(require("yamljs"));
const api = __importStar(require("@exmpl/api/controllers"));
function createServer() {
    return __awaiter(this, void 0, void 0, function* () {
        const yamlSpecFile = './config/openapi.yml';
        const apiDefinition = yamljs_1.default.load(yamlSpecFile);
        const apiSummary = (0, swagger_routes_express_1.summarise)(apiDefinition);
        console.log(apiSummary);
        const server = (0, express_1.default)();
        const validatorOptions = {
            coerceTypes: true,
            apiSpec: yamlSpecFile,
            validateRequests: true,
            validateResponses: false
        };
        server.use(OpenApiValidator.middleware(validatorOptions));
        // error customization, if request is invalid
        server.use((err, req, res, next) => {
            res.status(err.status).json({
                error: {
                    type: 'request_validation',
                    message: err.message,
                    errors: err.errors
                }
            });
        });
        const connect = (0, swagger_routes_express_1.connector)(api, apiDefinition, {
            onCreateRoute: (method, descriptor) => {
                descriptor.shift();
                console.log(`${method}:${descriptor[0]}: ${descriptor[1].name}`);
            },
            security: {
                bearerAuth: api.auth
            }
        });
        connect(server);
        return server;
    });
}
exports.createServer = createServer;
