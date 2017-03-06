'use strict';
/**
 * @author Greg Rozmarynowycz<greg@thunderlab.net>
 */
require('angular')
    .module('mallet')
    .service('mallet.Log', ['StateMachine', Log]);

function Log(StateMachine){

    var levels = [
        'None',
        'Error',
        'Warning',
        'Info',
        'Debug'
    ],
        level = 0;
    
    var loggers = [console];
    
    var logState = new StateMachine(levels),
        allStates = Math.pow(2, levels.length - 1) - 1;
    //for faster access, store the state locally
    logState.onState(allStates, (newState)=>{
        level = newState;
    });
    
    //Expose logging levels
    this.levels = {};
    Object.assign(this.levels, logState);
    
    this.config = params => {
        logState.setState(typeof(params.level) !== 'undefined' ? params.level : logState.Error);
    };
    
    /**
     * @param {string} stack
     * @param {number} [calls=0]
     */
    function getTrace(stack, calls){
        return stack.split('\n')[(calls || 0) + 2].split(' at ').pop();
    }
    
    function logOut(args, level, func){
        var stack = Error().stack,
            trace = getTrace(stack);

        args[0] = `${trace} ${args[0]}`;
        for(var i = 0, l = loggers.length; i < l; i++){
            loggers[i][func].apply(loggers[i], args);
        }
    }
    
    this.error = () => {
        if(level < logState.Error){
            return;
        }
        
        logOut(Array.prototype.slice.call(arguments), logState.Error, 'error');
    };
    
    this.warn = () => {
        if(level < logState.Warning){
            return;
        }
        
        logOut(Array.prototype.slice.call(arguments), logState.Warning, 'warn');
    };
    
    this.out = () => {
        if(level < logState.Info){
            return;
        }
        
        logOut(Array.prototype.slice.call(arguments), logState.Info, 'info');
    };
    
    this.debug = () => {
        if(level < logState.Debug){
            return;
        }
        
        logOut(Array.prototype.slice.call(arguments), logState.Debug, 'debug');
    };
}