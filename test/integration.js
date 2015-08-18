'use strict';

var expect = require('chai').expect;
var project = require('../');
var config = {
    bucket: "hipsterbatchhack"
};

describe('tba', function(){

    it('should bootstrap ok', function(done){
        project(config, function(err, hb){
            expect(err).to.be.null;
            done();
        });
    });

    it('Should create a callback with the getter function set', function(done){
        project(config, function(err, hb){
            expect(err).to.be.null;
            done();
        });
    });

    describe.skip('Given a successful bootstrapping', function(){

        var hb;

        beforeEach(function(done){
            project(config, function(err, h){
                if(!err)
                    hb = h;
                done();
            });
        });

        it('should be able to fetch an object without errors', function(done){
            hb.get('testfile.txt', function(err, thing){
                expect(err).to.be.null;
                done();
            });
        });

        it('should be able to fetch an object', function(done){
            hb.get('testfile.txt', function(err, data){
                expect(data.Body.toString()).to.eql("baz\n");
                done();
            });
        });
    });
});
