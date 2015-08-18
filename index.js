'use strict'; 

var get = require('./get');
var stream = require('./stream');

module.exports = function(params, cb){

    if(!params.bucket){
        cb({
            error: "Bucket must be specified in config object",
            received: params.bucket
        });
    }

    var config = {
        bucket: params.bucket, //Required
        feedFile: params.feedFile || null, //optional
        location: params.location || null, //Optional
        pollInterval: params.pollInterval || 60000
    };

    require('./remote-config')(config, function(err, s3Config){
        if(err){
            console.error(err);
            cb(err);
        }
        else {
            cb(null, {
                get: get(config, s3Config),
                stream: stream(config, s3Config)
            });
        }
    });
};
