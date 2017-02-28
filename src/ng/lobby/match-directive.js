/**
 * Display details about a match while waiting for enough users
 * @author Greg Rozmarynowycz <greg@thunderlab.net>
 */
'use strict';

module.exports = function (ClientMatch) {
    return {
        restrict: 'E',
        scope: {
            match: '='
        },
        templateUrl: 'views/staging-match.html',
        controller: ['$scope', function StagingMatchCtrl($scope) {

            const arrMaxSize = new Array(ClientMatch.MAX_MATCH_SIZE);
            $scope.getMaxSize = function () {
                return arrMaxSize;
            }
        }]
    };
};