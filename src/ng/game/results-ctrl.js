/**
 * TODO: [Description]
 * @author Greg Rozmarynowycz <greg@thunderlab.net>
 */
'use strict';

module.exports = {ResultsCtrl,
resolve: ADT => [
    ADT.ng.$scope,
    ADT.game.ClientMatch,
    ResultsCtrl]};

function ResultsCtrl($scope, ClientMatch) {

}
