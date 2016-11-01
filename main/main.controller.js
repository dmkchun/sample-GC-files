'use strict';

angular.module('gotChamp')
       .controller('MainCtrl', ['$scope', 'localStorageService', '$cookies', '$cookieStore', '$location', '$route', 'authService', '$interval', 'MainFactory', 'AccountStatusService', 'Test', 'LoadInfoDataFactory', 'LoadProfileFactory',
           function ($scope, localStorageService, $cookies, $cookieStore, $location, $route, authService, $interval, MainFactory, AccountStatusService, Test, LoadInfoDataFactory, LoadProfileFactory) {
               $scope.mainInit = function () {
                   $scope.totalPrizesGivenAway = 0;
                   getTotalPrizesGivenAway();
                   $scope.loadData();
                   $scope.prevWinners = [];
                   $scope.totalPrev = 0;
                   $scope.isDraw = false;

                   $scope.remaining = {
                       hours: 0,
                       Minutes: 0,
                       Seconds: 0
                   };

                   var data = localStorageService.get("authorizationData");

                   if (typeof (Storage) !== "undefined") {
                       if (sessionStorage.isAlreadyLogin == undefined) {
                           localStorageService.clearAll();
                       }
                   }
                   $scope.isLoggedIn;
                   if (data == null) {
                       $scope.hasCampaigns = false;
                       $scope.campaigns = {};
                       $scope.isLoggedIn = false;
                       loadCampaigns();
                   }
                   else {
                       $scope.latestCombination = "0-0-0-0-0-0-0";
                       $scope.monthly = 0;
                       $scope.weekends = 0;
                       $scope.hasWon = true;
                       $scope.hasData = true;
                       $scope.isLoggedIn = true;
                       loadStats(data.username);
                   }

                   var myChatHub = $.connection.myHub;
                   //console.log(myChatHub);

                   myChatHub.client.newCountDownReceived = function (message) {
                       var msg = JSON.parse(message);

                       //console.log(msg.IsDraw);
                       $scope.isDraw = msg.IsDraw;
                       $('#hours').text(msg.hours);
                       $('#minutes').text(msg.Minutes);
                       $('#seconds').text(msg.Seconds);

                       $('#hours2').text(msg.hours);
                       $('#minutes2').text(msg.Minutes);
                       $('#seconds2').text(msg.Seconds);

                       if (msg.RemainingMinutes >= 0 && msg.RemainingSeconds >= 0 && msg.Minutes <= 0 && msg.hours <= 0 && msg.Seconds <= 0) {
                           $('#waiting').css({
                               'display': 'block'
                           });
                           $('#backMinutes').text(msg.RemainingMinutes);
                           $('#backSeconds').text(msg.RemainingSeconds);
                           localStorageService.clearAll();
                       } else {

                       }
                   }

                   $.connection.hub.start().done(function (data) {
                       //console.log(data);
                       //console.log("success");
                   }).fail(function (error) {
                       console.error(error);
                   });;

                   $('#prevWinners').carousel({
                       pause: true,
                       interval: false
                   });

                   $('#prevWinnersMob').carousel({
                       pause: true,
                       interval: false
                   });
                   $scope.index = 0;
                   //$scope.isLast = false;
               };

               //$('.carousel-indicators li').on('click', function () {
               //    $('.carousel').carousel(parseInt(this.getAttribute('data-to')));
               //});

               var getTotalPrizesGivenAway = function () {
                   LoadInfoDataFactory.getTotalPrizesGivenAway().success(function (data) {
                       $scope.totalPrizesGivenAway = data;
                   });
               };

               var compareNumbers = function (a, b) {
                   return a - b;
               }

               var loadCampaigns = function () {
                   LoadProfileFactory.getCampaigns().success(function (data) {
                       if (data.length != 0) {
                           $scope.hasCampaigns = true;
                       }
                       $scope.campaigns = data;
                   });
               };

               var loadStats = function (username) {
                   LoadProfileFactory.getLatestCombination().success(function (data) {
                       if (data == 'No records found yet.') {
                           $scope.hasData = false;
                           $scope.latestCombination = "エントリーがありません。";
                           return;
                       }

                       $scope.latestCombination = data;
                       $scope.latestCombination.breakDownedNumbers = $scope.latestCombination.Combination.split('-');

                   });

                   LoadProfileFactory.getStats().success(function (data) {
                       if (typeof data.timesPlayedthisMonth != 'undefined') {
                           $scope.monthly = data.timesPlayedthisMonth;
                       }

                       if (typeof data.timesPlayedOnWeekend != 'undefined') {
                           $scope.weekends = data.timesPlayedOnWeekend;
                       }

                       if (typeof data.nonWinner == 0) {
                           $scope.hasWon = false;
                       }
                       else {
                           $scope.hasWon = true;
                       }
                   });
               };

               $scope.calcIndex = function (index, add) {
                   var x = index + add;
                   //console.log(x);

                   //prevWinners
                   $scope.combiIndex = x;
               };

               $scope.altIndex = function (add) {
                   $scope.index += add;
                   $('.winning-combination.item').removeClass("active");
                   $('.winning-combination.item[index=' + $scope.index + ']').addClass("active");
                   //$('#prevWinnersMob').carousel($scope.index);
               }

               $scope.authData = localStorageService.get("authorizationData");

               $scope.user = {};
               var n;
               var combiCount = 0;

               var prev = 3;

               $scope.user = {};
               $scope.numbers = [];
               $scope.combinations = [];

               $scope.SuperCombinationPrize = "0";
               $scope.cutOffReadable = "12:00 pm";

               $scope.previousCombination = [];

               $scope.winningPrev = function () {
                   prev--;
                   if (prev == 2) {
                       $scope.nextExp = 'two';
                   } else if (prev == 1) {
                       $scope.nextExp = 'three';
                       $scope.isMin = true;
                   }
               }

               $scope.winningNext = function () {
                   prev++;
                   if (prev == 2) {
                       $scope.nextExp = 'two';
                       $scope.isMin = false;
                   } else if (prev >= 3) {
                       $scope.nextExp = 'one';
                       prev = 3;
                   }
               }
               authService.fillAuthData();
               $scope.authentication = authService.authentication;

               $scope.displayedCombination = [];

               for (var i = 1; i <= 49; i++) {
                   n = i > 9 ? "" + i : "0" + i;
                   $scope.numbers.push(i);

               };

               LoadInfoDataFactory.getGlobalTime().then(function (response) {
                   setInterval(function () {
                       var time = new Date(response.data);
                   }, 1000);
               });

               $scope.checkPlayed = function () {
                   var user = localStorageService.get('authorizationData');
                   if (user) {
                       if ((user.isPlayed + "").toLowerCase() == "true") {
                           $scope.isPlayed = true;
                           $scope.clearPicks();
                       }
                       else {
                           $scope.isPlayed = false;
                       }
                   }
               };

               $scope.UpdateCombination = function () {
                   for (var x = 0; x < 7; x++) {
                       $scope.displayedCombination[x] = $scope.combinations[x];
                   }
               };

               $scope.loadCombination = function () {
                   if (localStorageService.get("combinationNumberData") != null) {
                       for (var x = 0; x < 7; x++) {
                           $scope.combinations.push(localStorageService.get("combinationNumberData")[x]);
                       }

                       $scope.isSelected = function (value) {
                           return $scope.combinations.indexOf(value) >= 0 ? true : false;
                       };

                       combiCount = 7;
                       $scope.UpdateCombination();
                   }
               };

               $scope.user.combinationNumber = "";
               $scope.play = function () {

                   if ($scope.isPlayed) {
                       return;
                   }

                   if (combiCount == 0) {
                       toastr.warning("エントリーを選択して下さい。");
                       return;
                   }

                   if (combiCount < 7) {
                       toastr.warning("7つの番号を選択してください。");
                       return;
                   }

                   var authData = localStorageService.get('authorizationData');
                   localStorageService.set('combinationNumberData', $scope.combinations);

                   if (authData) {
                       if (combiCount == 7) {
                           $location.path("/content");
                       };
                   } else {
                       $location.path('/login');
                       //if (!$cookies.IsRegister) {
                       //    $location.path('/register');
                       //} else {
                       //    $location.path('/login');
                       //};
                   };
               };

               $scope.Select = function (number) {
                   if ($scope.isPlayed) {
                       return;
                   }

                   if (!($scope.combinations.indexOf(number) < 0)) {
                       $scope.Clear($scope.combinations.indexOf(number));
                       return;
                   }
                   if (combiCount < 7) {
                       var isTrue = false;
                       for (var x = 0; x < 7; x++) {
                           if ($scope.combinations[x] == null) {
                               $scope.combinations.splice(x, 1, number);
                               $scope.UpdateCombination();
                               isTrue = true;
                               break;
                           }
                       }

                       if (!isTrue) {
                           $scope.combinations.push(number);
                       }

                       combiCount++;
                       $scope.UpdateCombination();
                   }
                   $scope.isSelected = function (value) {
                       return $scope.combinations.indexOf(value) >= 0 ? true : false;
                   };
               };

               $scope.isLast = function (number) {
                   return $scope.displayedCombination[6] == number ? true : false;
               };

               $scope.Clear = function (number) {
                   if ($scope.combinations[number] == null) {
                       return;
                   }

                   $scope.combinations.splice(number, 1, null);

                   $scope.displayedCombination = [];
                   combiCount--;
                   $scope.UpdateCombination();
               };

               $scope.clearPicks = function () {
                   $scope.combinations = [];
                   $scope.displayedCombination = [];
                   $scope.user.combinationNumber = "";
                   localStorageService.remove('combinationNumberData');
                   combiCount = 0;
                   $scope.UpdateCombination();

               };

               $scope.quickPicks = function () {

                   $scope.combinations = [];

                   for (var i = 0; i < 7; i++) {
                       var num = Math.floor((Math.random() * 49) + 1);
                       while ($scope.combinations.indexOf(num) >= 0) {
                           num = Math.floor((Math.random() * 49) + 1);
                       }

                       $scope.combinations.push(num);
                   };

                   $scope.isSelected = function (value) {
                       return $scope.combinations.indexOf(value) >= 0 ? true : false;
                   };
                   combiCount = 7;
                   $scope.UpdateCombination();
               };

               $scope.Login = function (user) {

                   MainFactory.login(user, function (data) {
                   }, function () {
                   });

               };


               var id;

               //  id = $interval(countDown, 1000);
               function countDown() {
                   try {
                       $scope.globalTime = new Date($scope.globalTime.getTime() + 1000);

                       refreshTime($scope.globalTime);
                   }
                   catch (err) {
                   }
               }
               var refreshTime = function (time) {
                   var calcRem = ($scope.cutOff.getTime() - 28800000) - time.getTime() < 0 ? (86400000 + ($scope.cutOff.getTime() - 28800000) - time.getTime()) : ($scope.cutOff.getTime() - 28800000) - time.getTime();
                   //console.log(calcRem);
                   var RemainingTime = new Date(calcRem);
                   //console.log(RemainingTime);
                   var calcHours = RemainingTime.getHours();
                   var calcMinutes = RemainingTime.getMinutes();
                   var calcSeconds = RemainingTime.getSeconds();


                   $scope.remaining = {
                       Hours: calcHours,
                       Minutes: calcMinutes,
                       Seconds: calcSeconds
                   };

                   if (calcHours == 0 && calcMinutes == 0 && calcSeconds == 0) {
                       $interval.cancel(id);
                       $scope.waitingNewDraw = true;
                       localStorageService.clearAll();
                       $route.reload();
                   }
               };

               $scope.displayedNumbers = [];
               $scope.combinationRows = [];
               for (var x = 0; x < 7; x++) {
                   $scope.displayedNumbers.push(x);
                   $scope.combinationRows.push(x);
               };

               $scope.multiplier = function (multiplier) {
                   return 7 * multiplier;
               };

               $scope.calc = function (current, num) {
                   return 5 - num;
               };
               $scope.loadData = function () {

                   try {
                       LoadInfoDataFactory.loadTime().then(function (data) {
                           var parsedDateTime1 = data.data.CutOffDateTime.split(".");
                           var parsedDateTime2 = parsedDateTime1[0].split("T");
                           var parsedDateTimeLeft = parsedDateTime2[0].split("-");
                           var parsedDateTimeRight = parsedDateTime2[1].split(":");
                           //console.log(parsedDateTimeLeft);
                           //console.log(parsedDateTimeRight);
                           //$scope.cutOff = new Date(data.data.CutOffDateTime);
                           $scope.cutOff = new Date(parseInt(parsedDateTimeLeft[0]), parseInt(parsedDateTimeLeft[1]), parseInt(parsedDateTimeLeft[2]), parseInt(parsedDateTimeRight[0]), parseInt(parsedDateTimeRight[1]), parseInt(parsedDateTimeRight[2]), 0);
                           $scope.cutOffReadable = ($scope.cutOff.getHours() > 12 ? $scope.cutOff.getHours() - 12 : ($scope.cutOff.getHours() == 0 ? 12 : $scope.cutOff.getHours())) + ":" + (($scope.cutOff.getMinutes() + "").length > 1 ? $scope.cutOff.getMinutes() : 0 + "" + $scope.cutOff.getMinutes()) + " " + ($scope.cutOff.getHours() >= 12 ? "pm" : "am");
                           //console.log(parseInt(parsedDateTimeLeft[1]));
                           try {
                               LoadInfoDataFactory.getGlobalTime().then(function (response) {
                                   if (response.data != null) {
                                       var parsedDateTime1 = response.data.CutoffTime.split(".");
                                       var parsedDateTime2 = parsedDateTime1[0].split("T");
                                       var parsedDateTimeLeft = parsedDateTime2[0].split("-");
                                       var parsedDateTimeRight = parsedDateTime2[1].split(":");
                                       //console.log(parsedDateTime[0].replace(/\s/, 'T'));
                                       $scope.globalTime = new Date(parseInt(parsedDateTimeLeft[0]), parseInt(parsedDateTimeLeft[1]), parseInt(parsedDateTimeLeft[2]), parseInt(parsedDateTimeRight[0]), parseInt(parsedDateTimeRight[1]), parseInt(parsedDateTimeRight[2]), 0);
                                       //$scope.globalTime = new Date(2015, 08, 19, 15, 7, 55, 0);
                                   } else {
                                       $scope.waitingNewDraw = true;
                                   }
                                   //console.log(parsedDateTimeLeft);
                                   //console.log(parsedDateTimeRight);

                               });

                           } catch (e) {
                               //console.log(e);
                           }
                       }, function (error) {
                           //console.log(error);
                       });
                   } catch (e) {
                       //console.log(e);
                   }

                   try {
                       LoadInfoDataFactory.loadPrizes().then(function (data) {
                           // loads all list of available prizes

                           if (data.data.length > 0) {
                               $scope.SuperCombinationPrize = data.data[0].Amount;
                           }
                       }, function (error) {
                           toastr.error("Failed to load Prizes Information.");
                       });
                   } catch (e) {
                   }

                   try {
                       LoadInfoDataFactory.loadWinningCombinations().then(function (data) {
                           if (data.data.length <= 0) {
                               return;
                           }
                           var combData = [];
                           combData.push(data.data);
                           combData.reverse();
                           //console.log(combData[0][0]);
                           for (var x = 0; x < data.data.length; x++) {
                               var parsedDateTime1 = combData[0][x].RaffleDrawDate.split(".");
                               var parsedDateTime2 = parsedDateTime1[0].split("T");
                               var parsedDateTimeLeft = parsedDateTime2[0].split("-");
                               var parsedDateTimeRight = parsedDateTime2[1].split(":");
                               var split = data.data[x].RaffleDrawDate.split('T')[0];
                               var prevDate = new Date(split);
                               // var prevDate = new Date(parseInt(parsedDateTimeLeft[0]), parseInt(parsedDateTimeLeft[1]), parseInt(parsedDateTimeLeft[2]), parseInt(parsedDateTimeRight[0]), parseInt(parsedDateTimeRight[1]), parseInt(parsedDateTimeRight[2]), 0);
                               var numbers = combData[0][x].WinningCombination.split('-');
                               var last = numbers.pop();
                               numbers.sort(compareNumbers);
                               numbers.push(last);

                               $scope.previousCombination.push({
                                   combination: numbers,
                                   date: prevDate,
                                   gameNum: combData[0][x].RaffleId
                               });

                               $scope.totalPrev += 1;
                           }
                           //$scope.index = $scope.totalPrev - 1;
                           //console.log($scope.previousCombination);
                       }, function (error) {
                       });
                   } catch (e) {

                   }

                   try {
                       LoadInfoDataFactory.loadPrevWinners().then(function (data) {
                           if (data.data.length > 0) {
                               $scope.prevWinners = data.data;
                           }

                       }, function () {
                       });
                   } catch (e) {

                   }
               };
           }])
    .factory('MainFactory', ['$resource', function ($resource) {
        return $resource('api/account', {}, {
            login: { method: 'POST' }
        })
    }])
    .factory('AccountStatusService', ['$http', function ($http) {
        var status = {};

        var _isPlayed = function (data) {
            return $http.get('/api/Account/Status', data).then(function (response) {
                return response;
            });
        }

        status.isPlayed = _isPlayed;

        return status;
    }])
     .factory('Test', ['$http', function ($http) {
         var test = {}

         var reg = function (data) {
             return $http.post('api/account/register').then(function (data) {
             });
         }

         test.Regs = reg;

         return test;
     }])
    .factory('LoadInfoDataFactory', ['$http', function ($http) {
        return {
            loadTime: function () {
                return $http.get('/api/general/loadTime');
            },
            loadPrizes: function (data) {
                return $http.get('/api/general/loadPrizes', data);
            },
            loadWinningCombinations: function (data) {
                return $http.get('/api/general/loadWinningCombinations', data);
            },
            getGlobalTime: function () {
                return $http.get('api/globalTime');
            },
            loadPrevWinners: function () {
                return $http.get('api/general/loadPrevWinners');
            },
            getTotalPrizesGivenAway: function () {
                return $http.get('api/playerProfile/getTotalPrizesGivenAway');
            }
        }
    }])
    .factory('LoadProfileFactory', ['$http', function ($http) {
        return {
            getCampaigns: function () {
                return $http.get('/api/campaign/getAllPublishedCampaigns');
            },
            getLatestCombination: function () {
                return $http.get('/api/combination/getPlayerCombination');
            },
            getStats: function () {
                return $http.get('/api/general/loadWinnerStatus');
            }
        }
    }])
    .filter('slice', function () {

        return function (arr, start, end) {
            return arr.slice(start, end);
        }
    });
