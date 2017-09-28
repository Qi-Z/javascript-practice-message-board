// Define module
var app = angular.module('myApp', ['ngRoute', 'ngCookies']);


// Config routing
// Controll is in scope when it's view is rendered.

/*
The resolve is very useful if we need to load some data upfront before the controller 
initialisation and rendering the view. In real world applications, 
the $timeout can be replaced with a $http object to load data from server. 
Since it’s an asynchronous event, we can always make sure that our view will be rendered with proper data.
*/
app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/', {
        templateUrl: 'partials/home.html',
        controller: 'HomeController',
        resolve: {
            // The returned value/promise is used by controller
            loggedIn: ['$q', '$location', '$window', checkLogin]
        }
    }).when('/login', {
        // If already logged in go to home
        templateUrl: 'partials/login.html',
        controller: 'LoginController',
        resolve: {
            loggedOut: ['$q', '$location', '$window', isLoggedout]
        }
    }).when('/register', {
        templateUrl: 'partials/signup.html',
        controller: 'RegisterController',
        resolve: {
            loggedOut: ['$q', '$location', '$window', isLoggedout]
        }
    }).when('/messages', {
        templateUrl: 'partials/messagelist.html',
        controller: 'MessageListController',
        resolve: {
            loggedIn: ['$q', '$location', '$window', checkLogin]
        }
    }).when('/sendmessage', {
        templateUrl: 'partials/sendmessage.html',
        controller: 'SendMessageController',
        resolve: {
            loggedIn: ['$q', '$location', '$window', checkLogin]
        }
    }).when('/profile', {
        templateUrl: 'partials/profile.html',
        controller: 'ProfileController',
        resolve: {
            loggedIn: ['$q', '$location', '$window', checkLogin]
        }
    }).otherwise({
        redirectTo: '/login'
    });
}]);

// Check login
function checkLogin($q, $location, $window) {
    var deferred = $q.defer();
    // Login check
    isLoggedin = $window.sessionStorage.getItem('is_logged_in');
    console.log('session string is');
    console.log(JSON.parse(isLoggedin));
    if (isLoggedin && JSON.parse(isLoggedin)) {
        deferred.resolve();
    } else {
        deferred.reject('Need to login first');
        $location.path('/login');
    }
    return deferred.promise;
}

function isLoggedout($q, $location, $window) {
    var deferred = $q.defer();
    // Login check
    isLoggedin = $window.sessionStorage.getItem('is_logged_in');
    console.log('cookie string is');
    console.log(JSON.parse(isLoggedin));
    if (isLoggedin && JSON.parse(isLoggedin)) {
        deferred.reject('You are already logged in');
        $location.path('/');
    } else {
        deferred.resolve();

    }
    return deferred.promise;
}

// Define controller with inline array annotation for dependencies
app.controller('HomeController', ['$scope', '$location', 'Users', HomeController]);
function HomeController($scope, $location, Users) {
    $scope.username = Users.getLoggedInUsername();
    $scope.user = Users.getUserByUsername($scope.username);
    $scope.goToProfile = function () {
        $location.path('/profile');
    };
    $scope.goToMessages = function () {
        $location.path('/messages');
    };
    $scope.logout = function () {
        Users.logout();
        $location.path('/login');
    }
}

app.controller('LoginController', ['$rootScope', '$scope', '$location', 'Users', LoginController]);
function LoginController($rootScope, $scope, $location, Users) {
    $scope.username = "";
    $scope.password = "";
    $scope.register = function () {
        $rootScope.username = $scope.username;
        $rootScope.password = $scope.password;
        $location.path('/register');
    };
    $scope.login = function () {
        Users.login($scope.username, $scope.password).then(
            function (user) {
                console.log("logged in with: ");
                console.log(user);
                $location.path('/');
            },
            function (err) {
                $scope.showError = true;
                $scope.errorMsg = err;
                console.log(err);
            }
        );

    };
    
}

