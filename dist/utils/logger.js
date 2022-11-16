"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
const config_1 = __importDefault(require("@exmpl/config"));
// npm debug levels (winston default):
// {
//   error: 0,
//   warn: 1,
//   info: 2,
//   http: 3
//   verbose: 4,
//   debug: 5,
//   silly: 6
// }
const prettyJson = winston_1.default.format.printf(info => {
    if (info.message.constructor === Object) {
        info.message = JSON.stringify(info.message, null, 4);
    }
    return `${info.timestamp} ${info.label || '-'} ${info.level}: ${info.message}`;
});
const logger = winston_1.default.createLogger({
    level: config_1.default.loggerLevel === 'silent' ? undefined : config_1.default.loggerLevel,
    silent: config_1.default.loggerLevel === 'silent',
    format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.prettyPrint(), winston_1.default.format.splat(), winston_1.default.format.simple(), winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }), prettyJson),
    defaultMeta: { service: 'api-example' },
    transports: [new winston_1.default.transports.Console({})]
});
exports.default = logger;
