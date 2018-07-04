
var globals = {};
globals.checkedServer = false;
globals.assetSubDir = {barn : "barn", historisk : "historisk"};
globals.assetServer = {barn: "http://app.hariett.se/stadsvandring/barn/assets.json", historisk: "http://app.hariett.se/stadsvandring/historisk/assets.json"}
globals.assetDirectory = {};
globals.assetDirectoryURL = {};
globals.assets = {};
globals.resLength = {};
localStorage.vandring = "";
localStorage.language = "sv";

var showChar = 900;  // How many characters are shown by default
var ellipsestext = "...";
var moretext = "Show more >";
var lesstext = "Show less";

// Säger vilken vandring som ska tas bort
var deleteTourAssets;
console.log("What even is this.");

document.addEventListener("deviceready", onDeviceReady, false);
function onDeviceReady() {

    cordova.plugins.diagnostic.requestLocationAuthorization(function(status){
            console.log("Successfully requested location authorization: authorization was " + status);
        }, function(error){
        console.error(error);
    });

    if ( device.platform == "iOS" ){
        StatusBar.styleLightContent();
    }

    console.log(localStorage.vandring);
    /* Kollar om det finns en assets-folder. Om inte så skapas en. */
    checkAssets("historisk");
    /* Kollar om det finns en assets-folder. Om inte så skapas en. */
    checkAssets("barn");
    setAllResLengths();
    /*console.log("globals.assetDirectory",globals.assetDirectory);
    console.log("globals.assetDirectoryURL",globals.assetDirectoryURL);
    console.log("globals.assets",globals.assets);
    console.log("globals.resLength",globals.resLength);
    console.log("localStorage.vandring",localStorage.vandring); */


    // När man klickar på Gå vandring på sponsor/nedladdningssidan så går man till vandringen.
    $("#sponsor-to-map").on("tap", function(e){
        e.preventDefault();
        console.log(localStorage.vandring);
        localStorage.directory = globals.assetDirectoryURL[localStorage.vandring];
        console.log(localStorage.directory);
        try{
            window.open(localStorage.vandring + ".html");
            console.log("wat");
        } catch(err){
            console.log(err.message);
        }
    });


    $(document).on( "backbutton", onBackKeyDown );



    $("#load-indicator").on("assetDownloadListener", function(){
        console.log(globals.assets[localStorage.vandring].length + " / " + globals.resLength[localStorage.vandring] + " Downloaded");


        $( "#download-progress" ).html("<div class='card'><div class='card-main'><div class='card-inner'><p>" + globals.assets[localStorage.vandring].length + " / " + globals.resLength[localStorage.vandring] + " resurser nedladdade</p></div></div></div>");
        if ( globals.assets[localStorage.vandring].length == globals.resLength[localStorage.vandring] ){
            console.log("assetDownloadListener Done!");
            $( this ).addClass("el-loading-done");
        }
    });


    $("#post-hike-back").on("tap", function(e){
        e.preventDefault();
        $("#post-hike-page").hide();
    });

    $("#credits-back").on("tap", function(e){
        e.preventDefault();
        $("#credits-page").hide();
    });

    $("#credits-button").on("tap", function(e){
        e.preventDefault();
        $("#credits-page").show();
        $('html,body').scrollTop(0);
    });

    $("#sponsor-back").on("tap", function(e){
        e.preventDefault();
        hideSponsors();
    });


    $("#historisk").on("tap", function(e){
        e.preventDefault();
        /* Om det inte finns några assets så laddas de ned */
        console.log("Hello there!");
        localStorage.vandring = "historisk";
        if(globals.assets["historisk"].length !== globals.resLength["historisk"]){
            $("#download-sponsor-page").show();
            $('html,body').scrollTop(0);
            downloadAssets("historisk");
        } else {
            $("#download-sponsor-page").show();
            $('html,body').scrollTop(0);
            $("#load-indicator").addClass("el-loading-done");
        }
    });

    $("#barn").on("vclick", function(e){
        e.preventDefault();
        /* Om det inte finns några assets så laddas de ned */
        localStorage.vandring = "barn";
        console.log("assets.length", globals.assets["barn"].length);
        if(globals.assets["barn"].length !== globals.resLength["barn"]){
            $("#download-sponsor-page").show();
            $('html,body').scrollTop(0);
            downloadAssets("barn");
        } else {
            $("#download-sponsor-page").show();
            $('html,body').scrollTop(0);
            $("#load-indicator").addClass("el-loading-done");
            }
    });

    $(".delete-button").on("tap", function(){
        deleteTourAssets = this.id.slice(7,this.id.length);
        console.log("Reached delete-button. deleteTourAssets: ", deleteTourAssets);
    });

    $("#delete-assets").on("tap", function(){
        console.log("Delete Assets", deleteTourAssets);
        deleteAssets( deleteTourAssets );
    });

}

