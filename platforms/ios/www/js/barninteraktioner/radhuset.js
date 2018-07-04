$(function() {
  $(".correct").on("click", function(e){
    parent.clearedInteraction();
  });
    
    $('#instructions').trigger('play');
});