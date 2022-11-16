"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
const user_1 = __importDefault(require("@exmpl/api/services/user"));
const express_1 = require("@exmpl/utils/express");
function auth(req, res, next) {
    const token = req.headers.authorization;
    user_1.default.auth(token)
        .then(authResponse => {
        if (!authResponse.error) {
            res.locals.auth = {
                userId: authResponse.userId
            };
            next();
        }
        else {
            (0, express_1.writeJsonResponse)(res, 401, authResponse);
        }
    })
        .catch(err => {
        (0, express_1.writeJsonResponse)(res, 500, { error: { type: 'internal_server_error', message: 'Internal Server Error' } });
    });
}
exports.auth = auth;
