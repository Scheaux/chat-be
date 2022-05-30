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

let clients = [];
let messages = [];

app.use(cors());
app.use(koaBody());
app.use(router.routes());
app.use(router.allowedMethods());

router.get('/connections', async (ctx, next) => {
  ctx.response.body = clients;
  await next();
});

router.get('/messages', async (ctx, next) => {
  const parsed = messages.map(x => x.toString());
  ctx.response.body = parsed;
  await next();
});

wsServer.on('connection', (ws, req) => {
  clients = [...wsServer.clients].filter((o) => o.readyState === WS.OPEN);
  ws.id = v4();
  // ws.username = req.headers['sec-websocket-protocol'];

  ws.on('message', (msg) => {
    messages.push(msg);
    if (!ws.username) ws.username = JSON.parse(msg).username;
    clients.forEach((x) => x.send(msg.toString()));
  });

  ws.on('close', () => {
    clients = [...wsServer.clients].filter((o) => o.readyState === WS.OPEN);
  });
});

server.listen(port);
