"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hello = void 0;
function hello(req, res) {
    const name = req.query.name || 'stranger';
    const message = `Hello ${name}`;
    res.json({
        "message": message
    });
}
exports.hello = hello;
