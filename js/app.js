var colazo = angular.module('colazo', []);

colazo.config(['$routeProvider', function($routeProvider) {
  $routeProvider.
  when('/index', {templateUrl: 'partials/index.html',   controller: HomeCtrl}).
  when('/BiciRevision', {templateUrl: 'partials/bicirevision.html', controller: BiciRevisionCtrl}).
  when('/history/:bicycleID', {templateUrl: 'partials/view_history.html', controller: ViewHistoryCtrl}).
  when('/bicycle/:bicycleID', {templateUrl: 'partials/view_bicycle.html', controller: ViewBicycleCtrl}).
  when('/part/:partID', {templateUrl: 'partials/view_part.html', controller: ViewPartCtrl}).
  when('/add_bicycle', {templateUrl: 'partials/add_bicycle.html', controller: AddBicycleCtrl}).
  when('/add_part/:bicycleID', {templateUrl: 'partials/add_part.html', controller: AddPartCtrl}).
  when('/add_log/:partID', {templateUrl: 'partials/add_log.html', controller: AddLogCtrl}).
  when('/BiciSegura', {templateUrl: 'partials/bicisegura.html', controller: BiciSeguraCtrl}).
  when('/BiciMapa', {templateUrl: 'partials/bicimapa.html', controller: BiciMapaCtrl}).
  when('/BiciEventos', {templateUrl: 'partials/bicieventos.html', controller: BiciEventosCtrl}).
  when('/Lockscreen', {templateUrl: 'partials/lockscreen.html', controller: LockscreenCtrl}).
  otherwise({redirectTo: '/index'});
}]);

function HomeCtrl($scope) {

  user = angular.fromJson(localStorage["user"]);

  if(user != undefined)
    $scope.greeter = user.first_names;
  else
    $scope.greeter = "usuario de Colazo!";
}

function BiciSeguraCtrl($scope, $location) {

  user = angular.fromJson(localStorage["user"]);

  if (user != undefined) {

    $scope.first_names = user.first_names;
    $scope.last_names = user.last_names;
    $scope.cedula = user.cedula;
    $scope.RH = user.RH;
  }

  $scope.save = function() {

    user = {
      first_names: $scope.first_names,
      last_names: $scope.last_names,
      cedula: $scope.cedula,
      RH: $scope.RH,
    }

    localStorage["user"] = angular.toJson(user);

    $location.path('/index');
  }
}

function LockscreenCtrl($scope) {

  user = angular.fromJson(localStorage["user"]);

  if (user != undefined) {

    $scope.first_names = user.first_names || "Undefinido";
    $scope.last_names = user.last_names || "Undefinido";
    $scope.cedula = user.cedula || "Undefinido";
    $scope.RH = user.RH || "Undefinido";
  }
  else {

    $scope.first_names = "Undefinido";
    $scope.last_names = "Undefinido";
    $scope.cedula = "Undefinido";
    $scope.RH = "Undefinido";
  }
}

function BiciRevisionCtrl($scope) {

  $scope.bicycles = angular.fromJson(localStorage["bicycles"]) || [];
}

function AddBicycleCtrl($scope, $location) {

  $scope.choose_photo = function() {

    navigator.camera.getPicture(onSuccess, onFail, { quality: 50,
      destinationType: Camera.DestinationType.DATA_URL
    });

    function onSuccess(imageData) {
      // TODO change to base64
      $('#photo').attr('src', 'data:image/jpeg;base64,' + imageData);
    }

    function onFail(message) {
      alert('Failed because: ' + message);
    }

  }

  $scope.save = function() {

    bicycles = angular.fromJson(localStorage["bicycles"]) || [];	

    bicycle = {
      ID: new Date().getTime(),
      description: $scope.description,
      photo: $('#photo').attr('src')
    };

    bicycles.push(bicycle);

    localStorage["bicycles"] = angular.toJson(bicycles);

    $location.path('/BiciRevision');
  }

}

function ViewBicycleCtrl($scope, $routeParams) {

  bicycles = angular.fromJson(localStorage["bicycles"]) || [];


  ID = $routeParams["bicycleID"];

  function findByID(array, ID) {

    for(i = 0; i < array.length; i++)
      if (array[i].ID == ID) return i;

  }

  $scope.bicycle = bicycles[findByID(bicycles, ID)];
  $scope.parts = angular.fromJson(localStorage["parts"]) || [];
}

