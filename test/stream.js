
'use strict';

var expect = require('chai').expect;
var project = require(__dirname + '/../');
var config = {
    bucket: "engineering-nativeapply-projections-sandbox"
};

describe.only('Stream: Given successful bootstrapping', function(){
    var stream;
    beforeEach(function(done){
        project(config, function(err, hb){
            if(err){
                console.error(err);
            }
            else {
                stream = hb.stream;
                done();
            }
        });
    });

    it('should fetch a stream of changes', function(done){
        stream.read(function(err, data){
            expect(err).to.be.null;
            console.log(data);
            done();
        });
    });
});
