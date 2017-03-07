/**
 * TODO: [Description]
 * @author Greg Rozmarynowycz <greg@thunderlab.net>
 */
'use strict';

module.exports = {ResultsCtrl, resolve(ADP) {return [
    ADP.ng.$scope,
    ADP.game.ClientMatch,
    ResultsCtrl]}};

function ResultsCtrl($scope, ClientMatch) {

}
