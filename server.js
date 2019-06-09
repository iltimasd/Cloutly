// server.js
// where your node app starts

// init project
const express = require('express');
const app = express();
const Discogs = require('disconnect').Client;
// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.
//let input = 'nirvana'
const db = new Discogs('CloutlyGlitchProto/1.0', {
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

function getInput(){}

getAutofillList('nirv').then(data=>console.log(data))

function getBandMembers(input){
  return new Promise(function(resolve,rej){
    db.search(input,{type:'artist'},function(err,data){
  //console.log('search',data.results[0]);
  let id= data.results[0].id;
  db.getArtist(id,function(err,data){
    console.log(data)
    resolve(data.members)
    
  })
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


//console.log(getBandMembers('nirvana'))
// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function(request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