function AddPartCtrl($scope, $routeParams, $location) {

  bicycleID = $routeParams["bicycleID"];

  $scope.save = function() {

    parts = angular.fromJson(localStorage["parts"]) || [];	

    part = {
      ID: new Date().getTime(),
      name: $scope.name,
      bicycleID: bicycleID
    };


    parts.push(part);

    localStorage["parts"] = angular.toJson(parts);

    $location.path('/bicycle/'+bicycleID);
  }

}


function ViewPartCtrl($scope, $routeParams) {

  parts = angular.fromJson(localStorage["parts"]) || [];

  partID = $routeParams["partID"];

  function findByID(array, ID) {

    for(i = 0; i < array.length; i++)
      if (array[i].ID == ID) return i;

  }

  $scope.part = parts[findByID(parts, partID)];
  $scope.logs = angular.fromJson(localStorage["logs"]) || [];
}

function AddLogCtrl($scope, $routeParams, $location) {

  partID = $routeParams["partID"];

  $scope.save = function() {

    logs = angular.fromJson(localStorage["logs"]) || [];

    log = {
      ID: new Date().getTime(),
      description: $scope.description,
      reason: $scope.reason,
      cost: $scope.cost,
      date: $scope.date,
      partID: partID
    };


    logs.push(log);

    localStorage["logs"] = angular.toJson(logs);

    $location.path('/part/'+partID);
  }


}

function ViewHistoryCtrl($scope, $routeParams, $filter, $log) {


  bicycleID = $routeParams["bicycleID"];

  parts = angular.fromJson(localStorage["parts"]) || [];
  parts = $filter('filter')(parts, {bicycleID: bicycleID});

  logs = angular.fromJson(localStorage["logs"]) || [];
  $scope.logs = $filter('filter')(logs, function(item) {

    for(i = 0; i < parts.length; i++)
    if (parts[i].ID == item.partID) return true;

  return false;
  });

  $scope.total = 0;
  for(i = 0; i < $scope.logs.length; i++)
    $scope.total += $scope.logs[i].cost;

}

function BiciEventosCtrl($scope, $http) {

  $http.get('http://colazo.eu01.aws.af.cm/events.json').success(function(data, status, headers, config) {


    $scope.events = data;


});

}

function BiciMapaCtrl($scope, $http, $route) {

  $scope.$on('$routeChangeStart', function(scope, next, current){

    $('#view').addClass('container');

  });

  $('#view').removeClass('container');

  $('#map').width(window.innerWidth);
  $('#map').height(window.innerHeight - 50);


  // set up the map
  map = new L.Map('map');

  // create the tile layer with correct attribution
  var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  var osmAttrib='Map data © OpenStreetMap contributors';
  var osm = new L.TileLayer(osmUrl, {attribution: osmAttrib});		

  // start the map in South-East England
  map.setView(new L.LatLng(4.669, -74.100), 11);
  map.addLayer(osm);

  $('#map').width(window.innerWidth);
  $('#map').height(window.innerHeight);


  $http.get('http://colazo.eu01.aws.af.cm/places.json').success(function(data, status, headers, config) {

    icon_repair = L.icon({iconUrl: "images/repair.png", iconAnchor: [16, 37]});
  icon_parking = L.icon({iconUrl: "images/parking_bicycle-2.png", iconAnchor: [16, 37]});
  icon_theft = L.icon({iconUrl: "images/theft.png", iconAnchor: [16, 37]});
  icon_info = L.icon({iconUrl: "images/info.png", iconAnchor: [16, 37]});
  icon_shop = L.icon({iconUrl: "images/bicycle_shop.png", iconAnchor: [16, 37]});

  for(i = 0; i < data.length; i++) {

    if (data[i].category.toUpperCase() == "INFO".toUpperCase()) {
      icon = icon_info;
    }
    else if (data[i].category.toUpperCase() == "TALLER".toUpperCase()) {
      icon = icon_repair;
    }
    else if (data[i].category.toUpperCase() == "PELIGRO".toUpperCase()) {
      icon = icon_theft;
    }
    else if (data[i].category.toUpperCase() == "PARQUEADERO".toUpperCase()) {
      icon = icon_parking;
    }
    else if (data[i].category.toUpperCase() == "TIENDA".toUpperCase()) {
      icon = icon_shop;
    }
    else {
      icon = L.Icon.Default;
    }

    L.marker([data[i].latitude, data[i].longitude], {icon: icon}).addTo(map);

  }


});

}