/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

var globals = {};
globals.checkedServer = false;
globals.assetServer = "http://http://192.168.5.155/assets.json";
globals.assetSubDir = "assets";


document.addEventListener("deviceready", onDeviceReady, false);
function onDeviceReady() {
    
    
    $("#download-assets-button").on("tap", function(){
        var res = ["http://hariett.se/test/image01.png", "http://hariett.se/test/image02.png", "http://hariett.se/test/image03.png"];
        for(var i=0, len=res.length; i<len; i++){
            var file = res[i].split("/").pop();
            var haveIt = false;
            
            for(var k=0; k<globals.assets.length; k++){
                if(globals.assets[k].name === file){
                    console.log("we already have file " +file);
                    
                    
                    haveIt = true;
                    break;
                }
            }
            if(!haveIt) {fetch(res[i]);}
        }
        
    });

    $("#view-assets-button").on("tap", function(){
        var assetReader = getAssets();
        assetReader.done(function(results){
            console.log("promise  done", results);
            if(results.length === 0) {
                $("#asset-container").html("<p>No assets</p>");
            } else {
                var list = "";
                for(var i=0, len=results.length; i<len; i++){
                    list += "<img src='"+results[i].toURL()+"' alt='"+results[i].name+"'>";
                }
                
                console.log(list);
                $("#asset-container").html(list);
                
            }
        });
    });
    
    $("#delete-assets-button").on("tap", function(){
        deleteAssets();
    });
    
    
}

function fsError(e){
    console.log(e.code, e.message);
//End of deviceready
}

    

// Functions


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
            console.log("got assets");
            
            var reader = aDir.createReader();
            reader.readEntries(function(results){
                console.log("in read entries result", results);
                globals.assets = results;
                def.resolve(results);
            });
            
            // Global variable for the directory
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
    
     
    /*
    var rmFile = globals.assetDirectory.getFile(globals.assets[0].fullPath, {create:false}, function(aFile){
    console.log(globals.assets);
    aFile.remove(function(){console.log("Removed");}, fsError);
        globals.assets.splice(0,1);
    }, fsError);
    */
    
    
}
