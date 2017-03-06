/**
 * Created by Greg on 10/29/2016.
 */
'use strict';
/**
 * For now just handles maintain app state, might change in the future
 * @name MState
 * @memberOf mallet
 * @property Running
 * @property Loading
 * @property Suspended
 * @property Debug
 */
require('angular').module('mallet').service('mallet.state', ['$location', function($location){

    var self = this,
        stateListeners = [],
        appState = 0;

    //Define states - this is probably getting clever code, but is possible setup
    //for a state machine provider
    ['Running','Loading','Suspended','Debug'].forEach((state, i) => {
        Object.defineProperty(self, state, {value: Math.pow(2, i), enumerable: true});
    });

    /**
     * Invokes callbacks for events listening for the given state
     * @param state
     */
    function invokeStateListeners(state) {
        stateListeners.forEach(listener => {
            if((listener.state | state) === state){
                listener.callback();
            }
        });
    }

    /**
     * Indicates if a given state is active
     * @param state
     * @returns {boolean}
     */
    this.is = state => {
        return (state | appState) === appState;
    };

    this.getState = () => {
        return appState;
    };

    /**
     * Creates an event listener for the given state
     * @param state
     * @param callback
     */
    this.onState = (state, callback) => {
        stateListeners.push({
            state: state,
            callback: callback
        });
    };

    function deactivate(state){
        appState ^= appState & state;
    }

    /**
     * Activates the given state; some states will automatically deactive others
     * @param state
     */
    this.setState = state => {
        appState |= state;
        switch(state){
            case self.Suspended:
                deactivate(self.Running | self.Loading);
                break;
            case self.Running:
                deactivate(self.Suspended | self.Loading);
                break;
        }

        console.log('set state: ' + state + ' => ' + appState);
        invokeStateListeners(state);
    };

    /**
     * Reset the state machine to the default state, clearing all listeners
     */
    this.clearState = () => {
        appState = self.Loading;
        appState |= $location.search().debug === '1' ? self.Debug : 0;
        stateListeners.length = 0;
    };

    /**
     * Deactivate the given state
     * @param state
     */
    this.removeState = state => {
        deactivate(state);
    };

    self.clearState();
}]);