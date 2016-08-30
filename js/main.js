

$(function(){
   $( ".deck" ).deckard({
      direction: 'horizontal',
      responsivity: 1,
      startFromCard: 1
   });
});



//$(window).on('deckMoving', document, function(){
//   console.log(deckard.dragDirection);
//   var unit = Math.abs(deckard.distanceRatio);
//   console.log(unit);
//   $('.activeCard').css({
//      'opacity': (1 - unit)
//   });
//   if (deckard.dragDirection === 'forward') {
//      $('.nextCard').css({
//         'opacity': unit
//      });
//   } else {
//      $('.previousCard').css({
//         'opacity': unit
//      });
//   }
//});
//
//$(window).on('nextCard', document, function(){
//   $('.card').css('opacity','');
//});


//var newCardNo = 111;
//var evilInterval = setInterval(function(){
//   var $newCard = $('<div class="card">This is a new card: ' + newCardNo + '</div>');
//   newCardNo++;
//   deckard.deck.push($newCard);
//   deckard.updateDeck();
//},1000);