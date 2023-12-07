//INFO: user -> SeedIndex magnet

var ID=0;
var BROWSERS= {}

var onWsCx= (socket => {
	console.log("ws cx");
	let me= {s: socket, w: {} };
	BROWSERS['XXX']= me;
  socket.on('message', message => {
		const m= JSON.parse(message.toString('utf-8'));
		console.log(m);
		if (m.t= 'res') {
			let w= me.w[m.id];
			if (w) { 
				try {
					console.log("RES TRY",m.id)
					w.send(m.data); 
					console.log("RES OK",m.id)
				} catch(ex) {}
				delete me.w[m.id];
			}
		}
	});
});

onRoute= {}
onRoute['/p']= {
	method: 'all', 
	cb: (req, res, next) => {
		const b= BROWSERS['XXX'];
		if (b) {
			const id= ID++;
			b.s.send(JSON.stringify({t: 'req', id: id, data: {query: req.query, body: req.body, method: req.method, path: req.path}}));
			b.w[id]= res;
			console.log("W",id);
		}
		res.json([10,20]);
	},
};


// dwimer_start
// (src_snippet e "$DWIMER/node/express/prelude.js" <<EOC

const express = require('express');
const ws = require('ws');
const http = require('http');

const app = express();

const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

const server = http.createServer(app);
server.on('error', onError);
server.on('listening', onListening);

const server_ws = new ws.Server({ noServer: true });
server.on('upgrade', (request, socket, head) => {
  server_ws.handleUpgrade(request, socket, head, socket => {
    server_ws.emit('connection', socket, request);
  });
});

server.listen(port);

function normalizePort(val) {
  var port = parseInt(val, 10);
	if (isNaN(port)) {  return val; } //A: named pipe
	if (port >= 0) { return port; } //A: port number
  return false;
}

function onError(error) {
  if (error.syscall !== 'listen') { throw error; }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  console.log('Listening on ' + bind);
}

//A: listening http and ws

const setCacheControl = function (seconds) {
	seconds = seconds || 60 * 60 * 24 * 2; //CFG: en segundos 
	function next(req, res, next) {
		if (req.method == 'GET') { //A: solo para GET
			res.set('Cache-control', `public, max-age=${seconds}`)
		} else {
			res.set('Cache-control', `no-store`)
		}

		next(); //A: seguir procesando
	}
	return next;
}
app.use(setCacheControl(1))

app.use(express.json()) //A: parsing application/json
app.use(express.urlencoded({ extended: true })) //A: parsing application/x-www-form-urlencoded
//XXX: app.use(cookieParser());
app.all(/.*/, function(req, res, next) { //A: redirigir a www
	var desired_host= process.env.HOST;
	var desired_proto= process.env.PROTO || 'https';
  var host = req.header("host");
	//DBG: console.log('HOST req vs desired',host, desired_host, desired_proto, req.originalUrl); 
  if (!desired_host || host==desired_host) { next(); } 
	else { res.redirect(301, desired_proto+'://'+desired_host+req.originalUrl); }
});
app.use('/robots.txt', function (req, res, next) {
	res.type('text/plain')
	res.send(`User-agent: *
Allow: /
Sitemap: https://"+process.env.HOST+"/sitemap.xml
`);
});

//A: basic middleware

// EOC
// )
// dwimer_end


server_ws.on('connection', onWsCx);
Object.entries(onRoute).forEach( ([path, def]) => {
	app[def.method || 'get']( path , def.cb )
});


