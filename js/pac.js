/*
file:///Users/gregthoman/workspace/pebble_auto_config/index.html?config=%5B%7B%22type%22%3A%22title%22%2C%22label%22%3A%22Corridor%20Config%22%7D%2C%7B%22type%22%3A%22option%22%2C%22key%22%3A%22batt_visibility%22%2C%22label%22%3A%22Battery%20Visibility%22%2C%22default%22%3A1%2C%22options%22%3A%5B%22Always%20Show%22%2C%22Never%20Show%22%2C%22Show%20on%20Shake%22%5D%7D%2C%7B%22type%22%3A%22text%22%2C%22key%22%3A%22pet_name%22%2C%22label%22%3A%22What%20is%20your%20pet%27s%20name%3F%22%2C%22default%22%3A%22Wicket%22%7D%2C%7B%22type%22%3A%22number%22%2C%22key%22%3A%22age%22%2C%22label%22%3A%22How%20old%20are%20you%3F%22%2C%22default%22%3A%2230%22%7D%2C%7B%22type%22%3A%22color%22%2C%22key%22%3A%22back_color%22%2C%22label%22%3A%22Background%20Color%22%2C%22default%22%3A16711680%7D%2C%7B%22type%22%3A%22color%22%2C%22key%22%3A%22hour_color%22%2C%22label%22%3A%22Hour%20Color%22%2C%22default%22%3A65280%7D%2C%7B%22type%22%3A%22bool%22%2C%22key%22%3A%22always_batt%22%2C%22label%22%3A%22Always%20Show%20Battery%22%2C%22default%22%3A1%7D%5D
*/

var PAC_utils = (function PAC_utils(undefined){ 
	URLToObject = function() {
	    var request = {};
	    var url = window.location.href;
	    var pairs = url.substring(url.indexOf('?') + 1).split('&');
	    for (var i = 0; i < pairs.length; i++) {
	        if(!pairs[i])
	            continue;
	        var pair = pairs[i].split('=');
	        request[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
	     }
	     return request;
	}
	stripOutThings = function(str){
		return str.replace('_color', '').replace('_bool', '').replace('_option', '').replace('@', '');
	}
	titleize = function(str) {
	    return stripOutThings(str).split('_').join(' ').replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
	}
	numToHex = function(number) {
		var str = Number(number).toString(16);
		var pad = "000000";
		return pad.substring(0, pad.length - str.length) + str;
	}
	getQueryParam = function(variable, defaultValue) {
      var query = location.search.substring(1);
      var vars = query.split('&');
      for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (pair[0] === variable) {
          return decodeURIComponent(pair[1]);
        }
      }
      return defaultValue || false;
    }

	return {
		URLToObject: URLToObject,
		stripOutThings: stripOutThings,
		titleize: titleize,
		numToHex: numToHex,
		getQueryParam: getQueryParam
	}
})();

