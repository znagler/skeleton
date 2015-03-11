(function($){
$(function(){
	//initialize
	tactics_display_quotes();
	//update the chart every 15 seconds
	setInterval(function () {                                  	                        
		tactics_display_quotes();
	}, 15000);
});
function tactics_display_quotes(){
	//TODO: Add settings to block module to allow users to input symbols
		var symbols = ['^GSPC', '^NDX',/* '^IXIC',*/ 'DIA'];	
		$.getJSON("http://query.yahooapis.com/v1/public/yql", {
				format: "json",
				diagnostics: "true",
				env: "http://datatables.org/alltables.env",
				q: "select * from yahoo.finance.quotes where symbol in ('" + symbols.join("','") + "')"
		},
		function (data, xhr, status)
		{		
			var quote_html_str = "";	
			$.each(symbols, function(index, value){
				quote_html_str += "<div class='tactics_quote' style='float: left; margin: 5px 1%; width: 31.333%; position: relative;'>";	
				quote_html_str += "<div class='tactics_quote_meta' style='font-size: .9em; float: left; position: relative; width: 26%; text-align: right; margin: 0 4% 0 0;'>";
        quote_html_str += "<h3 class='chartName' style='text-align: left; font-size: .9em; border-bottom: 1px solid #aaaaaa; width: 100%;'>" + data.query.results.quote[index].Name + "</h3>";
				quote_html_str += "<span class='chartPrice'>" + data.query.results.quote[index].LastTradePriceOnly + "</span><br />";
				if(/^\+/.test(data.query.results.quote[index].PercentChange)) {
					quote_html_str += "<span class='chartChange tactics_positive' style='color: green;'>" + data.query.results.quote[index].Change + "</span></div>";
				}
				else
				{
					quote_html_str += "<span class='chartChange tactics_negative' style='color: #ff0000;'>" + data.query.results.quote[index].Change + "</span></div>";
				};
				quote_html_str += "<img src='http://ichart.yahoo.com/t?s=" + value + "' style='float: right; position: relative; display: inline-block; width: 70%;'/>";
				quote_html_str += "</div>";																							
			});
			$('#tactics_stock_quote_block').html(quote_html_str);
		}); 	
};
})(jQuery);