app.controller('RegisterController', ['$rootScope', '$scope', 'Users', '$location', RegisterController]);
function RegisterController($rootScope, $scope, Users, $location) {
    $scope.username = $rootScope.username;
    $scope.password = $rootScope.password;
    $scope.register = function () {
        var user = {
            'username': $scope.username,
            'password': $scope.password,
            'firstname':$scope.firstname,
            'lastname': $scope.lastname,
            'location': $scope.location,
            'email': $scope.email,
            'gender': $scope.gender,
            'phone': $scope.phone,
            'messages': []
        };
        Users.addUser(user).then(
            function (data) {
                console.log(data);
                $location.path('/login');
            },
            function (err) {
                console.log(err);
            });
    }
}

app.controller('MessageListController', ['$scope','$cookies', 'Users', MessageListController]);
function MessageListController($scope, $cookies, Users) {
    $scope.username = Users.getLoggedInUsername();
    var user = Users.getUserByUsername($scope.username);
    $scope.messages = user.messages;
    $scope.msgStatus = []; // A boolean array keeping track of hide or show msg
    $scope.delete = function(index){
        var msgs = $scope.messages;
        msgs.splice(index, 1);
        Users.updateMessageInbox($scope.username, msgs).then(
            function(messages){
                $scope.messages = messages;
            },
            function(err){
                console.log(err);
            }
        );
    };
    $scope.flagAsImportant = function(index){
        var msgs = $scope.messages;
        msgs[index].isImportant = true;
        Users.updateMessageInbox($scope.username, msgs).then(
            function(messages){
                $scope.messages = messages;
            },
            function(err){
                console.log(err);
            }
        );
    };
    $scope.toggleImportant = function(index){
        var msgs = $scope.messages;
        msgs[index].isImportant = msgs[index].isImportant?false:true;
        Users.updateMessageInbox($scope.username, msgs).then(
            function(messages){
                $scope.messages = messages;
            },
            function(err){
                console.log(err);
            }
        );
    };
    $scope.showDetail = function(index){
        // Toggle
        $scope.msgStatus[index] = $scope.msgStatus[index]?false:true;
    }
}

app.controller('SendMessageController', ['$scope', 'Users', '$cookies', '$location', SendMessageController]);
function SendMessageController($scope, Users, $cookies, $location) {
    $scope.users = Users.getAllUsers();
    $scope.from = Users.getLoggedInUsername();
    $scope.send = function(){
        // TODO: add redirect after sending msg
        Users.sendMessage($scope.from, $scope.selectedUser, $scope.title, $scope.description).then(
            function(msg){
                console.log(msg);
                $location.path('/messages');
            },
            function(err){
                console.log(err);
            }
        );
    }

}

app.controller('ProfileController', ['$scope', '$cookies', 'Users', ProfileController]);
function ProfileController($scope, $cookies, Users) {
    $scope.username = Users.getLoggedInUsername();
    $scope.user = Users.getUserByUsername($scope.username);
    $scope.showError = false;
    $scope.updateSuccess = false;
    $scope.update = function(){
        // Don't mess up the messages array, only update user info
        // Username cannot be changed
        //TODO: username cannot be changed. Q: should pw be changed?
        Users.updateUserByUsername($scope.username, $scope.user).then(
            function(){
                $scope.updateSuccess = true;
            },
            function(){
                $scope.showError = true;
            }
        );
    }
}