var PAC_core = (function PAC_core(){
	var urlVars = {};
	var configData = [];
	var spectrumOptions = {};
	var templates = {};
	var $wrapper;
		
	function initSpectrumOptions(){
		var colors = [];
		var alphaNums = ['0','5','A','F'];
		
		for (var i = 0, len = alphaNums.length; i < len; i++) {
		  var s = alphaNums[i];
			for (var j = 0, len = alphaNums.length; j < len; j++) {
		  		var t = alphaNums[j];
		  		for (var k = 0, len = alphaNums.length; k < len; k++) {
			  		var u = alphaNums[k];

			  		colors.push(t+s+u);
				}
			}
		}

		var arrays = [], size = 8;
		arrays.push("");

		while (colors.length > 0)
		    arrays.push(colors.splice(0, size));

		return {
		    showPaletteOnly: true,
		    preferredFormat: "hex",
		    hideAfterPaletteSelect:true,
		    palette: [arrays[1],arrays[3],arrays[5],arrays[7],arrays[0],arrays[2],arrays[4],arrays[6],arrays[8]]
		};
	}

	function checkProps(props, element) {
		$.each(props, function(){
	        if (element[this] == undefined){
	        	throw "["+this + "] is a required parameter for [" + element.type +"]";
	        }
		});
	}

	var requiredFields = {
		color: 	["type","key","label","default"],
		bool: 	["type","key","label","default"],
		option: ["type","key","label","default","options"],
		title: 	["type", "label"],
		paragraph: ["content"]
	}

	var addElement = {
		title: function(value) {
			$('#page_title').text(value.label);	
		},
		paragraph: function(element) {
			$wrapper.append(templates.paragraph({
				content: element.content
			}));
		},
		section: function(element) {
			$wrapper.append(templates.section({
				label: element.label
			}));
		},
		text: function(element){
			$wrapper.append(templates.input({
				title: element.label,
				id: element.key,
				type: "text",
				value: element.default
			}));

		},
		number: function(element){
			$wrapper.append(templates.input({
				title: element.label,
				id: element.key,
				type: "number",
				value: element.default
			}));
		},
		color: function(element){
			$wrapper.append(templates.input({
				title: element.label,
				klass: "color",
				id: element.key,
				type: "text",
				value: "#"+PAC_utils.numToHex(element.default)
			}));
			$('#'+element.key).spectrum(spectrumOptions);
		},
		bool: function(element){
			$wrapper.append(templates.bool({
				title: element.label,
				id: element.key,
				on: element.on,
				off: element.off,
				options: element.default == 1 ? "checked" : ""
			}));
		},
		option: function(element){
			var choices = [];

			for (var i = 0, len = element.options.length; i < len; i++) {
				var key = element.options[i].replace(/\W+/g, "_").toLowerCase();
				choices.push({
					label: element.options[i],
					key: element.key,
					id: element.options[i].replace(/\W+/g, "_").toLowerCase(),
					value: i,
					options: i == element.default ? "checked" : ""
				});
			}

			$wrapper.append(templates.option({
				title: element.label,
				id: element.key,
				options: choices
			}));
		}
	}

	function init(){
		$wrapper = $('#settings');
		$wrapper.html('');

		templates = {
			paragraph: Handlebars.compile($("#paragraph-template").html()),
			section: Handlebars.compile($("#section-template").html()),
			input: Handlebars.compile($("#panel_input-template").html()),
			bool: Handlebars.compile($("#panel_bool-template").html()),
			option: Handlebars.compile($("#panel_option-template").html())
		}

		spectrumOptions = initSpectrumOptions();
		
		configData = JSON.parse(PAC_utils.URLToObject().config);

		createElements();
		setupListeners();
	}

	function createElements() {
		$.each(configData, function(key, element){
			checkProps(requiredFields[element.type],element);
			addElement[element.type](element);
		});
	}

	function setupListeners(){
		$('#submit_button').on('click', function() {
			var options = getValues(); 

			console.log(options);

		    var return_to = PAC_utils.getQueryParam('return_to', 'pebblejs://close#');

		    document.location = return_to + encodeURIComponent(JSON.stringify(options));
		});
	}

	var getValueById = {
		text: function(key) {
			var input = document.getElementById(key);
			return input.value;
		},
		number: function(key) {
			var input = document.getElementById(key);
			return input.value;
		},
		color: function(key) {
			var input = document.getElementById(key);
			return parseInt(input.value.replace("#",""), 16);
		},
		bool: function(key) {
			var input = document.getElementById(key);
			return input.checked ? 1 : 0;
		},
		option: function(key) {
			var input = document.getElementById(key);
			return parseInt( $('input[name="' + key + '"]:checked').val());
		}
	}

	function getValues(){
		var options = {};
		$.each(configData, function(key, element){
			if(element.key) {
				options[element.key] = getValueById[element.type](element.key);
			}
		});

		return options;
	}

	return {
		init: init//,
		//getValues: getValues
	}
});

$(document).ready(function(){
	PAC_core().init();
});
