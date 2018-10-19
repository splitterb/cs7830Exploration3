/* Use jQuery to load firebase */
$.getScript('https://www.gstatic.com/firebasejs/5.5.2/firebase.js', function () {

    // Initialize Firebase
    var config = {
        apiKey: "AIzaSyBHmpe8dV_Jz3fu4VdJPr_zYUvoCSrUN4o",
        authDomain: "cs7830-exploration2.firebaseapp.com",
        databaseURL: "https://cs7830-exploration2.firebaseio.com",
        projectId: "cs7830-exploration2",
        storageBucket: "cs7830-exploration2.appspot.com",
        messagingSenderId: "726597685669"
    };
    var app = firebase.initializeApp(config);

});

// Injext ngSanitize as a dependency so we can use html script within our AngularJS text (mainly used for easily inserting breaks)
angular.module('signInApp', ['ngSanitize'])
    .controller('signInCtrl', function ($scope) {

        $scope.fullName = "";
        $scope.code = "";
        $scope.date = "";
        $scope.success = false;
        $scope.resultText = "";
        $scope.listOfNames = [];


        $scope.getLocation = function () {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition($scope.showPosition, $scope.showError);
            } else {
                $scope.resultText = "Geolocation is not supported by this browser.";
            }
            $scope.$apply();
        };

        $scope.showPosition = function (position) {
            if ($scope.withinRadius(position.coords.latitude, position.coords.longitude, 38.946269, -92.326923, 5)) {
                $scope.resultText = "You Successfully Signed In!!!! </br></br>Your Coordinates Are:</br><b>Latitude:</b> " + position.coords.latitude + "</br><b>Longitude:</b> " + position.coords.longitude;
                $scope.$digest();

                var fullName = $scope.fullName;
                var code = $scope.code;

                //call function to write user data
                $scope.signInToMeeting(fullName, code);

                $scope.fullName = "";
                $scope.code = "";
            } else {
                $scope.resultText = "You are too far away to sign-in to the meeting.";
            }

        };

        $scope.showError = function (error) {
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    $scope.resultText = "User denied the request for Geolocation."
                    break;
                case error.POSITION_UNAVAILABLE:
                    $scope.resultText = "Location information is unavailable."
                    break;
                case error.TIMEOUT:
                    $scope.resultText = "The request to get user location timed out."
                    break;
                case error.UNKNOWN_ERROR:
                    $scope.resultText = "An unknown error occurred."
                    break;
            }
            $scope.$apply();
        };

        /**
         * is One Point within Another
         * @param point {Object} {latitude: Number, longitude: Number}
         * @param interest {Object} {latitude: Number, longitude: Number}
         * @param kms {Number}
         * @returns {boolean}
         */
        $scope.withinRadius = function (pointLatitude, pointLongitude, interestLatitude, interestLongitude, kms) {
            'use strict';
            let R = 6371;
            let deg2rad = (n) => {
                return (n * (Math.PI / 180))
            };

            let dLat = deg2rad(interestLatitude - pointLatitude);
            let dLon = deg2rad(interestLongitude - pointLongitude);

            let a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(deg2rad(pointLatitude)) * Math.cos(deg2rad(interestLatitude)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
            let c = 2 * Math.asin(Math.sqrt(a));
            let d = R * c;
            return (d <= kms);
        };

        $scope.signInToMeeting = function (name, code) {
            var d = new Date();
            var date = d.getMonth() + 1 + "-" + d.getDate();

            //specify path to take for storing data
            var ref = firebase.database().ref('/' + date);

            var signInTime = d.getHours() + ":" + d.getMinutes();

            var obj = {
                name: name,
                code: code,
                signInTime: signInTime
            }

            ref.push(obj);
        };

        $scope.viewSignIn = function () {
            var date = $scope.date;

            //specify path to take for storing data
            var ref = firebase.database().ref('/' + date);

            ref.once('value', function (snapshot) {
                snapshot.forEach(function (childSnapshot) {
                    var childKey = childSnapshot.key;
                    var childData = childSnapshot.val();

                    $scope.$apply();
                    $scope.listOfNames.push({
                        name: childData.name
                    });

                });
            });
            $scope.date = "";
        };

    });
