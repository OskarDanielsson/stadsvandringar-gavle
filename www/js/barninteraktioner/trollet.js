$(function() {
    $('#instructions').trigger('play');
    $( "#slider" ).bind( "change", function(event, ui) {
        var size = $( "#slider" ).val();
        $("#troll").width(size+"%");
        $("#troll").height(size+"%");
        if (size < 23){
            $('#slider').slider({ disabled: true });
            $('#instructions').trigger('pause');
            parent.clearedInteraction();
    }
});

});