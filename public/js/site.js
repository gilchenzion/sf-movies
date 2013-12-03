( function($) {	

var markers = [];

var Marker = Backbone.Model.extend({
	urlRoot: '/api/movies'
});

var Locations = Backbone.Collection.extend({
	url: '/api/movies'
});

var SearchView = Backbone.View.extend({});

var MarkerView = Backbone.View.extend({
	tagName: "li",
	initialize: function(options) {

		var that = this;

		_.bindAll(this, 'getLoc', 'addMarker', 'showinfo');

		that.model = options.model;

		that.map = options.map;

		that.geocoder = new google.maps.Geocoder();
		that.loc = that.model.get("locations");
		//console.log(that.loc);
		if(that.loc != "") {
			that.getLoc();
		} else {
			//if Location is null :) :) :0
		}
	},

	getLoc: function() {
		var that = this;
		if(that.model.get("lat") == 200 || that.model.get("lon") == 200) {
			that.geocoder.geocode({ 'address' : that.loc + ", San Francisco, CA" }, function(results, status) {
       			if (status == google.maps.GeocoderStatus.OK) {
    			  	that.addMarker(results[0].geometry.location);
    			  	that.model.save({
    			  		lat: results[0].geometry.location.ob,
    			  		lon: results[0].geometry.location.pb
    			  	});
    			} else if(status == google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
    				setTimeout(function() { that.getLoc() }, (600 * 3));
    			} else {
    			  	console.log('Geocode was not successful for the following reason: ' + status);

    			}
       		});
		} else {
			that.addMarker(new google.maps.LatLng(that.model.get("lat"),that.model.get("lon")))    		
		}
	},

	addMarker: function(latlang) {
		var that = this;
		that.marker = new google.maps.Marker({
    		map: that.map,
    		position: latlang,
    		title: that.model.get("locations")
    	});

    	that.infowindow = new google.maps.InfoWindow({
    		content: that.model.get("title")
    	});

    	

    	google.maps.event.addListener(that.marker, 'click', that.showinfo);
    	//google.maps.event.addListener(that.marker, 'closeclick', that.close);
	},

	showinfo: function() {
		that = this;
		that.infowindow.open(that.map, that.marker);
	},

	close: function() {
		that = this;
		that.infowindow.close(that.map, that.marker);
	}

});

var AppView = Backbone.View.extend({
	el: $(window),
	events: {
		'resize': 'fitWindow',
		'click button': 'search'
	},

	initialize: function() {
		_.bindAll(this, 'render', 'loadMap', 'fitWindow');
		this.collection = new Locations();
		this.render();
	},

	render: function() {
		this.fitWindow();
       	this.loadMap();
	},

	loadMap: function() {
		
		var mapOptions = {
			// taken from http://www.nationsonline.org/oneworld/map/google_map_San_Francisco.htm
         		center: new google.maps.LatLng(37.59870580866572, -122.35850703613276),
         		zoom: 10
       	};
       	var map = new google.maps.Map($('.movie-map')[0], mapOptions);
       	this.map = map;

       	var that = this;
       	//
       	this.collection.fetch({
       		success: function(res) {

       			
       			var titles = {
       				"keys": []
       			};
       			for(var i = 0; i < res.length; i++) {
       				var markerView = new MarkerView({ model: res.models[i], map: map});
       				markers.push(markerView);
       				if(titles[res.models[i].attributes.title] == null) {
       					titles[res.models[i].attributes.title] = 1;
       					titles["keys"].push(res.models[i].attributes.title);
       				}		
       			}

       			$( ".auto-search" ).autocomplete({
      				source: titles["keys"],
      				appendTo: ".results"
    			});
       		}
       	});
	},

	fitWindow: function() {
		var h = this.el.height()
		$('.movie-map').height(h);
	},

	search: function() {
		var term = $('.auto-search').val();
		for(var i = 0; i < markers.length; i++) {
			if(markers[i].marker != null) {
				console.log("hi");
				if(markers[i].model.get("title") == term) {
					markers[i].marker.setMap(this.map);
				} else {
					markers[i].marker.setMap(null);
				}
			}
			
		}
	}
});

// Load App when DOM ready
var appView = null;

	appView = new AppView();
})(jQuery);