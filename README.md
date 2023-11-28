# social_is_p2p

User controlled, descentralized, censorship resistant social networks and content distribution

A protocol and a client to provide a social network experience with files distributed throw (web)torrent, mail, etc.

* client: because WebTorrent is available and works great
* protocol: because we can use plain files as lists of links OR content 

Focus on the **protocol**, make it easy to implement with ANY transport (not only torrent)

First challenge: "a twitter-like experience", replace a PodemosAprender discord channel.

## Viewing content

* Mauricio gets Mario's SeedLink via QR in a face to face meeting (or mail, Signal, whatsapp, blog, etc.)
* Mauricio goes to ANY web site where TheViewer is hosted (it's just html and js)
* Mauricio pastes Mario's SeedLink
* TheViewer downloads Mario's SeedIndex with more links to
   * friends (people Mario follows)
   * Mario's videos, articles, etc.
   * Mario's "chats", "likes", etc.

NOTICE Mario doesn't need a web site, server, etc. THIS makes publishing accessible and censorship resistant
. Running a torrent node in a computer OR browser tab is enough to publish.

NOTICE TheViewer is just html and a readable=safe javascript file, so it can be mirrored in a lot of web sites by any supporter of the system. NO CONTENT is tied to TheViewer so there is no risk of legal side effects. Of course TheViewer can also be encapsulated with Electron, etc. or replaced by other implementations. XXX:LEGAL 

NOTICE TheViewer only exists to make content accessible and attractive to non-tech users, TheProtocol is enough to access all the functionality just using any torrent or http client.

## Publishing content

TheClient also allows

* Commenting on videos, TwitterLikeChats, etc.
* Tagging SeedKeys as "friend", "follow", "block", etc.
* Uploading files, recording from the microphone, screen, etc. (existing browser APIs)

"publishing" is just generating a new SeedIndex, signing with your SeedKey and sharing the new SeedLink

NOTICE UserIdentity is based on Private/Public keys so when I get a SeedLink for Mario, I can check whether the SeedIndex is signed by Mario's PublicKeys.

NOTICE you may get SeedLinks from chat, the web, etc. BUT ALSO from people you follow's, friends', etc. SeedIndex es. This builds the network through FriendsOfFriends without requiring public servers.

## Persistence

Only a browser is required, modern browsers provide a persistence API through File, localStorage, etc.
This data is restricted to whe domain where it was downloaded BUT we can provide a backup/restore method just generating and downloading a json file. This json file may also work as a SeedIndex like GenesisBlocks on the blockchain.

NOTICE curators may share SeedIndex files e.g. to get people started on some community, language, subject, etc. eg PingPong videos, players, chats, etc.


## SeedIndex

See `data_ex`
* Mario.seedIndex.20231003.json
* Mauricio.seedIndex.20231004.json

NOTICE: there are common keys on both SeedIndex.es, TheViewer should perform TheMerge to show a third user the union of all keys leaving only the latest of the versions correctly signed by the PublicKeys.

## Chats

There is a reference in the SeedIndex for the chats I'am following.

Each chat has a link (magnet) to a file with ALL the conversation, ALL the messages, etc.

* data_ex/Mario.chat.1882-1212-4444.json
* data_ex/Mario.chat.9892-1212-3333.json

NOTICE we want to enable chats for videos, etc. like comments on youtube

NOTICE we may want to include initiator and date in the ChatId to skip most without downloading the actual conversation.

## TheDiscovery

Including data from other sources in MY seed index helps my followers discover new friends, content, etc.

Crawlers, indexers, etc can be built on this data too.

The only LIMIT is the cost on TheMerge to consolidate data imposed on TheViewer 

SeedIndex.es don't need to include obsolete data, we can simple add a section for archived content eg. links to SeedIndex.es from previous days, weeks, etc.

## TheReplication

TheViewer shows an option to "pin"=automatically download and share the content from people I follow.

We may have too levels: 1. download and share everything, 2. only the SeedIndex.
