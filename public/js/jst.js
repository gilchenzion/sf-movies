window.JST = {};

window.JST['movies/result'] = _.template(
	"<h2><%= entry.title %></h2> \
	<p><strong>Location</strong>: <%= entry.locations %></p> \
	<p><strong>Release Year</strong>: <%= entry.release_year %></p> \
	<% if(entry.production_company != '') { %> \
		<p><strong>Production Company</strong>: <%= entry.production_company %></p> \
	<% }; %> \
	<% if(entry.distributor != '') { %> \
	<p><strong>Distributor</strong>: <%= entry.distributor %></p> \
	<% }; %> \
	<% if(entry.writer != '') { %> \
	<p><strong>Writer(s)</strong>: <%= entry.writer %></p> \
	<% }; %> \
	<% if(entry.actor_1 != '' && entry.actor_2 != '' && entry.actor_3 != '') { %> \
	<p><strong>Actors</strong>: \
	<% if(entry.actor_1) { %> \
		<%= entry.actor_1 %> \
	<% }; %> \
	<% if(entry.actor_2) { %> \
		,<%= entry.actor_2 %> \
	<% }; %> \
	<% if(entry.actor_3) { %> \
		,<%= entry.actor_3 %> \
	<% }; %> \
	<% }; %> \
	<% if(entry.fun_facts != '') { %> \
	<p><strong>Fun Fact</strong>: <%= entry.fun_facts %></p> \
	<% }; %>"
);