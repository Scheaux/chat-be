const http = require('http');
const Koa = require('koa');
const cors = require('@koa/cors');
const koaBody = require('koa-body');
const Router = require('koa-router');
const WS = require('ws');

const router = new Router();
const app = new Koa();
const port = process.env.PORT || 1733;
const server = http.createServer(app.callback());
const wsServer = new WS.Server({ server });

let messages = [];
const clients = new Set();

app.use(cors());
app.use(koaBody());
app.use(router.routes());
app.use(router.allowedMethods());

router.get('/messages', async (ctx, next) => {
  ctx.response.body = messages;
  await next();
});

wsServer.on('connection', (ws) => {
  // const clients = Array.from(wsServer.clients).filter((o) => o.readyState === WS.OPEN);
  clients.add(ws);

  ws.on('message', (msg) => {
    messages.push(JSON.parse(msg));
    clients.forEach((x) => x.send(JSON.parse(msg)));
  });

  ws.on('close', () => {
    clients.delete(ws);
  });
});

server.listen(port);
// app.listen(port);
// console.log(`listening on port: ${port}`);
