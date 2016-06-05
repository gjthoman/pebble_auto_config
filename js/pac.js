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

$(document).ready(function(){
	var colors = [];
	var alphaNums = ['0','5','A','F']
	
	document.getElementById('page_title').textContent = PAC_utils.titleize(PAC_utils.getURLVariable('title'));
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

	var options = {
	    showPaletteOnly: true,
	    preferredFormat: "hex",
	    hideAfterPaletteSelect:true,
	    palette: [arrays[1],arrays[3],arrays[5],arrays[7],arrays[0],arrays[2],arrays[4],arrays[6],arrays[8]]
	};

	var urlVars = PAC_utils.URLToArray();

	function createPanel(title, bodyContent) {
		var settings = document.getElementById('settings');
	
		var panel = document.createElement('DIV');
		panel.className += 'panel panel-default';

		var heading = document.createElement('DIV');
		heading.className += 'panel-heading';	

		var h3 = document.createElement('H3');
		h3.className += 'panel-title';
		h3.textContent = PAC_utils.titleize(title);

		var body = document.createElement('DIV');
		body.className += 'panel-body';

		heading.appendChild(h3);
		body.appendChild(bodyContent);
		panel.appendChild(heading);
		panel.appendChild(body);
		
		settings.appendChild(panel);
	}

	var addInput = {
		color: function(key, value){
			var input = document.createElement('INPUT');
			input.id = key;
			input.className += 'color';
			input.type = 'text';
			input.value = '#' + PAC_utils.numToHex(value);
		
			createPanel(key, input);
		},
		bool: function(key, value){
			var checkbox = document.createElement('DIV');

			var input = document.createElement('INPUT');
			input.id = key;
			input.type = 'checkbox';
			input.checked = value == 1 ? true : false;

			var label = document.createElement('LABEL');
			label.htmlFor = key;

			checkbox.appendChild(input);
			checkbox.appendChild(label);

			createPanel(key, checkbox);
		},
		option: function(key, value){
			var options = value.split('__');
			
			var radios = document.createElement('DIV');

			for (var i = 0, len = options.length; i < len; i++) {
				var input = document.createElement('INPUT');
				input.name = key;
				input.id = options[i];
				input.value = i;
				input.type = 'radio';
				input.checked = options[i].indexOf('@') !== -1 ? true : false;

				var label = document.createElement('LABEL');
				label.htmlFor = options[i];
				label.textContent = PAC_utils.titleize(options[i]);

				radios.appendChild(input);
				radios.appendChild(label);
			}

			createPanel(key, radios);
		}
	}

	for (var key in urlVars) {
	    if (urlVars.hasOwnProperty(key)) {
	        value = urlVars[key];
	        
			if (key.indexOf('color') !== -1) {
				addInput['color'](key, value);
				$('#'+key).spectrum(options);
			} else if(key.indexOf('bool') !== -1) {
				addInput['bool'](key, value);
			} else if(key.indexOf('option') !== -1) {
				addInput['option'](key, value);
			}
	    }
	}
});