function mSuccess(){console.log("mSuccess!");}

function fsError(e){
    console.log(e);
}


// Functions

function showSponsors( iAD ){
    /*if(iAD){
    window.setTimeout(function(){
        $("#load-indicator").addClass("el-loading-done");
    }, 1000);
    }*/
    $("#download-sponsor-page").show();


}

function hideSponsors(){
    window.setTimeout(function(){
        $("#download-sponsor-page").hide();
        $("#load-indicator").removeClass("el-loading-done");
    },500);
}



function downloadAssets( vandring ){
    console.log("Reached DownloadAssets");
    $.get(globals.assetServer[vandring]).done(function( res ) {
        $("#load-indicator").trigger( "assetDownloadListener" );
        /* Denna sänds sent. Promise? */
        console.log("Found in server: ", res);

        for(var i=0, len=res.length; i<len; i++){
            // Tar ut filnamnet från url:en
            var file = res[i].split("/").pop();
            var haveIt = false;

            // Kolla i assets om filen redan finns.
            for(var k=0; k<globals.assets[vandring].length; k++){
                if(globals.assets[vandring][k].name === file){
                    console.log("we already have file " +file);
                    haveIt = true;
                    break;
                }
            }
            // Hämta filen om den inte redan finns.
            if(!haveIt) {fetch(res[i], vandring);}

        }
    }).fail(fsError);
}

function setAllResLengths(){
    console.log("setAllResLengths");
    for (x in globals.assetServer){
        setResLength(x);
    }
}

function setResLength( vandring ){
    $.get(globals.assetServer[vandring]).done(function( res ) {
        console.log("Reslength set!", vandring);
        globals.resLength[vandring] = res.length;
    }).fail(fsError);
}


function checkAssets( vandring ){
    console.log("CheckAssets Vandring: " + vandring);
    var assetReader = getAssets( vandring );
    assetReader.done(function(results){
        if(results.length === 0) {
            console.log("No assets");
        } else {
            console.log("Got assets!");
        }
    });
}


/* Gå till getAssets när man valt en vandring. Om assets finns, starta vandringen. Visa annars Ladda ned vandring. */
function getAssets( vandring ){
    var def = $.Deferred();
    /* Kollar om vi redan skapat  */
    if(globals.assets[vandring]){
        console.log("returning cached assets");
        def.resolve(globals.assets[vandring]);
        return def.promise();
    }

    /* Getting main directory, should move this out of getAssets so it can be
    found in download assets and delete assets without having to go here first. */

    var dirEntry = window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(dir){
        console.log("got main dir",dir);
        console.log("vandring", vandring);
        console.log("assetSubDir", globals.assetSubDir);
        // Creating subdir "assets"
        dir.getDirectory(globals.assetSubDir[vandring]+"/", {create:true}, function(aDir) {
            console.log("got assets directory", aDir);

            var reader = aDir.createReader();
            reader.readEntries(function(results){
                console.log("in read entries result", results.length);
                globals.assets[vandring] = results;
                def.resolve(results);
            });

            // Global variable for the asset directory
            globals.assetDirectory[vandring] = aDir;
            globals.assetDirectoryURL[vandring] = aDir.toURL();
        }, fsError);

    }, fsError);

    return def.promise();
}

function fetch(url, vandring) {
    console.log("fetch url", url);
    var localFileName = url.split("/").pop();
    var localFileURL = globals.assetDirectory[vandring].toURL() + localFileName;
    console.log("fetch to "+localFileURL);
    var ft = new FileTransfer();
    ft.download(url, localFileURL, function(entry){
        console.log("In FileTransfer");
        globals.assets[vandring].push(entry);
        $("#load-indicator").trigger( "assetDownloadListener" );
    }, function(error) {
        console.log("download error source " + error.source);
        console.log("download error target " + error.target);
        console.log("upload error code" + error.code);
    });
}

/* fileEntry.remove() can be used on separate files in assetDirectory or the whole directory */
function deleteAssets( vandring ) {
    console.log(globals.assets, "Assets");
    var aReader = globals.assetDirectory[vandring].createReader();
    aReader.readEntries(function(results){
                console.log("in read entries result", results);
    });
    for (var i=0; i<globals.assets[vandring].length; i++){
        globals.assets[vandring][i].remove(function(){console.log("Removed");}, fsError);
    }
    globals.assets[vandring].splice(0,globals.assets[vandring].length);


    aReader.readEntries(function(results){
                console.log("in read entries result", results);
    });
}

function onBackKeyDown(){
    if( $("#download-sponsor-page").is(':visible') && $("#load-indicator").hasClass("el-loading-done") ) {
        $("#download-sponsor-page").hide();
    } else if( $("#download-sponsor-page").is(':hidden') ) {
        navigator.app.exitApp();
    }
}
