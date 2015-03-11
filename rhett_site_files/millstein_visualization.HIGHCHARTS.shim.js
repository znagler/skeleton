(function($){
/*
- ** HIGHCHARTS **	
- CHART TYPE CAPABILITIES: 
- Pie (HICPIE), Column (HICCOL), Stacked Column (HICSTACKCOL),
- Bar (HICBAR), Stacked Bar (HICSTACKBAR), Area (HICAREA), Scatter (HICSCATTER),
- Line (HICLINE), 
- PARTIAL: 
- Bubble (HICBUBBLE)
*/


	var tempPath = Drupal.settings.millstein_visualization.modulePath;

	$('.HIGHCHARTS_display').css({'background': '#ffffff','padding':'5%'}).html('<img src="' + Drupal.settings.basePath + tempPath + '/visualization_lib_shims/HIGHCHARTS.shim/ajax-loader.gif" style="position: relative; width: auto; height: auto; margin: 0 auto; display: block; text-align: center" alt="loading..." class="loader-spinner" />');

//ready function runs after page is fully loaded
$(function(){
	chartSettings = chart_init();	
});


//set up chart settings
function chart_init(){

	var visModPath = Drupal.settings.millstein_visualization.modulePath;
	
	$('.HIGHCHARTS_display').each(function(i){	
	  	var chartSettings = {
		  	'nid' : null, 
		  	'div_nid' : null, 
		  	'vis_type' : 'Column Chart', 
		  	'width' : '400px', 
		  	'height' : '300px', 
		  	'vis_src' : null, 
		  	'vis_h_axis' : [], 
		  	'vis_v_axis' : [], 
		  	'vis_display_titles' : [], 
		  	'vis_title' : 'Chart Title', 
		  	'time_stamp_received' : null
		};

	  	//Get nid_string from Div, and strip out random string
	  	var div_nid_string = $(this).attr('id');
	  	var nid_parts = div_nid_string.split(':');
	  	var settings_nid_string = nid_parts[0];
	
	  	//Get settings from backend
	    var all_vis_setting = Drupal.settings.millstein_visualization;
	    chartSettings = all_vis_setting[settings_nid_string];
	
	    chartSettings.div_nid = div_nid_string;
	    chartSettings.nid = settings_nid_string;
	    chartSettings.width = $('.HIGHCHARTS_display').width();
		chartSettings.height = $('.HIGHCHARTS_display').height();
		
		getChartData(chartSettings);  

	});

};

//get data via ajax call
function getChartData(s){
	if (!(s.vis_src == "null")){
		$.ajax({
		  url: s.vis_src,
		  settings: s,
		  type: 'get',
		  async: false,
		  dataType: 'json',
		  success: function(data)
		  { 	
				//how many rows
				var key, rows, count = 0;
				for(key in data) {
				  if(data.hasOwnProperty(key)) {
				    count++;
				    rows = data[key];
				  };

				  //how many columns
				  var key2, num_columns = 0;
				  for(key2 in rows){
					  num_columns++
				  };			
				};
				
				
				//Column Names
				var mykeys = Object.keys(data[0]);
				
				//Massage json object into multi-dimensional array
				var values, myrows = [];
				for (var u = 0; u < count; u++)
				{
					var row = data[u];
					values = [];
					for (m=0;m<num_columns;m++)
					{
						//check for nulls and make sure they aren't converted to zero
						if (row[mykeys[m]] == "")
						{
							var data_value = null;
						}
						else
						{
							var data_value = row[mykeys[m]];
						};

					    //parse string numerics to floats, but NOT nulls
					    if ($.isNumeric(data_value) === true)
					    {	
							values.push(parseFloat(row[mykeys[m]]));
					    }
					    else
					    {
						    if (data_value == null) {
							    values.push(null);
						    }
						    else {
							    values.push(row[mykeys[m]]);
						    };
					    };
					} ;
					myrows[u] = values;
				};
				
				//Prepend Column Name Array to collection of rows
			    myrows.unshift(mykeys);

				drawChart(myrows, this.settings);
			  
		  },
		  	error: function(data, status, error)
		  {
			  console.log(data.status);
			  console.log(error);
			$('.HIGHCHARTS_display').html('No data found for selected query');
		  }
		});
	}
	else 
	{
		$('.HIGHCHARTS_display').html('No Data Source Selected');
	}
};









//determine lib and type and draw chart
function drawChart(d, s){

//Format timestamps to Date, Time, DateTime, or Month-Year

	preformat = pivotData(d);
	
 	if(s.timestamps)
 	{
	 	var formatted_data = timestamp_formatter(s, preformat);
 	}
 	else
 	{
	 	var formatted_data = preformat;
 	};
 	
 	//d = formatted_data;
 	//d = pivotData(d);
 	d = pivotData(formatted_data);

	//Grab relevant columns to display
	var relevant_columns = [];

	//parse rel col string and cast to Int
	relevant_columns = s.vis_relevant.split(',');
	
	for(i in relevant_columns){
		relevant_columns[i] = parseInt(relevant_columns[i],10);
	}
	
	var relData = [],
		item;
		
	for (i=0;i<d.length;i++) {
		relData[i] = [];
		for (j=0;j<relevant_columns.length;j++) {
			item = d[i][relevant_columns[j]];
			relData[i][j] = item;
		};
	};


	setChartColorTheme();

	//Create Chart
	if (s.vis_type == 'HICAREA'){ 
		display_HICAREA (s, relData);
	}
	else if (s.vis_type == 'HICSCATTER') {
		display_HICSCATTER (s, relData, d);
	}
	else if (s.vis_type == 'HICBUBBLE') {
		display_HICBUBBLE (s, relData, d);
	}
	else if (s.vis_type == 'HICPIE') {
		display_HICPIE (s, relData);
	}	
	else if (s.vis_type == 'HICCOL') {
		display_HICCOL (s, relData);
	}
	else if (s.vis_type == 'HICSTACKCOL') {
		display_HICSTACKCOL (s, relData);
	}
	else if (s.vis_type == 'HICBAR') {
		display_HICBAR (s, relData);
	}
	else if (s.vis_type == 'HICSTACKBAR') {
		display_HICSTACKBAR (s, relData);
	}
	else if (s.vis_type == 'HICLINE') {
		display_HICLINE (s, relData, d);
	}
	else {
		display_HICLINE (s, relData);
	};
};





function display_HICPIE (s, relData) {

	var container = document.getElementById(s.div_nid);

	//remove header row from data
	var noHeadData = relData.slice(0);
	noHeadData.shift();

	var options = {
		chart: {
			renderTo: container,
			type: 'pie'
		},
		title: {
			text: null//s.vis_title
		},
		plotOptions: {
			pie: {
				allowPointSelect: true,
				cursor: 'pointer',
				dataLabels: {
					enabled: true,
					format: '<b>{point.name}</b>: {point.percentage:.1f} %',
					style: {
						color: (Highcharts.theme && Highcharts.theme.contrastTextColor || 'black')
					}
				},
				series: {
					slicedOffset: 20,
					sliced: true,
					selected: true	
				},
				colors: Highcharts.getOptions().colors = Highcharts.map(Highcharts.getOptions().colors, function (color) {
					return {
						radialGradient: { cx: 0.5, cy: 0.5, r: 0.5 },
						stops: [
							[0, Highcharts.Color(color).brighten(0.3).get('rgb')],
							[1, color] // darken
						]
        				};
    				}),
			}
		},
		tooltip: {
            pointFormat: '<b>{point.percentage:.1f}%</b>'
        },
    	credits: {
	    	enabled: false
    	},
    	series: [{
	    	type: 'pie',
	    	name: s.vis_title,
    	}]
	};
	var series = {
		data:[]   
	};

	for(i=0;i<noHeadData.length;i++){
		series.name = s.vis_title;
		series.data.push([noHeadData[i][0], noHeadData[i][1]]);	

	};
		
	options.series.push(series);

	var hichart = new Highcharts.Chart(options);
	
};





function display_HICSCATTER (s, relData, d) {

	var container = document.getElementById(s.div_nid);
	
	var chartObj = build_dataObj(s, relData, 0);
	
	//Position legend depending on presence of Vertical Label
//add ASAP
/*	if (!chartObj.header.x){
		var legendPos = 65; 
	}
	else {
		var legendPos = 88;
	};
*/	

	var options = {
		chart: {
			renderTo: container,
			type: 'scatter'
		},
		title: {
			text: null//chartObj.title
		},
		xAxis: {
			title: {
				text: chartObj.header.x
			},
			labels: {
				rotation: chartObj.label_rotation,
			},
			//tickInterval: myTickInt,
			//tickPixelInterval: 40
    	},
    	yAxis: {
	    	title: {
		    	text: chartObj.header.y
	    	},
        	startOnTick: true,
        	endOnTick: true,
        	showLastLable: true,
    	},
    	plotOptions: {
	    	scatter: {
		    	marker: {
			    	radius: 5,
		    	}
	    	}
    	},
    	credits: {
	    	enabled: false
    	},
    	tooltip: {
	    	headerFormat: '<b>{series.name}</b><br>',
	    	pointFormat: chartObj.header.x + ': {point.x}, ' + chartObj.header.y + ': {point.y}'
    	},
    	series: []
	};

	//shift off headers
	var colHead = d.shift();
	
	//pivot
	var piv = pivotData(d);
	
	//Grab x-Axis relevant columns
	var x_relevant_columns = [];
	//parse rel col string and cast to Int
	x_relevant_columns = s.vis_h_axis.split(',');
	for(i in x_relevant_columns){
		x_relevant_columns[i] = parseInt(x_relevant_columns[i],10);
	}	
	
	//Grab y-Axis relevant columns
	var y_relevant_columns = [];
	//parse rel col string and cast to Int
	y_relevant_columns = s.vis_v_axis.split(',');
	for(i in y_relevant_columns){
		y_relevant_columns[i] = parseInt(y_relevant_columns[i],10);
	}	
	
	var xrelData = [],
		yrelData = [];
		
	for (i=0;i<x_relevant_columns.length;i++) {	
		xrelData[i] = piv[x_relevant_columns[i]];
		yrelData[i] = piv[y_relevant_columns[i]];
				
	};

	
	for (k=0;k<x_relevant_columns.length;k++){
		var series = {
				data: []             
		};
		
		for(l=0;l<xrelData[k].length;l++){
			series.data.push([xrelData[k][l], yrelData[k][l]]);	
		}
		series.name = colHead[x_relevant_columns[k]] + ' vs ' + colHead[y_relevant_columns[k]];
		options.series.push(series);
	};	
	
	var hichart = new Highcharts.Chart(options);
};








function display_HICLINE (s, relData, d) {

	//resetOptions();
	var container = document.getElementById(s.div_nid);
	
	var chartObj = build_dataObj(s, relData, 0);
	

	//Position legend depending on presence of Vertical Label
	if (!chartObj.header.y){
		var legendPos = 65; 
	}
	else {
		var legendPos = 88;
	};
	
	//Determine X-axis Tick Interval
	var myTickInt;
	myTickInt = (Math.round(chartObj.table.length/(s.width/40)));
	
	
	var options = {
		chart: {
			renderTo: container,
			type: 'line'
		},
		title: {
			text: null //chartObj.title,
		},
		xAxis: {
			title: {
				text: chartObj.header.x
			},
			gridLineWidth: 1,
			labels: {
				rotation: chartObj.label_rotation,
			},
        	categories: [],
        	tickInterval: myTickInt,
        	tickPixelInterval: 40
    	},
    	yAxis: {
	    	title: {
		    	text: chartObj.header.y
	    	},
	    	gridLineWidth: 1,
	    	labels: {
		    	style: {
			    	width: 50,
			    	'min-width': '50px',
			    	'max-width': '50px',
			    	'text-align': 'right'
			    },
		    	useHTML: true
		    }
    	},
    	tooltip: {
	    	shared: true,
            useHTML: true,
            headerFormat: '<small>' + chartObj.header.x + ': {point.key}</small></br>',
            pointFormat: '<small class="vis-tt-point-label" style="color: {series.color}; font-weight: bold;">{series.name}:</small> <small class="vis-tt-point" style="text-align: right; font-weight: bold;">{point.y}</small><br />',
    	},
        plotOptions: {
            line: {
                lineWidth: 2,
                states: {
                    hover: {
                        lineWidth: 3
                    }
                },
                marker: {
                    enabled: false
                },
                stacking: 'null',
            },
            series: {
	            connectNulls: false
            }
        },	
    	legend: {
	    	enabled: true,
	    	floating: true,
	    	align: 'left',
	    	verticalAlign: 'top',
	    	layout: 'horizontal',
	    	borderWidth: 1,
	    	borderColor: '#000000',
	    	borderRadius: 0,
	    	x: legendPos,
	    	y: 0,
	    	backgroundColor: '#ffffff',
	    	padding: 10,
	    	symbolHeight: 8,
	    	symbolWidth: 8,
	    	itemStyle: {
		    	fontSize: 12,
		    	fontWeight: 'normal',
		    	textDecoration: 'underline'
	    	}		
    	},
		credits: {
			enabled: false
		},
    	series: []
	};

	//Pivot Data for easy chart building
	var data = pivotData(relData);

	//xColumns
	for (ex=0;ex<chartObj.h_axis.length;ex++)
	{
		var xCols = [];
		xCols[ex] = data[ex];
		for (w=0;w<xCols[ex].length;w++)
		{
			options.xAxis.categories.push(xCols[ex][w]);
		};
	};
	//yColumns 
	var yCols = [];	
	
	for (y=0;y<chartObj.v_axis.length;y++)
	{
		var series = {
				data: []             
		};
		
		//set legend and hover legend y point labels
		if (!s.y_point_label)
		{
			series.name = chartObj.colHeaders[y+chartObj.h_axis.length];
		}
		else
		{
			series.name = chartObj.seriesNames[y];	
		};
			
		
		yCols[y] = data[y+chartObj.h_axis.length];
		
		for(q=0;q<yCols[y].length;q++){
			
			series.data.push(yCols[y][q]);
		};
		options.series.push(series);
	};
	
	var hichart = new Highcharts.Chart(options);	
};





function display_HICBAR (s, relData) {
	
	var container = document.getElementById(s.div_nid);
	
	//Position legend depending on presence of Vertical Label
	var chartObj = build_dataObj(s, relData, 1);
	if (!chartObj.header.x){
		var legendPos = 65; 
	}
	else {
		var legendPos = 88;
	};

	//Determine X-axis Tick Interval
	var myTickInt;
	myTickInt = (Math.round(chartObj.table.length/(s.width/40)));
	
	
	//Pivot Data for easy chart building
	var pivoted = pivotData(relData);
	
	var options = {
		chart: {
			renderTo: container,
			type: 'bar'
		},
		title: {
			text: null//s.vis_title
		},
		xAxis: { //This is really the Vertical Axis
        	categories: [],
        	gridLineWidth: 1,
			title: {
				text: chartObj.header.x
			},
	    	labels: {
			   	style: {
				   	width: 50,
				   	'min-width': '50px',
				   	'max-width': '50px',
				   	'text-align': 'right'
			   	},
			   	rotation: chartObj.label_rotation,
			   	useHTML: true
			},
			tickInterval: myTickInt,
			tickPixelInterval: 40
    	},
    	yAxis: { //This is really the Horizontal Axis
			title: {
				text: chartObj.header.y
			}
    	},
    	legend: {
	    	enabled: true,
	    	floating: true,
	    	align: 'left',
	    	verticalAlign: 'top',
	    	layout: 'horizontal',
	    	borderWidth: 1,
	    	borderColor: '#000000',
	    	borderRadius: 0,
	    	x: legendPos,
	    	y: 0,
	    	backgroundColor: '#ffffff',
	    	padding: 10,
	    	marginBottom: 40,
	    	symbolHeight: 8,
	    	symbolWidth: 8,
	    	itemStyle: {
		    	fontSize: 12,
		    	fontWeight: 'normal',
		    	textDecoration: 'underline'
	    	}
    	},
    	credits: {
	    	enabled: false
    	},
    	tooltip: {
	    	shared: true
    	},
    	series: []
	};
	
	//run through rows
	for (u = 0; u < relData.length; u++) {
		var series = {
			data: []             
		};
		//run through columns
		for (p=0; p<relData[0].length; p++){
			//first row
			if (u == 0) {
				//ignore first cell of first row (extraneous name) and push Column Names as Categories
				//Todo: allow array of header names from settings to be used instead
				if(p > 0){
					options.xAxis.categories.push(relData[u][p]);
				};
			}
			else {
				//first cell of every row but the first, add series name
				if (p == 0){
					series.name = relData[u][p];
				}
				else {
					//add series data point
					series.data.push(relData[u][p]);
				};
			};
		};
		//skip header row, add series
		if (!(u==0)){
			options.series.push(series);
		};
	};

	var hichart = new Highcharts.Chart(options);
};





function display_HICSTACKBAR (s, relData) {

	var container = document.getElementById(s.div_nid);
	var chartObj = build_dataObj(s, relData, 1);
	
	//Determine X-axis Tick Interval
	var myTickInt;
	myTickInt = (Math.round(chartObj.table.length/(s.width/40)));
	
	
	//Position legend depending on presence of Vertical Label
	if (!chartObj.header.x){
		var legendPos = 65; 
	}
	else {
		var legendPos = 86;
	};
	
	var options = {
		chart: {
			renderTo: container,
			type: 'bar'
		},
		title: {
			text: null//s.vis_title
		},
		xAxis: {
        	categories: [],
        	gridLineWidth: 1,
			title: {
				text: chartObj.header.x
			},
			labels: {
				rotation: chartObj.label_rotation,
			},
			tickInterval: myTickInt,
			tickPixelInterval: 40
    	},
    	yAxis: {
	    	labels: {
			   	style: {
				   	width: 50,
				   	'min-width': '50px',
				   	'max-width': '50px',
				   	'text-align': 'right'
			   	},
			   	useHTML: true
			},
			title: {
				text: chartObj.header.y
			},	    	
    	},
    	legend: {
	    	enabled: true,
	    	floating: true,
	    	align: 'left',
	    	verticalAlign: 'top',
	    	layout: 'horizontal',
	    	borderWidth: 1,
	    	borderColor: '#000000',
	    	borderRadius: 0,
	    	x: legendPos,
	    	y: 0,
	    	backgroundColor: '#ffffff',
	    	padding: 10,
	    	symbolHeight: 8,
	    	symbolWidth: 8,
	    	itemStyle: {
		    	fontSize: 12,
		    	fontWeight: 'normal',
		    	textDecoration: 'underline'
	    	}
    	},
    	tooltip: {
	    	shared: true
    	},
    	credits: {
	    	enabled: false
    	},
    	plotOptions: {
	    	series: {
		    	stacking: 'normal',
	    	}
    	},
    	series: []
	};

	for (u = 0; u < relData.length; u++) {
		var series = {
			data: []             
		};
		for (p=0; p<relData[0].length; p++){
			if (u == 0) {
				if(p > 0){
					options.xAxis.categories.push(relData[u][p]);
				};
			}
			else {
				if (p == 0){
					series.name = relData[u][p];
				}
				else {
					series.data.push(relData[u][p]);
				};
			};
		};
		if (!(u==0)){
			options.series.push(series);
		};
	};

	var hichart = new Highcharts.Chart(options);
};







function display_HICCOL (s, relData) {
	
	var container = document.getElementById(s.div_nid);
	
	var chartObj = build_dataObj(s, relData, 0);
	
	//Determine X-axis Tick Interval
	var myTickInt;
	myTickInt = (Math.round(chartObj.table.length/(s.width/40)));
	
	//Position legend depending on presence of Vertical Label
	if (!chartObj.header.x){
		var legendPos = 65; 
	}
	else {
		var legendPos = 88;
	};
	
	var options = {
		chart: {
			renderTo: container,
			type: 'column'
		},
		title: {
			text: null//chartObj.title
		},
		xAxis: {
			title: {
				text: chartObj.header.x
			},
        	categories: [],
			labels: {
				rotation: chartObj.label_rotation,
			},
        	gridLineWidth: 1,
        	tickInterval: myTickInt,
        	tickPixelInterval: 40
    	},
    	yAxis: {
	    	title: {
		    	text: chartObj.header.y
	    	},
	    	labels: {
			   	style: {
				   	width: 50,
				   	'min-width': '50px',
				   	'max-width': '50px',
				   	'text-align': 'right'
			   	},
			   	useHTML: true
			}
    	},
    	legend: {
	    	enabled: true,
	    	floating: true,
	    	align: 'left',
	    	verticalAlign: 'top',
	    	layout: 'horizontal',
	    	borderWidth: 1,
	    	borderColor: '#000000',
	    	borderRadius: 0,
	    	x: legendPos,
	    	y: 0,
	    	backgroundColor: '#ffffff',
	    	padding: 10,
	    	symbolHeight: 8,
	    	symbolWidth: 8,
	    	itemStyle: {
		    	fontSize: 12,
		    	fontWeight: 'normal',
		    	textDecoration: 'underline'
	    	}
    	},
    	credits: {
	    	enabled: false
    	},
    	tooltip: {
	    	shared: true,
            useHTML: true,
            headerFormat: '<small>' + chartObj.header.x + ': {point.key}</small></br>',
            pointFormat: '<small class="vis-tt-point-label" style="color: {series.color}; font-weight: bold;">{series.name}:</small> <small class="vis-tt-point" style="text-align: right; font-weight: bold;">{point.y}</small><br />',
    	},
    	series: []
	};
	
	var data = pivotData(relData);
	
	//xColumns
	for (ex=0;ex<chartObj.h_axis.length;ex++){
		var xCols = [];
		xCols[ex] = data[ex];
		for (w=0;w<xCols[ex].length;w++){
			options.xAxis.categories.push(xCols[ex][w]);
		}
	}
	//yColumns 
	var yCols = [];	
	
	for (y=0;y<chartObj.v_axis.length;y++){
		var series = {
				data: []             
		};	
		
		//set legend and hover legend y point labels
		if (!s.y_point_label)
		{
			series.name = chartObj.colHeaders[y+chartObj.h_axis.length];
		}
		else
		{
			series.name = chartObj.seriesNames[y];	
		}
		
		yCols[y] = data[y+chartObj.h_axis.length];
		for(q=0;q<yCols[y].length;q++){
			
			series.data.push(yCols[y][q]);
		}
		options.series.push(series);
	}
	var hichart = new Highcharts.Chart(options);
};







function display_HICSTACKCOL (s, relData) {
	
	var container = document.getElementById(s.div_nid);
	
	//Position legend depending on presence of Vertical Label
	var chartObj = build_dataObj(s, relData, 0);
	if (!chartObj.header.x){
		var legendPos = 65; 
	}
	else {
		var legendPos = 88;
	};
	
	//Determine X-axis Tick Interval
	var myTickInt;
	myTickInt = (Math.round(chartObj.table.length/(s.width/40)));
	
	var options = {
		chart: {
			renderTo: container,
			type: 'column'
		},
		title: {
			text: null//chartObj.title
		},
		xAxis: {
			title: {
				text: chartObj.header.x
			},
			labels: {
				rotation: chartObj.label_rotation,
			},
        	categories: [],
        	gridLineWidth: 1,
        	tickInterval: myTickInt,
        	tickPixelInterval: 40
    	},
    	yAxis: {
	    	title: {
		    	text: chartObj.header.y
	    	},
	    	labels: {
			   	style: {
				   	width: 50,
				   	'min-width': '50px',
				   	'max-width': '50px',
				   	'text-align': 'right'
			   	},
			   	useHTML: true
			}	    	
    	},
    	legend: {
	    	enabled: true,
	    	floating: true,
	    	align: 'left',
	    	verticalAlign: 'top',
	    	layout: 'horizontal',
	    	borderWidth: 1,
	    	borderColor: '#000000',
	    	borderRadius: 0,
	    	x: legendPos,
	    	y: 0,
	    	backgroundColor: '#ffffff',
	    	padding: 10,
	    	symbolHeight: 8,
	    	symbolWidth: 8,
	    	itemStyle: {
		    	fontSize: 12,
		    	fontWeight: 'normal',
		    	textDecoration: 'underline'
	    	}
    	},
    	tooltip: {
	    	shared: true
    	},
    	credits: {
	    	enabled: false
    	},
    	plotOptions: {
	    	series: {
		    	stacking: 'normal',
	    	}
    	},
    	series: []
	};
	
	//Pivot Data for easy chart building
	//var pivoted = pivotData(chartObj.table);
	
	var pivoted = relData;
	pivoted.shift();
	pivoted = pivotData(pivoted);

 	if(s.timestamps){
	 	//call timestamp_formatter()
	 	var formatted_data = timestamp_formatter(s, pivoted);
 	}
 	else
 	{
	 	formatted_data = pivoted;
 	};
	
	//xColumns
	for (ex=0;ex<chartObj.h_axis.length;ex++){
		var xCols = [];
		xCols[ex] = formatted_data[ex];
		for (w=0;w<xCols[ex].length;w++){
			options.xAxis.categories.push(xCols[ex][w]);
		}
	}
	//yColumns 
	var yCols = [];	
	
	for (y=0;y<chartObj.v_axis.length;y++){
		var series = {
				data: []             
		};
		
		
		//set legend and hover legend y point labels
		if (!s.y_point_label)
		{
			series.name = chartObj.colHeaders[y+chartObj.h_axis.length];
		}
		else
		{
			series.name = chartObj.seriesNames[y];	
		}
		//series.name = chartObj.colHeaders[y+chartObj.h_axis.length];	
		
		yCols[y] = formatted_data[y+chartObj.h_axis.length];	
		for(q=0;q<yCols[y].length;q++){
			
			series.data.push(yCols[y][q]);
		}
		options.series.push(series);
	}
	var hichart = new Highcharts.Chart(options);
};







function display_HICAREA (s, relData) {

	var container = document.getElementById(s.div_nid);
	
	var chartObj = build_dataObj(s, relData, 0);
	
	//Determine X-axis Tick Interval
	var myTickInt;
	myTickInt = (Math.round(chartObj.table.length/(s.width/40)));
	
	//Position legend depending on presence of Vertical Label
	if (!chartObj.header.x){
		var legendPos = 65; 
	}
	else {
		var legendPos = 88;
	};
	
	var options = {
		chart: {
			renderTo: container,
			type: 'area',
			//marginLeft: 100
		},
		title: {
			text: null//s.vis_title
		},
		xAxis: {
			title: {
				text: chartObj.header.x
			},
			labels: {
				rotation: chartObj.label_rotation,
				/*
			   	formatter: function () {
	                return '<b>$</b>' + this.value + '<b>%</b>';
	            }*/
			},
        	categories: [],
        	gridLineWidth: 1,
        	tickmarkPlacement: 'between',
        	tickInterval: myTickInt,
        	tickPixelInterval: 40,
        	minPadding: 0,
        	maxPadding: 0,
        	startOnTick:true,
        	endOnTick:true
    	},
    	yAxis: {
	    	title: {
		    	text: chartObj.header.y
	    	},
	    	gridLineWidth: 1,
	    	labels: {
			   	style: {
				   	width: 50,
				   	'min-width': '50px',
				   	'max-width': '50px',
				   	'text-align': 'right'
			   	},
			   	/*
			   	formatter: function () {
                    return '<b>$</b>' + this.value;
                },*/
			   	useHTML: true
			}
    	},
    	tooltip: {
	    	shared: true,
            useHTML: true,
            headerFormat: '<small>' + chartObj.header.x + ': {point.key}</small></br>',
            pointFormat: '<small class="vis-tt-point-label" style="color: {series.color}; font-weight: bold;">{series.name}:</small> <small class="vis-tt-point" style="text-align: right; font-weight: bold;">{point.y}</small><br />',
    	},
    	plotOptions: {
	    	area: {
		    	marker: {
			    	enabled: false
		    	},
		    	lineWidth: 1,
		    	fillOpacity: 0.5
	    	},
	    	series: {
		    	connectNulls: false	
	    	}
    	},  	
    	legend: {
	    	enabled: true,
	    	floating: true,
	    	align: 'left',
	    	verticalAlign: 'top',
	    	layout: 'horizontal',
	    	borderWidth: 1,
	    	borderColor: '#000000',
	    	borderRadius: 0,
	    	x: legendPos,
	    	y: 0,
	    	backgroundColor: '#ffffff',
	    	padding: 10,
	    	symbolHeight: 8,
	    	symbolWidth: 8,
	    	itemStyle: {
		    	fontSize: 12,
		    	fontWeight: 'normal',
		    	textDecoration: 'underline'
	    	}
    	},
    	credits: {
	    	enabled: false
    	},
    	series: []
	};
	
	//Pivot Data for easy chart building
	var data = pivotData(relData);

	//xColumns
	for (ex=0;ex<chartObj.h_axis.length;ex++)
	{
		var xCols = [];
		xCols[ex] = data[ex];
		for (w=0;w<xCols[ex].length;w++)
		{
			options.xAxis.categories.push(xCols[ex][w]);
		};
	};
	
	//yColumns 
	var yCols = [];	
	
	for (y=0;y<chartObj.v_axis.length;y++)
	{
		var series = {
				data: []             
		};	
		
		//set legend and hover legend y point labels
		if (!s.y_point_label)
		{
			series.name = chartObj.colHeaders[y+chartObj.h_axis.length];
		}
		else
		{
			series.name = chartObj.seriesNames[y];	
		};
		//series.name = s.y_point_label;//chartObj.colHeaders[y+chartObj.h_axis.length];
			
		yCols[y] = data[y+chartObj.h_axis.length];	
		for(q=0;q<yCols[y].length;q++){
			series.data.push(yCols[y][q]);
		};
		
		series.fillColor = {
			linearGradient: [0, 0, 0, 300],
			stops: [
				[0, Highcharts.getOptions().colors[y]],
				[1, Highcharts.Color(Highcharts.getOptions().colors[y]).setOpacity(0).get('rgba')]
			]
		};
		
		options.series.push(series);
	};
	var hichart = new Highcharts.Chart(options);
};





function display_HICBUBBLE (s, relData, d) {

	var container = document.getElementById(s.div_nid);
	
	var chartObj = build_dataObj(s, relData, 0);
	
	//Position legend depending on presence of Vertical Label
	if (!chartObj.header.x){
		var legendPos = 65; 
	}
	else {
		var legendPos = 88;
	};
	
	//Determine X-axis Tick Interval
	var myTickInt;
	myTickInt = (Math.round(chartObj.table.length/(s.width/40)));
	
	
	var options = {
		chart: {
			renderTo: container,
			type: 'bubble'
		},
		title: {
			text: null//chartObj.title
		},
		xAxis: {
			title: {
				text: chartObj.header.x
			},
			labels: {
				rotation: chartObj.label_rotation,
			},
			gridLineWidth: 1,
			tickInterval: myTickInt,
			tickPixelInterval: 40
    	},
    	yAxis: {
	    	title: {
		    	text: chartObj.header.y
	    	},
        	startOnTick: true,
        	endOnTick: true,
        	showLastLable: true,
	    	labels: {
			   	style: {
				   	width: 50,
				   	'min-width': '50px',
				   	'max-width': '50px',
				   	'text-align': 'right'
			   	},
			   	useHTML: true
			}
    	},
    	plotOptions: {
	    	scatter: {
		    	marker: {
			    	radius: 5,
		    	}
	    	}
    	},
    	legend: {
	    	enabled: true,
	    	floating: true,
	    	align: 'left',
	    	verticalAlign: 'top',
	    	layout: 'horizontal',
	    	borderWidth: 1,
	    	borderColor: '#000000',
	    	borderRadius: 0,
	    	x: legendPos,
	    	y: 0,
	    	backgroundColor: '#ffffff',
	    	padding: 10,
	    	symbolHeight: 8,
	    	symbolWidth: 8,
	    	itemStyle: {
		    	fontSize: 12,
		    	fontWeight: 'normal',
		    	textDecoration: 'underline'
	    	}
    	},
    	tooltip: {
	    	headerFormat: '<b>{series.name}</b><br>',
	    	pointFormat: chartObj.header.x + ': {point.x}, ' + chartObj.header.y + ': {point.y}'
    	},
    	series: []
	};

	//shift off headers
	var colHead = d.shift();
	
	//pivot
	var piv = pivotData(d);
	
	//Grab x-Axis relevant columns
	var x_relevant_columns = [];
	//parse rel col string and cast to Int
	x_relevant_columns = s.vis_h_axis.split(',');
	for(i in x_relevant_columns)
	{
		x_relevant_columns[i] = parseInt(x_relevant_columns[i],10);
	};	
	
	//Grab y-Axis relevant columns
	var y_relevant_columns = [];
	//parse rel col string and cast to Int
	y_relevant_columns = s.vis_v_axis.split(',');
	for(i in y_relevant_columns)
	{
		y_relevant_columns[i] = parseInt(y_relevant_columns[i],10);
	};
	
	var xrelData = [],
		yrelData = [];
		
	for (i=0;i<x_relevant_columns.length;i++)
	{	
		xrelData[i] = piv[x_relevant_columns[i]];
		yrelData[i] = piv[y_relevant_columns[i]];			
	};
	
	for (k=0;k<x_relevant_columns.length;k++)
	{
		var series = {
				data: []             
		};
		
		for(l=0;l<xrelData[k].length;l++)
		{
			series.data.push([xrelData[k][l], yrelData[k][l]]);	
		};
		series.name = colHead[x_relevant_columns[k]] + ' vs ' + colHead[y_relevant_columns[k]];
		options.series.push(series);
	};	
	var hichart = new Highcharts.Chart(options);
};








//Set up Data Object
function build_dataObj(s, d, shift){
	
	//remove header row
	if (shift == 0)
	{
		var colHeaders = d.shift();	
	};
	
	var tempHeaders = s.vis_display_titles.split(',');
	
	var dataObj = {
		title: s.vis_title,
		header: {
			x: tempHeaders[0],
			y: tempHeaders[1]
		},
		colHeaders: colHeaders,
		seriesNames: s.y_point_label.split(','),
		h_axis: s.vis_h_axis.split(','),
		v_axis: s.vis_v_axis.split(','),
		table: d
	};
	
	//Label Rotation Setting
	if (s.degrees_of_label_rotation){
		dataObj.label_rotation = parseInt(s.degrees_of_label_rotation, 10);
	};
	
	//prefix-suffix
	if(s.prefix_suffix)
	{
		var ps_cols = prefixSuffix(s,d);
	};
	return dataObj;
};








//Pivot Data (x-y)
function pivotData(d)
{
	var swappedData = [],
		x = Math.max.apply(Math, d.map(function(e){return e.length;})),
		y = d.length,
		i,j;
	for (i=0;i<x;i++)
	{
		swappedData[i] = [];
		for(j=0;j<y;j++)
		{
			swappedData[i][j]=d[j][i];
		};
	};
	return swappedData;
};







//Reset Color Options
function resetOptions()
{
	// Make a copy of the defaults, call this line before any other setOptions call
	var HCDefaults = $.extend(true, {}, Highcharts.getOptions(), {});
	
    // Fortunately, Highcharts returns the reference to defaultOptions itself
    // We can manipulate this and delete all the properties
    var defaultOptions = Highcharts.getOptions();
    for (var prop in defaultOptions) 
    {
        if (typeof defaultOptions[prop] !== 'function') delete defaultOptions[prop];
    };
    // Fall back to the defaults that we captured initially, this resets the theme
    Highcharts.setOptions(HCDefaults);
};







function timestamp_formatter(s, d)
{
	 	var timestamp_col_array = s.timestamps.split(',');

	 	//loop once for each timestamp column to convert
	 	for (t=0; t<timestamp_col_array.length; t++)
	 	{
		 	var timestamp_col_type_array = [];
		 	timestamp_col_type_array = timestamp_col_array[t].split('=');
		 	
		 	var col_type = timestamp_col_type_array[1].toLowerCase();
		 	
		 	//date or time?
		 	if (col_type == 'date') 
		 	{
			 	//loop through Data converting timestamps to date
			 	for(l=1;l<d[t].length;l++)
			 	{
				 	var dateObj = new Date(d[timestamp_col_type_array[0]][l]*1000);
				 	var formatted_date = '', 
				 					mo = '';
				 	
				 	mo = dateObj.getMonth() + 1;
				 	formatted_date = mo + '/' + dateObj.getDate()  + '/' + dateObj.getFullYear();
				 	
				 	d[timestamp_col_type_array[0]][l] = formatted_date;	
				};
				
				return d; 	
		 	}
		 	else if (col_type == 'time')
		 	{
			 	//loop through Data converting timestamps to time
			 	for(l=0;l<d[t].length;l++)
			 	{
				 	var dateObj = new Date(d[timestamp_col_type_array[0]][l]*1000);
				 	var formatted_time = '';
				 	
				 	formatted_time = dateObj.toLocaleTimeString();
	
				 	d[timestamp_col_type_array[0]][l] = formatted_time;		
				};
				
				return d;
		 	}
		 	else if (col_type == 'date-time') //Date + Time
		 	{
			 	//Make Date + Time
			 	for(l=0;l<d[t].length;l++)
			 	{
				 	var dateObj = new Date(d[timestamp_col_type_array[0]][l]*1000);
				 	var formatted_time = '',
				 		formatted_date = '';
				 	
				 	//Full Date Object
				 	//d[timestamp_col_type_array[0]][l] = dateObj;	
				 		
				 	//custom Date Object
				 	formatted_time = dateObj.toLocaleTimeString();
				 	mo = dateObj.getMonth() + 1;
				 	formatted_date = mo + '/' + dateObj.getDate()  + '/' + dateObj.getFullYear();
				 	d[timestamp_col_type_array[0]][l] = formatted_date + ' - ' + formatted_time;		
				};
								
				return d;
		 	}
		 	else if (col_type == 'month-year')
		 	{
			 	//Make Date + Time
			 	for(l=0;l<d[t].length;l++)
			 	{
				 	var dateObj = new Date(d[timestamp_col_type_array[0]][l]*1000);
				 	var formatted_time = '',
				 		formatted_date = '';
				 	
				 	//Full Date Object
				 	//d[timestamp_col_type_array[0]][l] = dateObj;	
				 		
				 	//custom Date Object
				 	formatted_time = dateObj.toLocaleTimeString();
				 	var month=["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
				 	mo = dateObj.getMonth();
				 	formatted_date = month[mo] + ', ' + dateObj.getFullYear();
				 	d[timestamp_col_type_array[0]][l] = formatted_date;		
				};						
				return d;	
		 	}
		 	else
		 	{
			 	//Defaults to Date + Time in case of bogus input
			 	for(l=0;l<d[t].length;l++)
			 	{
				 	var dateObj = new Date(d[timestamp_col_type_array[0]][l]*1000);
				 	var formatted_time = '',
				 		formatted_date = '';
				 	
				 	//Full Date Object
				 	//d[timestamp_col_type_array[0]][l] = dateObj;	
				 		
				 	//custom Date Object
				 	formatted_time = dateObj.toLocaleTimeString();
				 	mo = dateObj.getMonth() + 1;
				 	formatted_date = mo + '/' + dateObj.getDate()  + '/' + dateObj.getFullYear();
				 	d[timestamp_col_type_array[0]][l] = formatted_date + ' - ' + formatted_time;		
				};		
				return d;
		 	}
	 	};
};






function setChartColorTheme()
{
	Highcharts.setOptions ({
	    colors: ['#2b80c0', '#eb5701', '#d03737', '#3da63d', '#756bb1', '#636362', 
	             '#f49b1a','#242321',/*  '#98d0fa', '#fcc7a9', '#f8b1b1', '#bcf2bc', '#dad6f2', '#cacac7', '#f8d199',*/ '#14466b', '#752d03', '#941d1d', '#206420', '#473f7b', '#e4e4e3', '#b76d01'],
	    });
};







function setChartRadialTheme()
{
	//ResetOptions();
	
    // Radialize the colors
    Highcharts.getOptions().colors = Highcharts.map(Highcharts.getOptions().colors, function (color)
    {
        return {
            radialGradient: { cx: 0.5, cy: 0.5, r: 0.5 },
            stops: [
                [0, Highcharts.Color(color).brighten(0.5).get('rgb')],
                [1, color] // darken
            ]
        };
    });
};






function prefixSuffix(s, d)
{
	var ps_cols = s.prefix_suffix.split(',');
	
	//run through each column that's set for prefix or suffix and determine which, or both is needed
	for (i=0;i<ps_cols.length;i++)
	{
		var col = ps_cols[i].split('|');
	};
	return ps_cols;
};

})(jQuery);
