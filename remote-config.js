'use strict';

var aws = require('aws-sdk');
var s3 = new aws.S3();

function fetch (config, cb) {
    if(!config.bucket){
        cb("No bucket defined in config");
    }
    var configKey = config.bucket + "-feed-config.json";

    s3.getObject({ Bucket: config.bucket, Key: configKey}, function(err, data){
        if(err){
            cb({err: "Unable to fetch config object from the bucket", s3Error: err});
        }
        var s3Config;
        try {
            s3Config = JSON.parse(data.Body.toString());
            cb(null, s3Config);
        }
        catch(e){
            cb({message: ('JSON parsing of config failed. Check the bucket config is correct at ' + configKey + " and the config is well formed."), err: e});
        }
    });
}

module.exports = function(config, cb){
    return {
        fetch: fetch(config, cb)
    };
};
