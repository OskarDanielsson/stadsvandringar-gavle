
var globals = {};
globals.checkedServer = false;
globals.assetServer = "http://hariett.se/test/assets.json";
globals.assetSubDir = "assets";


document.addEventListener("deviceready", onDeviceReady, false);
function onDeviceReady() {
        
    
    checkAssets();        
    $("#historisk").on("tap", function(){
        console.log("HEJ");
        for(var i=0; i < globals.assets.length; i++){
        $("#card-content").html("<img src='"+globals.assets[i].fullPath+"' alt='hej'>");
        }
        
    });
                           
    $("#delete-assets").on("tap", function(){
        deleteAssets();
        console.log();
    });
    
    
}

function fsError(e){
    console.log(e.code, e.message);
//End of deviceready
}


// Functions

function downloadAssets(res){
        
        
        for(var i=0, len=res.length; i<len; i++){
            // Tar ut filnamnet från url:en
            var file = res[i].split("/").pop();
            var haveIt = false;
            
            // Kolla i assets om filen redan finns.
            for(var k=0; k<globals.assets.length; k++){
                if(globals.assets[k].name === file){
                    console.log("we already have file " +file);
                    haveIt = true;
                    break;
                }
            }
            // Hämta filen om den inte redan finns.
            if(!haveIt) {fetch(res[i]);}
        }
}

/* Gå till getAssets när man valt en vandring. Om assets finns, starta vandringen. Visa annars Ladda ned vandring. */
function getAssets(){
    var def = $.Deferred();
    if(globals.assets){
        console.log("returning cached assets");
        def.resolve(globals.assets);
        return def.promise();
    }
    
    /* Getting main directory, should move this out of getAssets so it can be
    found in download assets and delete assets without having to go here first. */
    
    var dirEntry = window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(dir){
        console.log("got main dir",dir);
        
        // Creating subdir "assets"
        dir.getDirectory(globals.assetSubDir+"/", {create:true}, function(aDir) {
            console.log("got assets directory");
            
            var reader = aDir.createReader();
            reader.readEntries(function(results){
                console.log("in read entries result", results);
                globals.assets = results;
                def.resolve(results);
            });
            
            // Global variable for the asset directory
            globals.assetDirectory = aDir;
            
        }, fsError);
        
    }, fsError);
    
    return def.promise();
}

function fetch(url) {
    console.log("fetch url", url);
    var localFileName = url.split("/").pop();
    var localFileURL = globals.assetDirectory.toURL() + localFileName;
    console.log("fetch to "+localFileURL);
    var ft = new FileTransfer();
    
    ft.download(url, localFileURL, function(entry){
        console.log("i finished it");
        globals.assets.push(entry);
    },
    fsError);
}

/* fileEntry.remove() can be used on separate files in assetDirectory or the whole directory */
function deleteAssets() {
    console.log(globals.assets.length);
    for (var i=0; i<globals.assets.length; i++){
        globals.assets[i].remove(function(){console.log("Removed");}, fsError);
    }
    globals.assets.splice(0,globals.assets.length);
    
    var aReader = globals.assetDirectory.createReader();
    aReader.readEntries(function(results){
                console.log("in read entries result", results);
    });
    /*
    var rmFile = globals.assetDirectory.getFile(globals.assets[0].fullPath, {create:false}, function(aFile){
    console.log(globals.assets);
    aFile.remove(function(){console.log("Removed");}, fsError);
        globals.assets.splice(0,1);
    }, fsError);
    */
}
    
    
function checkAssets(){
    $.get(globals.assetServer).done(function(result) {
        console.log(result);
    })
    .fail(function(e){
        console.log(e);
    });
        
    var assetReader = getAssets();
    assetReader.done(function(results){
        console.log("promise  done", results);
        if(results.length === 0) {
            downloadAssets(results);
        } else {
            console.log("Got assets!");
        }
    });
}
    

