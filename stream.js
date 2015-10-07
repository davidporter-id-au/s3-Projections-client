'use strict';

var aws = require('aws-sdk');
var s3 = new aws.S3();
var Readable = require('stream').Readable;
var fetchFile = require('./lib/fetchFile');
var poller = require('./lib/poller');
var util = require('util');

function fetchNext(config, s3Config, feedFileString, file, linePointer, cb){

    // Ensure there's a file available by fetching it if null
    // and recursing this function with the retrieved data. 
    if(!file){
        console.log(feedFileString);
        return fetchFile(config, s3Config, feedFileString, function(err, fileRetrieved){
            if(err){
                return cb(err);
            }
            fetchNext(config, s3Config, feedFileString, fileRetrieved, linePointer, cb);
        });
    }
    
    if(!util.isArray(file.items)){
        cb({ err: "feed file .items is not an array", items: file.items });
        return;
    }

    // If the linepointer is past the end of the file, time to get the next file: 
    if(linePointer > file.items.length){
        //If there's a next file:
        if(file.next.S3FileKey){
            fetchNext(config, s3Config, file.next.S3FileKey, null, 0, cb);
            return;
        }
        //If there's no next file:
        else{
            cb(null); //Do nothing
            return;
        }
    }
    else {
        cb(null, file.items[linePointer], feedFileString, file, linePointer + 1);
    }
}

/**
 * A stateful object which represents a stream of changes. Calling the
 * read method will provide the next object in the stream.
 *
 * Note, this is a non-standard and likely temporary interface, probably to change
 * in the future once I have found a better generic interface to work with.
 */
function createPseudoReadStream(config, s3Config){

    var pseudoReadStream = {};

    //The current feedfile. Set initially to the first feed file bythe s3Config.
    pseudoReadStream.feedFileString = s3Config.feeds[0].start;

    //Pointers:
    var filePointer = undefined;
    pseudoReadStream.feedPointer = 0; //The current location in the feedfile. Set initially to 0.

    pseudoReadStream.read = function(cb){
        var ctx = this;
        fetchNext(config, s3Config, this.feedFileString, filePointer, this.feedPointer,

            function(err, data, latestFeedFileString, latestFeedFilePointer, latestLinePointer){
                if(err){
                    cb(err);
                    return;
                }

                if(latestFeedFileString)
                    this.feedFileString = latestFeedFileString;
                if(latestFeedFilePointer)
                    filePointer = latestFeedFilePointer;
                if(latestLinePointer)
                    this.feedPointer = latestLinePointer;

                //package it all up nicely and push it off to the stream:
                cb(null, {
                    _meta: {
                        currentFeedFile: this.feedFileString,
                        currentLine: this.feedPointer
                    },
                    event: data
                });
            });
    };
    return pseudoReadStream;
}


module.exports = function(config, s3Config){
    return createPseudoReadStream(config, s3Config);
};
