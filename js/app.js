function safeApply(scope, fn) {
      (scope.$$phase || scope.$root.$$phase) ? fn() : scope.$apply(fn);
}

var colazo = angular.module('colazo', []);
colazo.config(['$compileProvider', function($compileProvider) {

      $compileProvider.urlSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel):/);
}]);

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
  when('/About', {templateUrl: 'partials/about.html', controller: AboutCtrl}).
  otherwise({redirectTo: '/index'});
}]);

function HomeCtrl($scope) {

  last_version = localStorage["last_version"] || 0;

  if (version > last_version) {

    navigator.notification.alert("¿Qué hay de nuevo?", function() {}, "Version 2.0:\n\nCon esta versión empeza la fusión de Colazo con el bicimapa.\n\n* BiciMapa:\n  - Integración con el bicimapa\n\n* BiciEventos:\n  - Ver los eventos bicicleteros de Bogotá (gracías a la gran rodada)" , "OK");

    localStorage["last_version"] = version;
  }


  user = angular.fromJson(localStorage["user"]);

  if(user != undefined) {
    $scope.greeter = user.first_names;
    $scope.emergency_contact = user.emergency_contact;
  }
  else {
    $scope.greeter = "usuario de Colazo!";
  }

}

function BiciSeguraCtrl($scope, $location) {

  var options = new ContactFindOptions();
  options.filter = "";
  options.multiple = true; 
  filter = ["displayName", "phoneNumbers"];
  navigator.contacts.find(filter, onSuccess, onError, options);

  function onSuccess(contacts) {

    safeApply($scope, function() {
      $scope.values = [];

      for (i = 0; i < contacts.length; i++) {

        if(contacts[i].phoneNumbers == null)
          continue;

        for (j = 0; j < contacts[i].phoneNumbers.length; j++) {
          $scope.values.push(
            {
              displayName: contacts[i].displayName + ' - ' + contacts[i].phoneNumbers[j].value,
              phoneNumber: contacts[i].phoneNumbers[j].value,
            });
        }
      }

      $scope.values.sort();

    });

    $('#loading').hide();
  }



  function onError(contactError) {
    alert('onError!');
  };


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
      emergency_contact: $scope.emergency_contact
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
    $scope.emergency_contact = user.emergency_contact;
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

  $scope.on_event_clicked = function(data) {

      navigator.notification.alert(data.description, function() {}, "Detalle del evento" , "OK");

  }

  moment.lang('es');
  var now = moment().format("YYYY-MM-DDTHH:mm:ssZ");

  $http.get('https://www.googleapis.com/calendar/v3/calendars/lagranrodada%40gmail.com/events?orderBy=startTime&timeMin='+now+'&singleEvents=true&maxResults=20&key=AIzaSyAhqZbO7lifEGVyEt5nVN8KFlKf6mYB79Y').success(function(data, status, headers, config) {


    for (i = 0; i < data.items.length; i++) {

      if (data.items[i].description && data.items[i].description.length > 120) {

        data.items[i].shortdescription = data.items[i].description.substring(0, 120) + "...";

      }
      else {

        data.items[i].shortdescription = data.items[i].description;

      }
    
      if ("date" in data.items[i].start) data.items[i].start = moment(data.items[i].start.date).format("DD MMM YYYY HH:mm");
      else if ("dateTime" in data.items[i].start) data.items[i].start = moment(data.items[i].start.dateTime).format("DD MMM YYYY HH:mm");
    

    }

    $scope.events = data.items;

    $('#loading').hide();

  });

}

function BiciMapaCtrl($scope, $http, $route) {

  $scope.$on('$routeChangeStart', function(scope, next, current){

    $('#view').addClass('container');

    $('body').css('padding-top', 50);
    $('nav').addClass('navbar-fixed-top');
  });

  $('#view').removeClass('container');

  $('body').css('padding-top', 0);
  $('nav').removeClass('navbar-fixed-top');
  $('nav').css('margin-bottom', 0);

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

    icon_repair = L.icon({iconUrl: "images/taller.png", iconAnchor: [16, 37]});
  icon_parking = L.icon({iconUrl: "images/parqueadero.png", iconAnchor: [16, 37]});
  icon_theft = L.icon({iconUrl: "images/atencion.png", iconAnchor: [16, 37]});
  icon_info = L.icon({iconUrl: "images/atencion.png", iconAnchor: [16, 37]});
  icon_shop = L.icon({iconUrl: "images/tienda.png", iconAnchor: [16, 37]});

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

  $('#loading').hide();

  });

}

function AboutCtrl() {

}
