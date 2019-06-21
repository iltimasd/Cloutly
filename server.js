// server.js
// where your node app starts

// init project
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const Bottleneck = require('bottleneck')
const limit = new Bottleneck({
    minTime:1000
})
const Discogs = require('disconnect').Client;
// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.
//let input = 'nirvana'
const db = new Discogs('TheseChainsProto/1.0', {
    consumerKey: process.env.DTOKEN, 
    consumerSecret: process.env.DSECRET
}).database();

// db.getArtist(159840, function(err, data){
// 	console.log(data);

function getAutofillList(input){
    return new Promise(function(resolve,rej){
        db.search(input,{type:'artist', per_page: 5 },function(err,data){
            
            resolve(data.results.map((item)=>(
                {
                    artist:item.title,
                    id:item.id,
                    img:item.cover_image
                }
                )
                ))
            })
        })
    }
    
    function getSearchList(input){
        return new Promise(function(resolve,rej){
            db.search(input,{type:'artist', per_page: 15 },function(err,data){
                resolve(data.results.map((item)=>(
                    {
                        artist:item.title,
                        id:item.id,
                        img:item.cover_image
                    }
                    )
                    ))
                })
            })
        }
        
        function getInfo(id){
            return new Promise(function(resolve,rej){
                db.getArtist(id,function(err,data){
                    resolve(data)
                })
            })
        }
        
        
        //this gets info from the band JSON
        // notes
        // this is a single call for basic info
        // this most likely is information that was called earlier?
        // could retrieve more complex data by passing data.members.id into getInfo()
        function getBandMembers(id){
            return new Promise(function(resolve,rej){
                db.getArtist(id,function(err,data){
                    resolve(data.members)
                })
            })
        }
        
        function getBands(id){
            return new Promise(function(resolve,rej){
                db.getArtist(id,function(err,data){
                    resolve(data.groups)
                })
            })
        }
        
        function insertBandInfo(combinedPromises){
            let idxObj=combinedPromises.length/2
            for(let idx=0; idx<idxObj;idx++){
                combinedPromises[idx].unshift(combinedPromises[idxObj])
                combinedPromises.splice(idxObj,1)
            }
        }
        
        // need to rewrite this
        // dirtly creating connection for first node withitself then deleting it
        
        function buildEdges(inputarray){
          
            let arrays=inputarray;
            let edges= arrays.map(function(array,i){
                
                return array.map(function(node,idx,arr){
                    return {"source":arr[0].id,"target":node.id}
                }).splice(1)
            })
            return [].concat(...edges)
        }
        
        function buildNodes(inputData){
            let tempArr=[].concat(...inputData)
            let uniqueNodes = Array.from(new Set(tempArr.map(a => a.id)))
            .map(id => {
                return tempArr.find(a => a.id === id)
            })
            
            return uniqueNodes
        }
        
        function getConnectionsFromPerson(id){
            return getBands(id)
            .then(function(bands){
                console.log(bands)
                let ids=bands.map(band=>band.id)
                console.log(ids)
                //below might be redundant
                let bandMemberPromises = ids.map(id=>getBandMembers(id))
                //console.log(bandMemberPromises)
                let bandInfoPromises = ids.map(id=>getInfo(id))
                //console.log(bandInfoPromises)
                return Promise.all([...bandMemberPromises,...bandInfoPromises])
                .then(function(d3data){
                    insertBandInfo(d3data)
                    let edgesObj=buildEdges(d3data);
                    
                    let nodesObj=buildNodes(d3data);
                    let compiledObj = {links:edgesObj,nodes:nodesObj}
                    //socket.compress(false).emit('connectionPacket',compiledObj)
                    return(compiledObj)
                })
            }).catch(function(error) {
                console.log(error);
            });
        }
        
        io.on('connection', function(socket){
            console.log('new connection')
            
            socket.on('disconnect', function(){
                console.log('a user disconnected');
            });
            
            socket.on('typing', function(value){
                //console.log(value)
                getAutofillList(value)
                .then(function(data){
                    //console.log(data)
                    socket.emit('updateList',data)
                })
            })
            
            socket.on('search', function(value){
                getSearchList(value)
                .then(function(data){
                    //console.log(data)
                    socket.emit('updateList',data)
                })
            })
            
            
            //sarah schmitt non-artist
            //hot chip band
            //dave grohl indivudiual with multiple bands
            //parliament band with many individuals
            //del tha funkee homosapian individual with bands not under main name
            
            //
            // TODO: refactor! theres a lot of data in initial api call. need to pass data down to reduce api calls
            //
            
            //TODO: CONVERT ARTIST FROM MEMEBER OBJECTS TO INFO OBJECTS (maybe, could be api call heavy)
            
            socket.on('artistChoice',function(id){
                console.log('received artist', id)
                getInfo(id).then(function(data){
                    if(Object.keys(data).includes('groups')){
                        if (Object.keys(data).includes('members')){
                            console.error('anomaly')
                        } else {
                            console.log('person')
                            return getConnectionsFromPerson(id)
                            
                        }
                    } else if (Object.keys(data).includes('members')){
                        console.log('band')
                        return getBandMembers(id)
                        .then( function(data){
                            return (data.map(members=>members.id))
                        }
                        ).then(function(ids){
                            let promises = ids.map(id=>getConnectionsFromPerson(id))
                            return Promise.all(promises)
                        }).then(function(arr){
                            let links=arr.map(obj=>obj.links)
                            let nodes=arr.map(obj=>obj.nodes)
                            console.log(links)
                            links = [].concat(...links)
                            nodes = [].concat(...nodes)
                            
                            let uniqueNodes = Array.from(new Set(nodes.map(a => a.id)))
                            .map(id => {
                                return nodes.find(a => a.id === id)
                            })
                            let uniqueLinks = Array.from(new Set(links.map(a => a.id)))
                            .map(id => {
                                return links.find(a => a.id === id)
                            })
                            
                            
                            
                            
                            
                            let compiledObj = {links:uniqueLinks,nodes:uniqueNodes}
                            //console.log(compiledObj,'CO');
                            return compiledObj
                        })
                    } else {
                        console.error('other')
                        console.warn(data)
                    }
                })
                .then(function(data){
                    
                    console.log(data,'final data')
                    socket.emit('linksAndNodes',data)
                })
            })
            
        })
        
        //console.log(getBandMembers('billie eilish'))
        // http://expressjs.com/en/starter/static-files.html
        app.use(express.static('public'));
        
        // http://expressjs.com/en/starter/basic-routing.html
        app.get('/', function(request, response) {
            response.sendFile(__dirname + '/views/index.html');
            //response.sendFile(__dirname + '/views/jquery-3.4.1.min.js');
        });
        
        
        
        server.listen(process.env.PORT, function(){
            console.log('listening on *:3000');
        });
        