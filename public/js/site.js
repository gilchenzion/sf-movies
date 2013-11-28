( function($) {
	var AppView = Backbone.View.extend({
		el: $(window),
		events: {
			'resize': 'fitMap'
		},

		initialize: function() {
			_.bindAll(this, 'render', 'loadMap', 'fitMap');
			this.render();
		},

		render: function() {

			this.fitMap();
        	this.loadMap();
        	//this.el.bind('resize', this.fitMap);
		},

		loadMap: function() {
			var mapOptions = {
				// taken from http://www.nationsonline.org/oneworld/map/google_map_San_Francisco.htm
          		center: new google.maps.LatLng(37.59870580866572, -122.35850703613276),
          		zoom: 8
        	};
        	var map = new google.maps.Map($('.movie-map')[0], mapOptions);
		},

		fitMap: function() {
			var h = this.el.height()
			$('.movie-map').height(h);
		}
	});
	
	var appView = new AppView();
})(jQuery);