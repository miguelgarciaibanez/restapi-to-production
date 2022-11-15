"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeJsonResponse = void 0;
function writeJsonResponse(res, code, payload, headers) {
    const data = typeof payload === 'object' ? JSON.stringify(payload, null, 2) : payload;
    res.writeHead(code, Object.assign(Object.assign({}, headers), { 'Content-Type': 'application/json' }));
    res.end(data);
}
exports.writeJsonResponse = writeJsonResponse;
