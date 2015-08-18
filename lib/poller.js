"use strict";

/**
 * @param requestInterval {int} The miliseconds with which to poll
 * @param action {function} The function to execute for each interval, expected to be a poll function
 * @param predicate {function} execute the function again?
 * @param startState {Object} The parameters for the function to start with
 * A simple poll function. Passes the result of action as the params of the next call.
 */ 
function poller (requestInterval, predicate, action, startState){
    setTimeout(function(){
        var state = action(startState);
        if(predicate(state)){
            poller(requestInterval, predicate, action, state);
        }
    }, requestInterval);
}
