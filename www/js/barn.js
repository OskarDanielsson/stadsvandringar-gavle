
var map;
var globalStopList = [];
var hike;
var audioFile = "";
var isPlaying = false;
var media;
var watchID;
var currentStop = "";
var viewportWidth = $( document ).width();
var currentPosition;
var mySwiper = new Swiper ('.swiper-container', {
    initialSlide: 0,
    direction: 'horizontal',
    loop: false,
    observer: true,  
    pagination: '.swiper-pagination',
    nextButton: '.swiper-button-next',
    prevButton: '.swiper-button-prev',
    height: 400,
    width: viewportWidth });


document.addEventListener("deviceready", onDeviceReady, false);
function onDeviceReady() {

    loadHike(function( nHike ){
        hike = nHike;
        positionListener();
        var div = document.getElementById( "map_canvas" );

        // Initialize the map view
        map = plugin.google.maps.Map.getMap(div);
        
        // Wait until the map is ready, then go to onMapReady.
        map.addEventListener(plugin.google.maps.event.MAP_READY, onMapReady);  
    });
    
    /* --- Eventlisteners --- */
    
    
    $(document).on( "backbutton", onBackKeyDown );
    
    /* Pauses the audio if the app is out of focus */
    
    /*document.addEventListener("pause", function(){
        $( ".audioPlayer" ).trigger( "pause" );
    }, false); */
    
    /* Hides stop content if it is currently visible */
    $( "#back" ).on("tap", function(e){
        e.preventDefault();
        if ($( "#interaction-frame" ).is(':visible')){
            $( "#interaction-frame" ).slideToggle();
            $( "#interaction-frame" ).attr("src", "");
        } else if($( "#stop-content" ).is(':visible')){
            $( ".audioPlayer" ).trigger( "pause" );
            $( "#stop-content" ).slideUp( "slow" );   
        } else {
            $( "#back-modal" ).modal( "toggle" );
        }
        if ( $( "#cleared-interaction" ).is(':visible') ){
            $( "#cleared-interaction" ).hide();
        }
    });
    
    /* Sets endCredits to true so index.html knows when to show the credits. */
    $( "#back-modal-confirm" ).on("tap", function(e){
        $( "#back-modal" ).modal( "hide" );
        $( ".header div" ).css( "display","none" );
        $( ".header" ).css({ "background-color" : "#693065"});
        $("#post-hike-page").show();
        //localStorage.endCredits = true;    
    });

    /* Shows content when tapped */
    $( "#show-content-button" ).on("tap", function(e){
        e.preventDefault();
        $( "#show-content-card" ).slideToggle();
        showContent(currentStop);
        
    });
    $( "#skip-button" ).on("tap", function(e){
        e.preventDefault();
        $( "#show-content-card" ).slideToggle();    
    });
    
    $( "#start-interaction" ).on("tap", function(e){
        e.preventDefault();
        $( "#interaction-frame" ).attr("src", "assets/interaktioner/" + currentStop.id + "-interaction.html");
        $( ".audioPlayer" ).trigger("pause");
        $( "#stop-content" ).slideToggle( "slow" );
        $( "#interaction-frame" ).slideToggle();    
    });
    
    $( "#cleared-interaction" ).on("tap", function(e){
        e.preventDefault();
        $( "#stop-content" ).slideUp( "slow" );
        $( ".audioPlayer" ).trigger( "pause" );
        $( "#cleared-interaction" ).hide();
    });
    

}

    /* --- Interaction Functions --- */


function clearedInteraction(){
    $( "#cleared-interaction" ).show();
    mySwiper.removeAllSlides();
    mySwiper.update();
    $( "#stop-text h2" ).text("Jippii!");
    $( "#stop-text p" ).text(currentStop.clearedText);
    $( "#start-interaction" ).hide();
    mySwiper.appendSlide('<div class="swiper-slide flex column justify-center"><img class="assets" src="' + localStorage.directory + currentStop.assets[1] + '" alt="Hej"></div>');
    mySwiper.update();
    mySwiper.slideTo(1);
    $( "#play-container" ).html('<div class="audioPlayer-wrapper"><audio class="audioPlayer" controls><source src="'+ localStorage.directory + currentStop.clearedSound +'" type="audio/mpeg"></audio><div class="closeAudioBtn" onclick="stopAndCloseAudio();"></div></div>');
    $( "#interaction-frame" ).slideToggle();
    $( "#stop-content" ).slideToggle( "slow" );
    $(".audioPlayer").trigger('play');
    }








/* Map Functions */


    function onMapReady() {
        console.log("MapReady!");
        const START = new plugin.google.maps.LatLng( hike.startPosition[0],hike.startPosition[1] );
        
        map.setOptions({
            'controls' : 
            {
            'myLocation': true, 
            'myLocationButton': true
            },
            'camera' : {
                'latLng': START, 
                'zoom' : 16       
                       },
            'gestures':{
                rotate: false
            }
        });
        // Place the stops on the map
        createHike();
    }
    

    
    function positionListener(){ 
        watchID = navigator.geolocation.watchPosition( function(position){
            setTimeout( function(){
                currentPosition = new plugin.google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                for ( var i=0 ; i < hike.stops.length ; i++ ) {
                    
                    if( hike.stops[i].bounds.contains(currentPosition) && hike.stops[i] !== currentStop ){
                        console.log("at stop");
                        currentStop = hike.stops[i];
                        $("#show-content-heading").html(hike.stops[i].name);
                        //map.setClickable( false );
                        $("#show-content-card").slideDown();
                    }
                }
            }, 2000);
        }, fsError, { timeout: 60000, enableHighAccuracy: true });
        
    }
    
    function clearPositionListener(){
        navigator.geolocation.clearWatch(watchID);
    }
    
    


