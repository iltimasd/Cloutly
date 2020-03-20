/*globals io drawGraph*/

// client-side js
// run by the browser each time your view template is loaded
var socket = io();
var d3data={links:[],nodes:[]}

// define variables that reference elements on our page
// const dreamsList = document.getElementById('dreams');
 const artistForm = document.forms[0];
 const formInput = artistForm.elements['artist'];

// a helper function that creates a list item for a given dream
// const appendNewDream = function(dream) {
//   const newListItem = document.createElement('li');
//   newListItem.innerHTML = dream;
//   dreamsList.appendChild(newListItem);
// }
$('.search').on('input', function() {
  socket.emit('typing',$(this).val())
});

// $('a').on("click",function(){
//   console.log('click')
//   console.log($(this).data('id'))
//   socket.emit('artistChoice',$(this).data('id'))
// })

//
// This onClick handler requires it to be delegated as the
// results are generated in the future.
//
  $('.results').on('click','a.artistResult',function(){
    socket.emit('artistChoice',$(this).data('id'))
  })

socket.on('updateList', function(data){
  //console.log(JSON.stringify(data))
  //console.log($('.results'))
  $('.results').html('')
  for(let idx=0;idx< data.length;idx++){
    $('.results').append(`<img class="artistImg" src="${data[idx].img}" />
                            <li><a href="#graph" class="artistResult" data-id="${data[idx].id}">
                              ${data[idx].artist}
                            </a></li>`)
    
  }
  //$('.results').append(JSON.stringify(data));
  
})
var deepCopy;
socket.on('linksAndNodes', function(obj){

   deepCopy =JSON.parse(JSON.stringify(obj));
  //from readyForTheFloor.js
  drawGraph(deepCopy)
  
})

socket.on('log',function(incoming){
  console.log(incoming);
})

// listen for the form to be submitted and add a new dream when it is
artistForm.onsubmit = function(event) {
  // stop our form submission from refreshing the page
  event.preventDefault();
  socket.emit('search',$('.search').val());
  // get dream value and add it to the list


};

socket.on('mssg',function(str){
          $('#log').html(str)
          })

socket.on('addTime',function(int){
  console.log(int,$('#timeEst').html())
          $('#timeEst').html(+($('#timeEst').html())+int);
          })
 var start;
socket.on('startTimer',function(){
   start = performance.now();
})

socket.on('stopTimer',function(){
  var stop = performance.now();
  console.log(stop-start)
})