( function($) {	

var markers = [];

var Marker = Backbone.Model.extend({
	urlRoot: '/api/movies'
});

var Locations = Backbone.Collection.extend({
	url: '/api/movies'
});

var MarkerView = Backbone.View.extend({
	tagName: "li",
	initialize: function(options) {

		var that = this;

		_.bindAll(this, 'getLoc', 'addMarker', 'showinfo');

		that.model = options.model;

		that.map = options.map;

		that.geocoder = new google.maps.Geocoder();
		that.loc = that.model.get("locations");
		
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

		google.maps.event.addListener(that.marker, 'click', that.showinfo);
	},

	showinfo: function() {
		//that.infowindow.open(that.map, that.marker);
		var template = window.JST['movies/result']({ entry: this.model.attributes});

		$('.search').css('padding', '10px');
		$('.search').html(template);
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
	},

	render: function() {
		this.fitWindow();
       	this.loadMap();
	},

	fitWindow: function() {
		var h = this.el.height()
		$('.movie-map').height(h);
	},

	loadMap: function() {
		
		var mapOptions = {
			// taken from http://www.nationsonline.org/oneworld/map/google_map_San_Francisco.htm
         		center: new google.maps.LatLng(37.7833, -122.4167),
         		zoom: 12
       	};
       	this.map = new google.maps.Map($('.movie-map')[0], mapOptions);
    },

    loadCollection: function(searchTitle) {
    	var that = this;
       	this.collection.fetch({
       		success: function(res) {
       			var titles = {
       				"keys": []
       			};
       			for(var i = 0; i < res.length; i++) {
       				var markerView = new MarkerView({ model: res.models[i], map: that.map});

       				markers.push(markerView);

       				if(titles[res.models[i].attributes.title] == null) {
       					titles[res.models[i].attributes.title] = 1;
       					titles["keys"].push(res.models[i].attributes.title);
       				}		
       			}

       			$( ".auto-search" ).autocomplete({
      				source: titles["keys"],
      				appendTo: ".results",
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

	navSearch: function() {
		window.location.href = "#search/" + $('.auto-search').val();
	},

	search: function(value) {
		$('.search').empty();
		$('.search').css('padding', '0px');

		var term = value;
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
		this.zoom(selected);

	},

	zoom: function(select) {
		if(select.length > 0) {
			var bound = new google.maps.LatLngBounds();
			for(var i = 0; i < select.length; i++) {
				//console.log(markers[i].marker);
				bound.extend(select[i].marker.getPosition());
			}
			this.map.fitBounds(bound);
		}
		
	}
});

	var appView = null;
	appView = new AppView();

	var AppRouter = Backbone.Controller.extend({
        routes: {
        	"search/:title": "searchTitle",
        	"": "renderPage"
        },
        initialize: function() {
        	appView.render();
        	
        },

        renderPage: function() {
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