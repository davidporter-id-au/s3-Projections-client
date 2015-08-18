
'use strict';

var aws = require('aws-sdk');
var s3 = new aws.S3();
var util = require('util');

/**
 * Fetches the feed file from s3 and parses it.
 */
module.exports = function (config, s3Config, file, cb){

    if(!file || !config || !s3Config){
        cb('Missing parameter when fetching file: ');
    }

    var fetchConfig = {
        Bucket: config.bucket,
        Key: file
    };

    s3.getObject(fetchConfig, function(err, data){
        if(err){
            cb(err);
        }

        var feedFile;
        try{
            cb(null, JSON.parse(data.Body.toString()));
        }
        catch(e){
            cb({
                message: "Error while attempting to parse file",
                file: file,
                configUsed: fetchConfig,
                error: util.inspect(e)
            });
        }
    });
}
