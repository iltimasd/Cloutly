// server.js
// where your node app starts

// init project
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

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
      }
               )
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
      }
      )
   })
}

function getInfo(id){
  return new Promise(function(resolve,rej){
    db.getArtist(id,function(err,data){
      resolve(data)
    })
  })
}

//getAutofillList('billie eilish').then(data=>console.log(data))

function getBandMembers(id){
  return new Promise(function(resolve,rej){
  
  db.getArtist(id,function(err,data){
    console.log(data)
    resolve(data.members)
    
  })
})
}

function getBands(id){
  return new Promise(function(resolve,rej){
    db.getArtist(id,function(err,data){
    console.log(data)
    resolve(data.groups)
  })
  })
}
/*
getBandMembers('hot chip').then(function(memberArr){
  console.log('promise',memberArr)
  for(let obj in memberArr){
    
  }
})
*/


 //console.log(getBandMembers('billie eilish'))
// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function(request, response) {
  response.sendFile(__dirname + '/views/index.html');
  //response.sendFile(__dirname + '/views/jquery-3.4.1.min.js');
});

io.on('connection', function(socket){
  console.log('new connection')
  socket.on('disconnect', function(){
    console.log('a user disconnected');
  });
  
  socket.on('typing', function(value){
    console.log(value)
    getAutofillList(value)
      .then(function(data){
      console.log(data)
      socket.emit('updateList',data)
    })
  })
  
  socket.on('search', function(value){
    getSearchList(value)
      .then(function(data){
      console.log(data)
      socket.emit('updateList',data)
    })
  })
  
  socket.on('artistChoice',function(id){
    console.log('received artist', id)
    getInfo(id).then(function(data){
      console.log(data)
      if(Object.keys(data).includes('groups')){
        if (Object.keys(data).includes('members')){
        console.error('anomaly')
        } else {
        console.log('person')
          return getBands(id)
        }
      } else if (Object.keys(data).includes('members')){
        console.log('band')
        return getBandMembers(id)
      } else {
        console.error('other')
      }
    })
    .then(data=>console.log('promise chained!',data))
  })
})

server.listen(process.env.PORT, function(){
  console.log('listening on *:3000');
});
// listen for requests :)
// const listener = app.listen(process.env.PORT, function() {
//   console.log('Your app is listening on port ' + listener.address().port);
// });