// client-side js
// run by the browser each time your view template is loaded
var socket = io();
console.log('hello world :o');

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
  console.log($(this).val())
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
    console.log($(this).data('id'))
    socket.emit('artistChoice',$(this).data('id'))
  })


socket.on('updateList', function(data){
  //console.log(JSON.stringify(data))
  //console.log($('.results'))
  $('.results').html('')
  console.log(data)
  for(let idx=0;idx< data.length;idx++){
    console.log(data[idx])
    $('.results').append(`<img class="artistImg" src="${data[idx].img}" />
                            <li><a href="#" class="artistResult" data-id="${data[idx].id}">
                              ${data[idx].artist}
                            </a></li>`)
    
  }
  //$('.results').append(JSON.stringify(data));
  
})

// listen for the form to be submitted and add a new dream when it is
artistForm.onsubmit = function(event) {
  // stop our form submission from refreshing the page
  event.preventDefault();
   socket.emit('search',$('.search').val());
  // get dream value and add it to the list


};
