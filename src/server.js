//INFO: user -> SeedIndex magnet

onRoute= {}

//S: user -> SeedIndex magnet {
//U: curl -X PUT http://localhost:3000/seedindex/mau -H 'content-type: application/json' --data '{"magnet": "magnet:2819829"}'
//U: curlhttp://localhost:3000/seedindex/all

const User2SeedIndex_MAX= 100;
const MAGNET_LENGTH_MAX=2000;

var User2SeedIndex= {}
onRoute['/seedindex/all']= {
	method: 'get',
	cb: (req, res, next) => { res.json( User2SeedIndex ) }
}

onRoute['/seedindex/:user']= {
	method: 'get',
	cb: (req, res, next) => { res.json( User2SeedIndex[ req.params.user ] || 'NA' ) }
}

onRoute['/seedindex/:user']= {
	method: 'put',
	cb: (req, res, next) => { 
		let wasRegistered= User2SeedIndex[ req.params.user ];
		let canBeAdded= () => (Object.keys( User2SeedIndex ).length < User2SeedIndex_MAX);
		let sts= "ERROR"; //DFLT
		if (wasRegistered || canBeAdded() ) {
			User2SeedIndex[ req.params.user ]= (req.body.magnet+'').slice(0,MAGNET_LENGTH_MAX);
			sts="OK";
		} 
		res.json({status: sts});
	}
}

//S: user -> SeedIndex magnet }



//S: proxy http -> ws XXX:agregar WebRtp {
var ID=0;
var BROWSER_ID=0;
var BROWSERS= {}

var onWsCx= (socket => {
	let myId= BROWSER_ID++;
	console.log("ws cx", myId, socket);
	let me= {id: myId, s: socket, w: {} };
	BROWSERS[myId]= me;

	function onCxEnd(err) {
		console.log("WS CLOSE",myId, err);
		delete BROWSERS[myId];
	}

	socket.on('error', onCxEnd);
	socket.on('close', onCxEnd);

  socket.on('message', message => {
		const m= JSON.parse(message.toString('utf-8'));
		console.log("WS MSG", m);
		if (m.t= 'res') { //A: an http req was waiting for res
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

onRoute['/p/:peerId']= { //SEE: http://expressjs.com/en/guide/routing.html#route-parameters
	method: 'all', 
	cb: (req, res, next) => {
		const peerId= req.params.peerId;
		const b= BROWSERS[peerId];
		if (b) { //A: there is a peer with this ID that may answer
			const id= ID++;
			b.s.send(JSON.stringify({t: 'req', id: id, data: {query: req.query, body: req.body, method: req.method, path: req.path}}));
			b.w[id]= res;
			console.log("W",id);
		} else {
			res.status(501).send(`No peer with id ${peerId}`).end();
		}
	},
};

//S: proxy http -> ws XXX:agregar WebRtp }

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

//SEE: https://github.com/websockets/ws/blob/master/doc/ws.md
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

app.use(express.json({ //A: parsing application/json
  type: 'application/json',
  strict: true,
  inflate: true,
	limit: '100kb', //XXX:CFG
  reviver: null, 
  verify: undefined
}))

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

//SEE: https://expressjs.com/en/starter/static-files.html
app.use(express.static(__dirname+'/static'))

//A: basic middleware

// EOC
// )
// dwimer_end


server_ws.on('connection', onWsCx);
Object.entries(onRoute).forEach( ([path, def]) => {
	app[def.method || 'get']( path , def.cb )
});


