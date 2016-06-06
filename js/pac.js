var PAC_utils = (function PAC_utils(undefined){ 
	URLToArray = function() {
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
	getURLVariable = function(name)  {
	  name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
	  var regexS = "[\\?&]"+name+"=([^&#]*)",
	      regex = new RegExp(regexS),
	      results = regex.exec(window.location.href);
	  if (results == null) return "";
	  else return results[1];
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
		URLToArray: URLToArray,
		getURLVariable: getURLVariable,
		stripOutThings: stripOutThings,
		titleize: titleize,
		numToHex: numToHex,
		getQueryParam: getQueryParam
	}
})();

var submitButton = document.getElementById('submit_button');

	submitButton.addEventListener('click', function() {
		var options = {}; 

		$.each(PAC_utils.URLToArray(), function(key){
			var input = document.getElementById(key);
			
			if (key.indexOf('color') !== -1) {
				options[key] = parseInt(input.value.replace("#",""), 16)
			} else if(key.indexOf('bool') !== -1) {
				options[key] = input.checked ? 1 : 0;
			} else if (key.indexOf('option') !== -1){
				options[key] = $('input[name="' + key + '"]:checked').val();;
			}
		});
		console.log(options);
    
    var return_to = PAC_utils.getQueryParam('return_to', 'pebblejs://close#');

    document.location = return_to + encodeURIComponent(JSON.stringify(options));
});

var colors = (function colors(){
	var options = {};
	
	function init(){
		var colors = [];
		var alphaNums = ['0','5','A','F']
		
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

		options = {
		    showPaletteOnly: true,
		    preferredFormat: "hex",
		    hideAfterPaletteSelect:true,
		    palette: [arrays[1],arrays[3],arrays[5],arrays[7],arrays[0],arrays[2],arrays[4],arrays[6],arrays[8]]
		};
	}

	init();

	return {
		options: options
	}
});

$(document).ready(function(){
	$('#page_title').text(PAC_utils.titleize(PAC_utils.getURLVariable('title')));
	
	var urlVars = PAC_utils.URLToArray();
	
	var create = {
		panel: function(title, bodyContent) {
			var $settings = $('#settings');
		
			var $panel = $('<div class="panel panel-default"></div>');
			var $heading = $('<div class="panel-heading"><h3 class="panel-title">'+ PAC_utils.titleize(title) +'</h3></div>');
			var $body = $('<div class="panel-body"></div>');

			$body.append(bodyContent);
			$panel.append($heading).append($body);
			
			$settings.append($panel);
		},
		label: function(_for, _text) {
			return $('<label for="'+_for+'">'+_text+'</label>');
		},
		input: function(data) {
			return $('<input class="'+data.klass+'" name="'+data.name+'" id="'+data.id+'" value="'+data.value+'" type="'+data.type+'" '+data.options+'></input>');
		}
	}

	var addInput = {
		color: function(key, value){
			var $input = create.input({
				id: key,
				klass: "color",
				type: "text",
				value: "#"+PAC_utils.numToHex(value)
			});

			create.panel(key, $input);
		},
		bool: function(key, value){
			var $checkbox = $('<div></div>');
			var $label = create.label(key, "");
			var $input = create.input({
				id: key,
				type:"checkbox",
				options: value == 1 ? "checked=checked" : ""
			});
			
			
			$checkbox.append($input);
			$checkbox.append($label);

			create.panel(key, $checkbox);
		},
		option: function(key, value){
			var options = value.split('__');
			
			var $radios = $('<div></div>');

			for (var i = 0, len = options.length; i < len; i++) {
				var $label = create.label(options[i], PAC_utils.titleize(options[i]));
				var $input = create.input({
					name: key,
					id: options[i],
					value: i,
					type: "radio",
					options: options[i].indexOf('@') !== -1 ? "checked=checked" : ""
				});

				$radios.append($input);
				$radios.append($label);
			}

			create.panel(key, $radios);
		}
	}

	for (var key in urlVars) {
	    if (urlVars.hasOwnProperty(key)) {
	        value = urlVars[key];
	        
			if (key.indexOf('color') !== -1) {
				addInput['color'](key, value);
				$('#'+key).spectrum(colors.options);
			} else if(key.indexOf('bool') !== -1) {
				addInput['bool'](key, value);
			} else if(key.indexOf('option') !== -1) {
				addInput['option'](key, value);
			}
	    }
	}
});
