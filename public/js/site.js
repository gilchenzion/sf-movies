( function($) {
	var Locations = Backbone.Collection.extend({
		url: '/api/movies'
	});

	var AppView = Backbone.View.extend({
		el: $(window),
		events: {
			'resize': 'fitMap'
		},

		initialize: function() {
			_.bindAll(this, 'render', 'loadMap', 'fitMap');
			this.collection = new Locations();
			this.render();
		},

		render: function() {
			this.fitMap();
        	this.loadMap();
        	//this.el.bind('resize', this.fitMap);
		},

		loadMap: function() {
			geocoder = new google.maps.Geocoder();
			var mapOptions = {
				// taken from http://www.nationsonline.org/oneworld/map/google_map_San_Francisco.htm
          		center: new google.maps.LatLng(37.59870580866572, -122.35850703613276),
          		zoom: 8
        	};
        	var map = new google.maps.Map($('.movie-map')[0], mapOptions);
        	this.collection.fetch({
        		success: function(res) {
        			for(var i = 0; i < res.length; i++) {
        				var loc = res.models[0].attributes.locations;
        				setTimeout(function(){
        					geocoder.geocode({ 'address' : loc }, function(results, status) {
        						if (status == google.maps.GeocoderStatus.OK) {
    							  var marker = new google.maps.Marker({
    							      map: map,
    							      position: results[0].geometry.location
    							  });
    							} else {
    							  alert('Geocode was not successful for the following reason: ' + status);
    							}
        					});
        				}, 2000);
        			}
        		}
        	})
		},

		fitMap: function() {
			var h = this.el.height()
			$('.movie-map').height(h);
		}
	});
	
	var appView = new AppView();
})(jQuery);