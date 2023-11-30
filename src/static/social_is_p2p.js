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
torrent_start();

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

console.log("social_is_p2p loaded")
