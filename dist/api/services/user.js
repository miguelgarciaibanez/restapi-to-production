"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function auth(bearerToken) {
    return new Promise(function (resolve, reject) {
        const token = bearerToken.replace('Bearer ', '');
        if (token === 'fakeToken') {
            resolve({ userId: 'fakeUserId' });
            return;
        }
        resolve({ error: { type: 'unauthorized', message: 'Authentication Failed' } });
    });
}
exports.default = { auth: auth };
