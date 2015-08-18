'use strict';

var aws = require('aws-sdk');
var s3 = new aws.S3();

module.exports = function(config, s3config){
    return function(recordID, cb){
        if(!s3config.feeds[0].data){
            cb({
                message: "The configuration file from s3 was not read correctly, cannot find data directory"
            });
        }
        if(!recordID){
            cb({mesage: "recordID must be specified"});
        }
        var key = s3config.feeds[0].data + "/" + recordID;
        s3.getObject({Bucket: config.bucket, Key: key}, cb);
    };
};
