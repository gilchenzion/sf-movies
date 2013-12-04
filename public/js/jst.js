window.JST = {};

window.JST['movies/result'] = _.template(
	"<h2><%= entry.title %></h2> \
	<p>Location: <%= entry.locations %></p> \
	<p>Release Year: <%= entry.release_year %></p> \
	<p>Production Company: <%= entry.production_company %></p> \
	<p>Distributor: <%= entry.distributor %></p> \
	<p>Writer(s): <%= entry.writer %></p><p>Actors: <%= entry.actor_1 %>,<%= entry.actor_2 %>, <%= entry.actor_3 %></p> \
	<p>Fun Fact: <%= entry.fun_facts %></p>"
);