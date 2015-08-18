### Hipster-Batch client - NodeJS 

This is a reader for the hipsterbatch distrubtion system - a simple stream of writes of records' current state to s3 as they change. 

This is a client, so it's intended as a reader of the events. It: 

1. Provides a 'get' interface for accessing a single record on-demand.
2. Provides a read-stream of records as they change. 

**init:**

    var config = {
        bucket: "example-bucket",          //Required
        feedFile: "someExampleFeedfile01", //optional
        location: 12                       //Optional
    }

    //Requires async config, so has to be setup in an async manner
    require('hipster-batch-stream')(config, function(err, hb){
        if(err)
            console.error(err);
        //else use hb
    });

**Fetching a single record:**

This allows for an on-demand fetch of a single record as a direct pull. it will return the known
present state. 

    //Fetch a single record:
    hb.get(1234, function(err, data){
        if(err){
            console.error(err);
        }

        //Do something with record
    });

**Modification stream:**

This will play a stream of changes as they are pushed from the upstream system making the 
modifications. It is presented as a push-based system. This is a standard node read-stream 
and it can be attached to other stream interfaces or used thusly: 

    //Read stream of changes
    hb.modStream.on('data', function(modified){

        //Record info:
        modified.record.id //The id of the record changed
        modified.record.record // The actual record 

        // Meta info: for keeping track of state
        modified._meta.feedFile // The current feedfile location
        modified._meta.location // The linenumber in the feedfile 

    });
    
    //Handle errors
    hb.modStream.on('error', function(err){
        console.error('something broke', err)
    });

**Fetch all current records**
This is a convenience function which enumerates all records in the bucket. 

    hb.all(function(err, data){
        data.id //the id 
        data.record //The actual data
    });