// User service
app.factory('Users', ['$window', '$q', '$cookies', function ($window, $q, $cookies) {
    const userDB = $window.localStorage;
    const userDBIdx = "users";
    return {
        getLoggedInUsername: function(){
            return $window.sessionStorage.getItem('username');
        },
        isLoggedIn: function(){
            var loggedIn = $window.sessionStorage.getItem('is_logged_in');
            if(loggedIn && JSON.parse(loggedIn)) return true;
            return false;
        },
        getAllUsers: function () {
            var users = JSON.parse(userDB.getItem(userDBIdx));
            users = users ? users : [];
            return users;
        },
        getUserByUsername: function (username) {
            var users = JSON.parse(userDB.getItem(userDBIdx));
            users = users ? users : [];
            userslen = users.length;
            for (var i = 0; i < users.length; i++) {
                if (users[i].username == username) {
                    return users[i];
                }
            }
            return null;
        },
        addUser: function (User) {
            // Consider returning promise
            console.log('add user');
            var users = JSON.parse(userDB.getItem(userDBIdx));
            users = users ? users : [];
            var deferred = $q.defer();
            var user = this.getUserByUsername(User.username)
            if (user) {
                deferred.reject('Username is already used!');
            } else {
                users.push(User);
                userDB.setItem(userDBIdx, JSON.stringify(users));
                deferred.resolve(User);
            }
            return deferred.promise;
        },
        login: function (username, password) {
            console.log('log in: ' + username + ' ' + password);
            // Check both password and username
            var user = this.getUserByUsername(username);
            var deferred = $q.defer();
            if (user && user.password === password) {
                deferred.resolve(user);
                // Add items in session storage. Flag for login status, username for the logged in user
                // $cookies.put('is_logged_in', JSON.stringify(true));
                // $cookies.put('username', username);
                $window.sessionStorage.setItem('is_logged_in', JSON.stringify(true));
                $window.sessionStorage.setItem('username', username);
            } else {
                deferred.reject('Username or Password Incorrect');
            }

            return deferred.promise;

        },
        logout: function () {
            // $cookies.put('is_logged_in', JSON.stringify(false));
            // $cookies.remove('username');
            $window.sessionStorage.setItem('is_logged_in', JSON.stringify(false));
            $window.sessionStorage.removeItem('username');
        },
        deleteUserByUsername: function (username) {
            var users = JSON.parse(userDB.getItem(userDBIdx));
            users = users ? users : [];
            userslen = users.length;
            for (var i = 0; i < users.length; i++) {
                if (users[i].username == username) {
                    users.splice(i, 1);
                    userDB.setItem(userDBIdx, JSON.stringify(users));
                    return;
                }
            }
        },
        
        updateUserByUsername: function (username, User) {
            // This function will not modify message array
            var users = JSON.parse(userDB.getItem(userDBIdx));
            users = users ? users : [];
            userslen = users.length;
            var deferred = $q.defer();
            var found = false;
            for (var i = 0; i < users.length; i++) {
                if (users[i].username == username) {
                    // TODO: think about if we need to replace password
                    var messages = users[i].messages;
                    users[i] = User;
                    users[i].messages = messages;
                    found = true;
                    break;
                }
            }
            if (found) {
                userDB.setItem(userDBIdx, JSON.stringify(users));
                deferred.resolve(User);
            } else {
                deferred.reject('User not found');
            }
            return deferred.promise;
        },

        sendMessage: function (from, to, title, description) {
            // TODO: store all msg sent and received?
            var msg = {
                'from': from,
                'to': to,
                'title': title,
                'description': description,
                'dateCreated': new Date(),
                'isImportant': false
            };
            var users = JSON.parse(userDB.getItem(userDBIdx));
            users = users ? users : [];
            userslen = users.length;
            var deferred = $q.defer();
            var found = false;
            for (var i = 0; i < users.length; i++) {
                if (users[i].username == to) {
                    users[i].messages = users[i].messages?users[i].messages:[];
                    users[i].messages.push(msg);
                    found = true;
                    break;
                }
            }
            if (found) {
                userDB.setItem(userDBIdx, JSON.stringify(users));
                deferred.resolve(msg);
            } else {
                deferred.reject('Fail to send message');
            }
            return deferred.promise;
        },
        // TODO: in template, do track by index, then use splice to remove msg
        updateMessageInbox: function (username, messages) {
            var deferred = $q.defer();
            var users = JSON.parse(userDB.getItem(userDBIdx));
            users = users ? users : [];
            userslen = users.length;
            var updated = false;
            for (var i = 0; i < users.length; i++) {
                if (users[i].username == username) {
                    users[i].messages = messages;
                    userDB.setItem(userDBIdx, JSON.stringify(users));
                    updated = true;
                    deferred.resolve(messages);
                }
            }
            if(!updated) deferred.reject("Fail to update message inbox!");
            return deferred.promise;
        }

    };
}]);

// TODO: finish this directive
// Message card directive. As a reusable component, we normally have isolated scope
// camelCase => kebab-case
app.directive('messageCard', [function(){
    function link(scope, element, attrs){
        console.log(attrs);
    }
    
    // Return the directive definition
    return {
        restrict: 'E', // E for element, A for attribute, C for class, C for comment
        template: '<div> Msg Card</div>',
        scope: {
            ondelete: '&ondelete',
            index: '<index',
            message:'=' 
        },
        link: link
    };
}]);