import { createServer } from 'http';
import { request } from 'https';
import fs from 'fs';

const injectedPrefix = '/__injected__/';

(async () => {
  createServer((req, res) => {
    if (req.url?.startsWith(injectedPrefix)) {
      fs.createReadStream(`${__dirname}/injected/${req.url?.slice(injectedPrefix.length)}`, 'utf8')
        .pipe(res, { end: true });

      return;
    }

    const {
      Host, host,
      Referer, referer,
      ...headers
    } = req.headers;

    const proxy = request({
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
      if (actualRes.headers['content-type']?.startsWith('text/html')) {
        fs.createReadStream(`${__dirname}/index.html`, 'utf8')
          .pipe(res, { end: true });
      } else {
        res.writeHead(actualRes.statusCode!, actualRes.headers);
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
