//INFO: the full social_is_p2p client in a single plain old js file

MyKey= "0x333333"; //TODO:generate or load and share

//S: storage abstraction
function store_seedIndex_get() {
	let si_txt= localStorage.getItem("SeedIndex");
	let si= si_txt ? JSON.parse(si_txt) : { MyKey, content: {} }; //TODO:defaults
	return si;
}

function store_seedIndex_set(si) {
	localStorage.setItem("SeedIndex", JSON.stringify(si));
	return si;
}

//S: SeedIndex and discovery
function seedIndex_add(title, link) {
	let si= store_seedIndex_get();
	si.content[MyKey]= si.content[MyKey] || {}
	si.content[MyKey][title]= {
		"link": link,
		"updated": new Date().toISOString(), 
		"type": "text",  //TODO
		"comments": "9892-1212-2222" , //TODO:
	}
	return store_seedIndex_set(si);
}

//S: torrent helpers
TorrentClient= null;
function torrent_start() {
	TorrentClient= new WebTorrent()
	TorrentClient.on('error', function (err) {
		console.error('ERROR: torrent' + err.message) //TODO:custom handler
		window.log && log('ERROR: torrent' + err.message) //TODO:custom handler
	})
}
window.WebTorrent && torrent_start();

function torrent_seed_text(title, text) {
	let content= [ new Blob([ text ], {type: 'text/plain'}) ]
	return new Promise( (accept, reject) => {
		TorrentClient.seed(content, null, (torrent) => accept(torrent) )
	}); //TODO:ERROR
}

//S: publish files, add to SeedIndex
async function publish_text(title, text) {
	return await torrent_seed_text(title, text); 
}

//S: ws {
saludo="Hola";

host= location.host;
ws= new WebSocket('ws://'+host+'/')
ws.onopen = (ev) => {
	ws.send(JSON.stringify({t:"cx ok"}));
	console.log("cx ok");
};
ws.onmessage= (ev) => {
	console.log("M",ev.data);
	d= JSON.parse(ev.data)
	ws.send(JSON.stringify({t:'res', id: d.id, data: saludo+' '+new Date()+''}));
}
// }

//============================================================
//S: alpine {
//SEE: https://alpinejs.dev/globals/alpine-data
let AppUI= {
	msg: '',
	async post() { 
		console.log("POST", this.msg);
		let post_torrent= await publish_text("mi post", this.msg);
		let si= seedIndex_add("mi post", post_torrent.magnetURI);
		let si_torrent= await publish_text("seedIndex", JSON.stringify(si, null,2));
		let pub_res= await fetch('//'+host+'/seedindex/mau', {
			method: 'PUT', headers: {'content-type': 'application/json'}, 
			body: JSON.stringify({magnet: si_torrent.magnetURI}),
		}).then(res => res.text());
		console.log("PUB RES", pub_res);
	},
}

function init_alpine() {
	console.log("init_alpine 0");
	try { Alpine.data('appui', () => (AppUI)) } catch (ex) { console.error("init_alpine ERROR", ex) }
	console.log("init_alpine OK");
}

document.addEventListener('alpine:init', init_alpine);
//S: alpine }

console.log("social_is_p2p loaded")
