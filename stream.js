'use strict';

var aws = require('aws-sdk');
var s3 = new aws.S3();
var Readable = require('stream').Readable;
var fetchFile = require('./lib/fetchFile');
var poller = require('./lib/poller');
var util = require('util');

var eventReadStream = new Readable;

eventReadStream._read = function(){ /* noop */ };

/** 
 * Fetches the given feedfile and loops through the events until it reaches the end. 
 */
function fetchFeed(config, s3Config, feedFile, line, cb){
    fetchFeedFile(config, s3Config, feedFile, line, function(err, nextFeedFile){
        if(err){
            console.log('error', err);
            cb(err);
        }
        else if(nextFeedFile) {
            fetchFeed(config, s3Config, nextFeedFile, 0, cb);
        }
        else { //At the end of the event-stream
            cb(null, feedFile, line);
        }
    });
}

/**
 * Reads a feedfile and returns an array of events that have occured from the given position onward
 */ 
function fetchFeedFile (config, s3Config, feedFile, line, cb){
    fetchFile(config, s3Config, feedFile, function(err, file){
        console.log('here', feedFile, err)
        if(err){
            cb(err);
            return;
        }
        if(!util.isArray(file.items)){
            cb({ err: "feed file .items is not an array", items: file.items });
            return;
        }
        for(var i = (line || 0); i < file.items.length; i++){
            eventReadStream.push(JSON.stringify(file.items[i]));
        }
        if(file.next){
            cb(null, file.next.S3FileKey);
        }
        else {
            cb(null);
        }
    });
}


module.exports = function(config, s3Config){

    var feedFilePointer = s3Config.feeds[0].start;  //The current feedfile. Set initially to the first feed file bythe s3Config.
    var feedPointer = 0; //The current location in the feedfile. Set initially to 0.

        fetchFeed(config, s3Config, feedFilePointer, feedPointer, function(err, latestFeedFile, latestPointer){
            if(err){
                console.error(err);
            }
            feedFilePointer = latestFeedFile;
            feedPointer = latestPointer;
        });

    return eventReadStream;
};
