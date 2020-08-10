"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const https_1 = require("https");
const fs_1 = __importDefault(require("fs"));
const injectedPrefix = '/__injected__/';
(async () => {
    http_1.createServer((req, res) => {
        var _a, _b;
        if ((_a = req.url) === null || _a === void 0 ? void 0 : _a.startsWith(injectedPrefix)) {
            fs_1.default.createReadStream(`${__dirname}/injected/${(_b = req.url) === null || _b === void 0 ? void 0 : _b.slice(injectedPrefix.length)}`, 'utf8')
                .pipe(res, { end: true });
            return;
        }
        const { Host, host, Referer, referer, ...headers } = req.headers;
        const proxy = https_1.request({
            hostname: 'cracking-the-cryptic.web.app',
            port: 443,
            path: req.url,
            method: req.method,
            headers: {
                ...headers,
                host: 'cracking-the-cryptic.web.app',
                referer: 'https://cracking-the-cryptic.web.app/'
            },
        }, (actualRes) => {
            var _a;
            if ((_a = actualRes.headers['content-type']) === null || _a === void 0 ? void 0 : _a.startsWith('text/html')) {
                fs_1.default.createReadStream(`${__dirname}/index.html`, 'utf8')
                    .pipe(res, { end: true });
            }
            else {
                res.writeHead(actualRes.statusCode, actualRes.headers);
                actualRes.pipe(res, {
                    end: true
                });
            }
        });
        req.pipe(proxy, {
            end: true
        });
    }).listen(6788, '0.0.0.0', () => console.log('have fun'));
})();
//# sourceMappingURL=server.js.map