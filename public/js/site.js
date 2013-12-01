( function($) {	

var Marker = Backbone.Model.extend({
	urlRoot: '/api/movies'
});

var Locations = Backbone.Collection.extend({
	url: '/api/movies'
});

var SearchView = Backbone.View.extend({});

var num = 0;
var MarkerView = Backbone.View.extend({
	tagName: "li",
	initialize: function(options) {

		var that = this;

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
    			  	var marker = new google.maps.Marker({
    			      	map: that.map,
    			      	position: results[0].geometry.location,
    			      	title: that.model.get("locations")
    			  	});
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
			var marker = new google.maps.Marker({
    			map: that.map,
    			position: new google.maps.LatLng(that.model.get("lat"),that.model.get("lon")),
    			title: that.model.get("locations")
    		});
		}
	}
});

var AppView = Backbone.View.extend({
	el: $(window),
	events: {
		'resize': 'fitWindow'
	},

	initialize: function() {
		_.bindAll(this, 'render', 'loadMap', 'fitWindow');
		this.collection = new Locations();
		this.render();
	},

	render: function() {
		this.fitWindow();
       	this.loadMap();
       	//this.el.bind('resize', this.fitMap);
	},

	loadMap: function() {
		
		var mapOptions = {
			// taken from http://www.nationsonline.org/oneworld/map/google_map_San_Francisco.htm
         		center: new google.maps.LatLng(37.59870580866572, -122.35850703613276),
         		zoom: 10
       	};
       	var map = new google.maps.Map($('.movie-map')[0], mapOptions);

       	var that = this;
       	//
       	this.collection.fetch({
       		success: function(res) {

       			
       			var titles = {
       				"keys": []
       			};
       			for(var i = 0; i < res.length; i++) {
       				var markerView = new MarkerView({ model: res.models[i], map: map});
       				if(titles[res.models[i].attributes.title] == null) {
       					titles[res.models[i].attributes.title] = 1;
       					titles["keys"].push(res.models[i].attributes.title);
       				}		
       			}
       			console.log(res.length);
       			console.log(num);
       			$( ".auto-search" ).autocomplete({
      				source: titles["keys"],
      				appendTo: ".results"
    			});
       		}
       	});
	},

	addMarker: function(res, count) {
		var that = this;
		var loc = res.models[count].attributes.locations;
		this.geocoder.geocode({ 'address' : loc + ", San Francisco, CA" }, function(results, status) {
       		if (status == google.maps.GeocoderStatus.OK) {
    		  	var marker = new google.maps.Marker({
    		      	map: that.map,
    		      	position: results[0].geometry.location,
    		      	title: res.models[count].attributes.locations
    		  	});
    		  	this.count++;
    		} else if(status == google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
    			setTimeout(function() { that.addMarker(res, count)}, (600 * 3));
    		} else {
    		  	console.log('Geocode was not successful for the following reason: ' + status);
    		}
    		count++;
    		if(count < 20) {
    			setTimeout(function() { that.addMarker(res, count) }, 600);
    		}
       	});
	},

	fitWindow: function() {
		var h = this.el.height()
		$('.movie-map').height(h);
	},

	// showMarkers: function() {
	// 	var that = this;
	// 	this.collection.fetch({
	// 		success: function(res) {
	// 			var result = $('.auto-search').val();
	// 			var make = {
	// 				length: 0,
	// 				models: []
	// 			};
	// 			for(var i=0; i < res.length; i++) {
	// 				if(res.models[i].attributes.title == result) {
	// 					make.models.push(res.models[i]);
	// 					make.length++;
	// 				}
	// 			}
	// 			that.addMarker(make, 0);
	// 		}
	// 	});
	// }
});

// Load App when DOM ready
var appView = null;

	appView = new AppView();
})(jQuery);