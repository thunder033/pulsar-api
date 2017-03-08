/**
 * TODO: [Description]
 * @author Greg Rozmarynowycz <greg@thunderlab.net>
 */
'use strict';

module.exports = {clockFactory, resolve(ADT) {return [
    clockFactory]}};

function clockFactory() {

    class Clock {
        constructor(){
            this.startTime = (new Date()).getTime() - (~~performance.now());
        }

        getNow() {
            return this.startTime + (~~performance.now());
        }
    }

    return new Clock();
}