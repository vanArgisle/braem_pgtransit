angular.module('starter.controllers').controller("RouteStopsCtrl", function ($scope, $state, $ionicHistory, $ionicLoading, $ionicSideMenuDelegate, routeService, shareService, favouritesService, shapeService, stopService)
{
  $ionicSideMenuDelegate.canDragContent(false);

  $scope.gotoSchedule = function()
  {
    $ionicHistory.nextViewOptions({disableBack: true});
    $state.go('app.scheduleTimes');
  }

  $scope.gotoMap = function()
  {
    $ionicHistory.nextViewOptions({disableBack: true});
    $state.go('app.routeMap');
  }

  $scope.editFavourite = function (c)//Adds/removes favourite route.
  {
    if (favouritesService.hasItem(c))
    {
      favouritesService.removeItem(c);
      favouritesService.saveFavs();
      $ionicLoading.show(
      {
        template: c.name + ' removed from favourites.',
        duration: 1000
      })
    }
    else
    {
      favouritesService.setFavourite(c);
      favouritesService.saveFavs();
      $ionicLoading.show(
        {
          template: c.name + ' added to favourites.',
          duration: 1000
        });
    }
  };

  var markers = [];
  $scope.addMarker = function(stop)
  {
    //Check if stop is allready a marker
    if (markers.indexOf(stop.stop_id) == -1)
    {
      markers.push(stop.stop_id)
      $scope.createMarker(stop)
    }
  }


	$scope.stops = [];
	var shapes = [];
	$scope.routeName = shareService.getRouteName();
	$scope.routeShort = shareService.getRouteShort();
	$scope.routeLong = shareService.getRouteLong();

	//If page is blank go home
  if($scope.routeName == null)
  {
    $ionicHistory.nextViewOptions({disableBack: true});
    $state.go('app.home');
  }

  var promise1 = stopService.getNewstop($scope.routeShort);
  promise1.then(function (data1)
  {
    $scope.stops = data1.data;
  })

  var promise2 = shapeService.getShapes($scope.routeShort);
  promise2.then(function (data2)
  {
    shapes = data2.data;
  })

  //$ionicLoading.show({duration:3000})

  .then(function()
	{
		var lat = 0;
		var lon = 0;
		for (var i=0; i < $scope.stops.length; i++)
    {
      lat = lat + $scope.stops[i].stop_lat;
      lon = lon + $scope.stops[i].stop_lon;
    }
    lat = lat / $scope.stops.length;
    lon = lon / $scope.stops.length;

		var latLon = new google.maps.LatLng(lat, lon);

		var mapOptions =
		{
			center: latLon,
			zoom: 12,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			liteMode: true,
			disableDefaultUI: true
		}

		var map = new google.maps.Map(document.getElementById("routemap"), mapOptions);

		//Add other Bus Stop Markers
		var infoWindow = new google.maps.InfoWindow();

		$scope.createMarker = function (info)
		{
			var marker = new google.maps.Marker(
			{
				position: new google.maps.LatLng(info.stop_lat, info.stop_lon),
				map: map,
				animation: google.maps.Animation.DROP,
				title: info.stop_name,
				icon: 'http://maps.google.com/mapfiles/ms/micons/bus.png',
				optimized: false
			});
			google.maps.event.addListener(marker, 'click', function()
			{
				infoWindow.setContent(marker.title);
				infoWindow.open($scope.map, marker)
			});
		}

		var poly = new google.maps.Polyline(
		{
      path: shapes,
      strokeColor: '#387ef5',
      strokeOpacity: 0.6,
      strokeWeight: 2
		}).setMap(map)
	})
});