function onBackKeyDown() {
    if ($( "#interaction-frame" ).is(':visible')){
        $( "#interaction-frame" ).slideToggle();
        $( "#interaction-frame" ).attr("src", "");
    } else if($( "#stop-content" ).is( ':visible' ) ){
            $( "#stop-content" ).slideToggle( "slow" );
            $( ".audioPlayer" ).trigger("pause");
            $( "#cleared-interaction" ).hide(); 
    } else {
        $( "#back-modal" ).modal( "toggle" );
    }
}


function fsError(e){
    console.log(e.name, e.code);
}


function Hike(id, name, startPosition, stopList, overlay, overlayPosition){
    this.id = id;
    this.name = name;
    this.startPosition = startPosition;
    this.stops = stopList;
    this.overlay = overlay;
    this.overlayPosition = overlayPosition;
}

function Stop(id, name, position, bounds, assets, text, clearedText, sound, clearedSound){
    this.id = id;
    this.name = name;
    this.position = position;
    this.assets = assets;
    this.text = text;
    this.clearedText = clearedText;
    this.sound = sound;
    this.clearedSound = clearedSound;
    this.bounds = bounds;
}

    
function createHike(){
    var tUrl = localStorage.directory + hike.overlay;   
    var tBounds = hike.overlayPosition;
    map.addGroundOverlay({
        'url' : tUrl,
        'bounds' : tBounds
        }, function(groundOverlay) {});     
    
    
    for ( var i=0; i < hike.stops.length; i++ ){
        var STOP = new createStop( hike.stops[i] );
        globalStopList.push( STOP );
    }
    
}
    
function createStop(lStop){
    var name = lStop.name;
    this.url = localStorage.directory + lStop.id + "_image.png";
    this.stopID = lStop.id;
    
   
    map.addGroundOverlay({
        'url' : this.url,
        'bounds' : lStop.position,
        'zIndex' : 2
        }, function(groundOverlay) {
            /* Man kan klicka på stoppet man är på */
            groundOverlay.on(plugin.google.maps.event.OVERLAY_CLICK, function(overlay, latLng) {
            if ( /*lStop.id == 1 || lStop.id == 2 || lStop.id == 3 || */lStop == currentStop){    
                if( $( "#show-content-card" ).is( ":visible" ) ){
                   $( "#show-content-card" ).slideUp();
                    showContent(lStop);
                } else { showContent(lStop); }
            }
            
            });
            
        });
   
}

// Barnvandring special. Visa endast första bilden. Andra bilden går till clearedInteraction()
function showContent(lStop){
    $( "#start-interaction" ).show();
    mySwiper.removeAllSlides();
    mySwiper.update();
    $( "#stop-text h2" ).text(lStop.name);
    $( "#stop-text p" ).text(lStop.text);
    mySwiper.appendSlide('<div class="swiper-slide flex column justify-center"><img class="assets" src="' + localStorage.directory + lStop.assets[0] +'" alt="' + lStop.assets[0] + '"></div>');
    mySwiper.update();
    mySwiper.slideTo(1);
    if (lStop.sound != ""){
    audioFile = localStorage.directory + lStop.sound;
    $( "#play-container" ).html('<div class="audioPlayer-wrapper"><audio class="audioPlayer" controls><source src="'+ audioFile +'" type="audio/mpeg"></audio><div class="closeAudioBtn" onclick="stopAndCloseAudio();"></div></div>');
 $(".audioPlayer").trigger('play');
    }
    setTimeout(function(){$( "#stop-content" ).slideDown( "slow" );}, 300);
    mySwiper.update();
    //audioFile = localStorage.directory + lStop.sound;
} 
    

    
function loadHike(cb){
    $.getJSON( "js/"+localStorage.vandring+".json" ).done(function( data ) { 
        var id = data["id"];
        var name = data["name"];
        var startPosition = data["startPosition"];
        var overlay = data["overlay"];
        var overlayPosition = [new plugin.google.maps.LatLng( data["overlayPosition"][0][0], data["overlayPosition"][0][1]) , new plugin.google.maps.LatLng( data["overlayPosition"][1][0], data["overlayPosition"][1][1] )];
        var stopList = [];
        var stop = data["stopList"];
        
        for(var i = 0; i < stop.length; i++){
            var cStop = stop[i];
            var stopId = cStop["id"];
            var stopName = cStop["name"];
            var stopPosition = [new plugin.google.maps.LatLng(cStop["position"][0][0], cStop["position"][0][1]), new plugin.google.maps.LatLng(cStop["position"][1][0], cStop["position"][1][1])];
            var nWLat = cStop["position"][0][0];
            var nWLong = cStop["position"][0][1];
            var sELat = cStop["position"][1][0];
            var sELong = cStop["position"][1][1];
            var boundsPositions = [new plugin.google.maps.LatLng(nWLat, nWLong), new plugin.google.maps.LatLng(sELat, sELong)];
            var bounds = new plugin.google.maps.LatLngBounds(boundsPositions);
            var stopAssets = cStop["assets"];
            var stopTextArray = cStop["text"];
            var stopText = stopTextArray[localStorage.language][0];
            var clearedText = stopTextArray[localStorage.language][1];
            var stopSound = cStop["sound"][0];
            var clearedSound = cStop["sound"][1];
            var nStop = new Stop(stopId, stopName, stopPosition, bounds, stopAssets, stopText, clearedText, stopSound, clearedSound);
            stopList.push(nStop);
            
        }
       var nHike = new Hike( id, name, startPosition, stopList, overlay, overlayPosition );
        cb(nHike);
    }).fail( function( e ){
        console.log(e);
    } );
}


