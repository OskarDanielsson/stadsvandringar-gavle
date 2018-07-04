$(function() {
    $('#instructions').trigger('play');
    $(getTime()).on("tap", function(e){
    parent.clearedInteraction();
  });
});

function getTime(){
    var date = new Date();
    var hour = date.getHours();
    var minutes = date.getMinutes();
    if (minutes > 30){
        hour++;
    }
    if (hour > 12){
        hour = hour-12;
    }
    return "#" + hour;
}
