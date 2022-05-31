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
let messages = [
  '{"message":"first message","username":"user1","date":"12:00 12.12.2022"}',
  '{"message":"test","username":"user1","date":"12:00 12.12.2022"}',
  '{"message":"test","username":"user1","date":"12:00 12.12.2022"}',
  '{"message":"test","username":"user1","date":"12:00 12.12.2022"}',
  '{"message":"test","username":"user1","date":"12:00 12.12.2022"}',
  '{"message":"test","username":"user1","date":"12:00 12.12.2022"}',
  '{"message":"test","username":"user1","date":"12:00 12.12.2022"}',
  '{"message":"test","username":"user1","date":"12:00 12.12.2022"}',
  '{"message":"test","username":"user1","date":"12:00 12.12.2022"}',
  '{"message":"test","username":"user1","date":"12:00 12.12.2022"}',
  '{"message":"test","username":"user1","date":"12:00 12.12.2022"}',
  '{"message":"test","username":"user1","date":"12:00 12.12.2022"}',
  '{"message":"test","username":"user1","date":"12:00 12.12.2022"}',
  '{"message":"test","username":"user1","date":"12:00 12.12.2022"}',
  '{"message":"test","username":"user1","date":"12:00 12.12.2022"}',
  '{"message":"test","username":"user1","date":"12:00 12.12.2022"}',
  '{"message":"test","username":"user1","date":"12:00 12.12.2022"}',
  '{"message":"test","username":"user1","date":"12:00 12.12.2022"}',
  '{"message":"test","username":"user1","date":"12:00 12.12.2022"}',
  '{"message":"test","username":"user1","date":"12:00 12.12.2022"}',
  '{"message":"test","username":"user1","date":"12:00 12.12.2022"}',
  '{"message":"test","username":"user1","date":"12:00 12.12.2022"}',
  '{"message":"test","username":"user1","date":"12:00 12.12.2022"}',
  '{"message":"test","username":"user1","date":"12:00 12.12.2022"}',
  '{"message":"test","username":"user1","date":"12:00 12.12.2022"}',
  '{"message":"test","username":"user1","date":"12:00 12.12.2022"}',
  '{"message":"test","username":"user1","date":"12:00 12.12.2022"}',
  '{"message":"test","username":"user1","date":"12:00 12.12.2022"}',
  '{"message":"test","username":"user1","date":"12:00 12.12.2022"}',
  '{"message":"test","username":"user1","date":"12:00 12.12.2022"}',
  '{"message":"test","username":"user1","date":"12:00 12.12.2022"}',
  '{"message":"test","username":"user1","date":"12:00 12.12.2022"}',
  '{"message":"test","username":"user1","date":"12:00 12.12.2022"}',
  '{"message":"test","username":"user1","date":"12:00 12.12.2022"}',
  '{"message":"test","username":"user1","date":"12:00 12.12.2022"}',
  '{"message":"test","username":"user1","date":"12:00 12.12.2022"}',
  '{"message":"test","username":"user1","date":"12:00 12.12.2022"}',
  '{"message":"test","username":"user1","date":"12:00 12.12.2022"}',
  '{"message":"test","username":"user1","date":"12:00 12.12.2022"}',
  '{"message":"test","username":"user1","date":"12:00 12.12.2022"}',
  '{"message":"test","username":"user1","date":"12:00 12.12.2022"}',
  '{"message":"test","username":"user1","date":"12:00 12.12.2022"}',
  '{"message":"test","username":"user1","date":"12:00 12.12.2022"}',
  '{"message":"last message","username":"user1","date":"12:00 12.12.2022"}'
];

app.use(cors());
app.use(koaBody());
app.use(router.routes());
app.use(router.allowedMethods());

router.get('/connections', async (ctx, next) => {
  ctx.response.body = clients;
  await next();
});

router.get('/lazy/:count', async (ctx, next) => {
  const array = [];
  let counter = 0;
  const limit = +ctx.params.count;
  for (let i = messages.length - 1; i >= 0; i--) {
    if (counter === limit) break;
    array.push(messages[i]);
    counter++;
  }
  array.reverse();
  ctx.response.body = array;
  await next();
});

router.get('/messages', async (ctx, next) => {
  ctx.response.body = messages;
  console.log(messages);
  await next();
});

wsServer.on('connection', (ws, req) => {
  clients = [...wsServer.clients].filter((o) => o.readyState === WS.OPEN);
  ws.id = v4();
  // ws.username = req.headers['sec-websocket-protocol'];

  ws.on('message', (msg) => {
    if (!ws.username) {
      ws.username = JSON.parse(msg).username;
      return;
    }
    messages.push(msg.toString());
    clients.forEach((x) => x.send(msg.toString()));
  });

  ws.on('close', () => {
    clients = [...wsServer.clients].filter((o) => o.readyState === WS.OPEN);
  });
});

server.listen(port);
