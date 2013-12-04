( function($) {	

//global array of marker-views
var markers = [];

//Marker model for individual geocode update
var Marker = Backbone.Model.extend({
	urlRoot: '/api/movies'
});

//All Locations on the map
var Locations = Backbone.Collection.extend({
	url: '/api/movies'
});

//Each individual Marker on the Mapp
var MarkerView = Backbone.View.extend({
	tagName: "li",

	initialize: function(options) {
		var that = this;

		_.bindAll(this, 'getLoc', 'addMarker', 'showinfo');

		//intializing model and map for this marker
		that.model = options.model;
		that.map = options.map;

		//begin the marker pinning process
		that.geocoder = new google.maps.Geocoder();
		that.loc = that.model.get("locations");
		if(that.loc != "") {
			that.getLoc();
		}
	},

	getLoc: function() {
		//scoping
		var that = this;
		//200 is the default, so if the latitude and longitude are not set, then geocode address
		if(that.model.get("lat") == 200 || that.model.get("lon") == 200) {
			//best scope within San Francisco
			that.geocoder.geocode({ 'address' : that.loc + ", San Francisco, CA" }, function(results, status) {
       			if (status == google.maps.GeocoderStatus.OK) {
       				//pin marker
    			  	that.addMarker(results[0].geometry.location);
    			  	//save to DB the LatLng
    			  	that.model.save({
    			  		lat: results[0].geometry.location.ob,
    			  		lon: results[0].geometry.location.pb
    			  	});
    			} else if(status == google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
    				//adjust for query limit issue due to Google Maps Geocode API
    				setTimeout(function() { that.getLoc() }, (600 * 3));
    			}
       		});
		} else {
			//pin marker at location from database
			that.addMarker(new google.maps.LatLng(that.model.get("lat"),that.model.get("lon")))    		
		}
	},

	//pin marker on map
	addMarker: function(latlang) {
		var that = this;
		that.marker = new google.maps.Marker({
    		map: that.map,
    		position: latlang,
    		title: that.model.get("locations"),
    		icon: 'img/video.png'
    	});

		//render information when marker is clicked
		google.maps.event.addListener(that.marker, 'click', that.showinfo);
	},

	showinfo: function() {
		//render JavaScript Template from jst.js because .ejs had issues using underscore templates
		var template = window.JST['movies/result']({ entry: this.model.attributes});

		//adjust css and insert template
		$('.search').css('padding', '10px');
		$('.search').html(template);
	}
});


// Main Application View
var AppView = Backbone.View.extend({

	el: $(window),
	events: {
		//window resize, is mainEvent for the application
		'resize': 'fitWindow'
	},

	initialize: function() {
		//bind functions
		_.bindAll(this, 'render', 'loadMap', 'fitWindow', 'loadCollection', 'navSearch', 'search', 'zoom');

		//initialize collection
		this.collection = new Locations();
	},

	render: function() {
		//fit div to window then load map
		this.fitWindow();
       	this.loadMap();
	},

	fitWindow: function() {
		var h = this.el.height()
		$('.movie-map').height(h);
	},

	loadMap: function() {
		
		var mapOptions = {
				// taken from Google: San Francisco, CA
         		center: new google.maps.LatLng(37.7833, -122.4167),
         		zoom: 12
       	};
       	this.map = new google.maps.Map($('.movie-map')[0], mapOptions);
    },

    loadCollection: function(searchTitle) {
    	//scoping
    	var that = this;
       	this.collection.fetch({
       		success: function(res) {
       			//object used as hashtable to remove duplicates for autocomplete search
       			var titles = {
       				"keys": []
       			};

       			for(var i = 0; i < res.length; i++) {
       				var markerView = new MarkerView({ model: res.models[i], map: that.map});
       				markers.push(markerView);

       				//if not already in object named titles then add it
       				if(titles[res.models[i].attributes.title] == null) {
       					titles[res.models[i].attributes.title] = 1;
       					titles["keys"].push(res.models[i].attributes.title);
       				}		
       			}

       			//jQuery autocompletion
       			$( ".auto-search" ).autocomplete({
      				source: titles["keys"],
      				appendTo: ".results",
      				//on selection of item in search
      				select: function (event, ui) {
      					$('.auto-search').val(ui.item.value);
      					that.navSearch();
      					return true;
      				}
    			});

    			if(searchTitle != null) { 
    				that.search(searchTitle); 
    			} else {
    				that.search(null);
    			}
       		}
       	});
	},	

	//go to specific movie route
	navSearch: function() {
		window.location.href = "#search/" + $('.auto-search').val();
	},

	//given value, show all markers on map, where title = value
	search: function(value) {
		$('.search').empty();
		$('.search').css('padding', '0px');

		var term = value;

		//if null, show all markers
		var all = false;
		if(value == null) { all = true; }


		var selected = [];
		for(var i = 0; i < markers.length; i++) {
			if(markers[i].marker != null) {
				if(markers[i].model.get("title") == term || all) {
					markers[i].marker.setMap(this.map);
					selected.push(markers[i]);
				} else {
					markers[i].marker.setMap(null);
				}
			}	
		} 

		//If there are no markers matching, give error message
		if(selected.length == 0) {
			$('.search').css('padding', '10px');
			$('.search').html("<p>I'm Sorrry! The data does not provide a specific location for this movie...but rest assured, it was filmed in SF.</p>");
		} else {
			//prevent zoom on all markers
			if(value != null) {
				this.zoom(selected);
			}
		}		
	},

	// zoom within bounds
	zoom: function(select) {
		var bound = new google.maps.LatLngBounds();
		for(var i = 0; i < select.length; i++) {
			bound.extend(select[i].marker.getPosition());
		}
		this.map.fitBounds(bound);

		//if few markers, zoom out a bit to stay in view port
		if(select.length < 3) {
			var z = this.map.getZoom();
			this.map.setZoom(z - 2);
		}					
	}
});

var appView = null;
appView = new AppView();

var AppRouter = Backbone.Controller.extend({
	routes: {
		"search/:title": "searchTitle",
		"": "all"
	},
	initialize: function() {
		appView.render();
		
	},
	all: function() {
		appView.loadCollection(null);
	},
	searchTitle: function(title) {
		appView.loadCollection(title);
	}
});

// Load App when DOM ready
var app_router = new AppRouter();
Backbone.history.start();


})(jQuery);