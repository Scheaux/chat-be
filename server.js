const http = require('http');
const Koa = require('koa');
const cors = require('@koa/cors');
const koaBody = require('koa-body');
const Router = require('koa-router');
const WS = require('ws');
const { v4 } = require('uuid');

const router = new Router();
const app = new Koa();
const port = process.env.PORT || 1733;
const server = http.createServer(app.callback());
const wsServer = new WS.Server({ server });

const messages = [];
let clients = [];

app.use(cors());
app.use(koaBody());
app.use(router.routes());
app.use(router.allowedMethods());

router.get('/messages', async (ctx, next) => {
  ctx.response.body = messages;
  await next();
});

router.get('/connections', async (ctx, next) => {
  ctx.response.body = clients;
  await next();
});

wsServer.on('connection', (ws) => {
  clients = [...wsServer.clients].filter((o) => o.readyState === WS.OPEN);
  ws.id = v4();

  ws.on('message', (msg) => {
    messages.push(JSON.parse(msg));
    clients.forEach((x) => x.send(JSON.parse(msg)));
  });

  ws.on('close', () => {
    clients = [...wsServer.clients].filter((o) => o.readyState === WS.OPEN);
  });
});

server.listen(port);
// app.listen(port);
// console.log(`listening on port: ${port}`);
