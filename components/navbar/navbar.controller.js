'use strict';

angular.module('gotChamp')
  .controller('NavbarCtrl', ['$scope', '$rootScope', '$injector', '$location', 'localStorageService', '$http', 'authService', 'ProfileFactory', 'toastr', '$window', function ($scope, $rootScope, $injector, $location, localStorageService, $http, authService, ProfileFactory, toastr, $window) {
      //// Function called if AdBlock is not detected
      //function adBlockNotDetected() {
      //    //alert('AdBlock is not enabled');
      //}
      //// Function called if AdBlock is detected
      //function adBlockDetected() {
      //    alert('Adblockによってブロックされています。ゲームをプレイするにはブロック除外リストにガチャンプを登録をお願い致します。\n※決して不快な広告などはございませんので、ご安心ください');
      //}

      //// Recommended audit because AdBlock lock the file 'fuckadblock.js' 
      //// If the file is not called, the variable does not exist 'fuckAdBlock'
      //// This means that AdBlock is present
      //if (typeof fuckAdBlock === 'undefined') {
      //    adBlockDetected();
      //} else {
      //    fuckAdBlock.onDetected(adBlockDetected);
      //    fuckAdBlock.onNotDetected(adBlockNotDetected);
      //    // and|or
      //    fuckAdBlock.on(true, adBlockDetected);
      //    fuckAdBlock.on(false, adBlockNotDetected);
      //    // and|or
      //    fuckAdBlock.on(true, adBlockDetected).onNotDetected(adBlockNotDetected);
      //}

      $scope.navbarInit = function () {
          $scope.date = new Date();
          $scope.latestCombination = "0-0-0-0-0-0-0";

          getAuth();

          if ($scope.authentication.isAuth) {
              $scope.loadLatestCombination();
          }

          changeTemplate();
      };

      $window.onresize = function () {
          changeTemplate();
          //   console.log($scope.showNavbar);
      };

      function changeTemplate() {
          var screenWidth = $window.innerWidth;
          if (screenWidth <= 800) {
              $scope.showNavbar = false;
          }
          else if (screenWidth > 800) {
              $scope.showNavbar = true;
          }
      }

      var getAuth = function () {
          authService.fillAuthData();
          $scope.authentication = authService.authentication;
      };

      $scope.date = new Date();
      $scope.latestCombination = "0-0-0-0-0-0-0";

      $scope.toggle = function () {
          $('.user-setting').toggleClass('open');

          var userData = localStorageService.get('authorizationData');
          if (userData) {
              $scope.userName = userData.username;
              if (userData.imgPath != '') {
                  $('#navbarPhoto').css({
                      'width': '60px',
                      'height': '60px'
                  });
                  $('#navbarPhoto').attr('src', userData.imgPath);
              }
          }
      }


      $scope.signOut = function () {
          localStorageService.remove('authorizationData');
          localStorageService.remove('combinationNumberData');
          localStorageService.remove('hasPlayed');
          getAuth();
          $('.user-setting').removeClass('open');
          ProfileFactory.playerLogOut().success(function () {
              $window.open('#/login', '_self');
              //$window.location.href = "#/login";
          });

          //  $location.path('/login');
      };

      /*
      $scope.getLocation = function() {
          if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(showPosition);
          } else { 
              toastr.error("Geolocation is not suppported on your browser.");
          }
      };
      */

      function showPosition(position) {
          var latlong = position.coords.latitude + ', ' + position.coords.longitude;
          var apiKey = "AIzaSyB_myO051KClGxXvMku_d5JA3r_0VUfgzo";

          $.ajax({
              url: 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' + latlong + '&location_type=ROOFTOP&result_type=street_address&key=' + apiKey + '',
              type: 'GET',
              crossDomain: true,
              dataType: 'json',
              success: function (data) {
                  var components = data.results[0].address_components;
                  $rootScope.currentLocation = {
                      byGeo: {
                          name: components[components.length - 1].long_name,
                          code: components[components.length - 1].short_name,
                          region: components[components.length - 2].long_name,
                          city: components[components.length - 3].long_name
                      }
                      //, 
                      //biIP : {
                      //    name : geoplugin_countryName(),
                      //    code : geoplugin_countryCode(),
                      //    region : geoplugin_region(),
                      //    city : geoplugin_city()
                      //}
                  };
              },
              error: function (error) {
                  //console.log(error);
              }
          });

          //         $http.get('https://maps.googleapis.com/maps/api/geocode/json?latlng=' + latlong +  '&location_type=ROOFTOP&result_type=street_address&key=' + apiKey + '')
          //          .success(function(data) {
          ////            console.log(data.results);
          //            var components = data.results[0].address_components;
          //            $rootScope.currentLocation = {
          //                byGeo : {
          //                    name : components[components.length - 1].long_name,
          //                    code : components[components.length - 1].short_name,
          //                    region : components[components.length - 2].long_name,
          //                    city : components[components.length - 3].long_name
          //                }
          //               //, 
          //                //biIP : {
          //                //    name : geoplugin_countryName(),
          //                //    code : geoplugin_countryCode(),
          //                //    region : geoplugin_region(),
          //                //    city : geoplugin_city()
          //                //}
          //          };
          //          }).error(function(error) {
          //            console.log(error);
          //          });
      }

      $scope.loadLatestCombination = function () {
          try {
              var userData = localStorageService.get('authorizationData');

              ProfileFactory.getLatestCombination().success(function (data) {

                  if (typeof data.Combination != 'undefined') {
                      $scope.latestCombination = data.Combination;
                  }
                  else {
                      $scope.latestCombination = "本日はまだプレイされておりません。";
                  }

              }).error(function (err) {
                  $scope.latestCombination = "エントリー番号を受理することが出来ませんでした。";
              });
          } catch (e) {
              //console.log(e);
          }
      };

      //      alert("Your location is: " + geoplugin_countryName() + ", " + geoplugin_region() + ", " + geoplugin_city());
  }])
.factory('ProfileFactory', ['$http', function ($http) {
    return {
        getLatestCombination: function () {
            return $http.get('/api/combination/getPlayerCombination');
        },
        playerLogOut: function () {
            return $http.post('/api/account/logout');
        }
    }
}]);
