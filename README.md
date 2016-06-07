#Pebble Auto Configuration
PAC is a simple configuration page for pebble watchface configuration.PAC uses url parameters to create a config page on the fly using JS.

[URL Example](http://gjthoman.github.io/pebble_auto_config/?config=%5B%7B%22type%22%3A%22title%22%2C%22label%22%3A%22Corridor%20Config%22%7D%2C%7B%22type%22%3A%22option%22%2C%22key%22%3A%22batt_visibility%22%2C%22label%22%3A%22Battery%20Visibility%22%2C%22default%22%3A1%2C%22options%22%3A%5B%22Always%20Show%22%2C%22Never%20Show%22%2C%22Show%20on%20Shake%22%5D%7D%2C%7B%22type%22%3A%22text%22%2C%22key%22%3A%22pet_name%22%2C%22label%22%3A%22What%20is%20your%20pet%27s%20name%3F%22%2C%22default%22%3A%22Wicket%22%7D%2C%7B%22type%22%3A%22number%22%2C%22key%22%3A%22age%22%2C%22label%22%3A%22How%20old%20are%20you%3F%22%2C%22default%22%3A%2230%22%7D%2C%7B%22type%22%3A%22color%22%2C%22key%22%3A%22back_color%22%2C%22label%22%3A%22Background%20Color%22%2C%22default%22%3A16711680%7D%2C%7B%22type%22%3A%22color%22%2C%22key%22%3A%22hour_color%22%2C%22label%22%3A%22Hour%20Color%22%2C%22default%22%3A65280%7D%2C%7B%22type%22%3A%22bool%22%2C%22key%22%3A%22always_batt%22%2C%22label%22%3A%22Always%20Show%20Battery%22%2C%22default%22%3A1%7D%5D)

##General

Pass in a `title` param to set page title

**Supported Fields**

* Text
* Number
* Color
* Bool
* Option
 
##JSON configuration

* `key`: should be alpha numeric (starting with alpha) and contain no spaces
* `type`: one of [`"title"`,`"option"`,`"color"`,`"bool"`]
* `label`: string
* `default`: number or string. 0 or 1 for bool. colors are 16 bit integers

```javascript
[	
	{
		type: "title",
		label: "Corridor Config"
	},
	{
		type: "option",
		key: "batt_visibility",
		label: "Battery Visibility",
		default: 1,
		options: [ "Always Show", "Never Show", "Show on Shake"]
	},
	{
		type: "text",
		key: "pet_name",
		label: "What is your pet's name?",
		default: "Wicket"
	},
	{
		type: "number",
		key: "age",
		label: "How old are you?",
		default: "30"
	},
	{
		type: "color",
		key: "back_color",
		label: "Background Color",
		default: 16711680
	},
	{
		type: "color",
		key: "hour_color",
		label: "Hour Color",
		default: 65280
	},
	{
		type: "bool",
		key: "always_batt",
		label: "Always Show Battery",
		default: 1
	}
]
```

##How to use PAC with Pebble App Messaging

Basic usage complete with local storage example.

###SETTINGS Message keys:

```c
AppKeyBackgroundColor = 0,
AppKeyHourColor = 1,
AppKeyMinuteColor = 2,
AppKeyShowBatt = 3
```

###Full app.js example:

```javascript
Pebble.addEventListener('showConfiguration', function() {
  var background = window.localStorage.getItem('BACKGROUND_COLOR') ? window.localStorage.getItem('BACKGROUND_COLOR') : 0;
  var hour = window.localStorage.getItem('HOUR_COLOR') ? window.localStorage.getItem('HOUR_COLOR') : 65280;
  var min = window.localStorage.getItem('MINUTE_COLOR') ? window.localStorage.getItem('MINUTE_COLOR') : 65280;
  var show_batt = window.localStorage.getItem('SHOW_BATT') ? window.localStorage.getItem('SHOW_BATT') : 1;
  
  var config = [  
    {
      type: "title",
      label: "Orbit Config"
    },
    {
      type: "color",
      key: "back_color",
      label: "Background Color",
      default: background
    },
    {
      type: "color",
      key: "hour_color",
      label: "Hour Color",
      default: hour
    },
    {
      type: "color",
      key: "minute_color",
      label: "Minute Color",
      default: min
    },
    {
      type: "bool",
      key: "show_batt",
      label: "Always Show Battery",
      default: show_batt
    }
  ]

var url = 'http://gjthoman.github.io/pebble_auto_config/?config=' + encodeURIComponent(JSON.stringify(config));
    
  Pebble.openURL(url);
});

Pebble.addEventListener('webviewclosed', function(e) {
  var configData = JSON.parse(decodeURIComponent(e.response));
  
  var dict = {
    'AppKeyBackgroundColor': configData.background_color,
    'AppKeyHourColor': configData.hour_color,
    'AppKeyMinColor': configData.minute_color,
    'AppKeyShowBatt': configData.always_show_battery_bool
  };
  
  window.localStorage.setItem('BACKGROUND_COLOR', configData.background_color);
  window.localStorage.setItem('HOUR_COLOR', configData.hour_color);
  window.localStorage.setItem('MINUTE_COLOR', configData.minute_color);
  window.localStorage.setItem('SHOW_BATT', configData.always_show_battery_bool);
  
  Pebble.sendAppMessage(dict, function() {
    console.log('Config data sent successfully!');
  }, function(e) {
    console.log(JSON.stringify(e));
    console.log('Error sending config data!');
  });
});

```

###Partial *.c example (simple):

```c
static GColor background_color;
static GColor hour_color;
static GColor minute_color;
static bool always_show_battery;

typedef enum {
  AppKeyBackgroundColor = 0,
  AppKeyHourColor = 1,
  AppKeyMinColor = 2,
  AppKeyShowBatt = 3
} AppKey;

static void bg_update_proc(Layer *layer, GContext *ctx) {
  graphics_context_set_fill_color(ctx, background_color);
  graphics_fill_rect(ctx, layer_get_bounds(layer), 0, GCornerNone);
}

static void inbox_received_handler(DictionaryIterator *iter, void *context) {
  
  Tuple *bg_color_t = dict_find(iter, AppKeyBackgroundColor);
  if(bg_color_t) {
    background_color = GColorFromHEX(bg_color_t->value->int32);
    persist_write_int(AppKeyBackgroundColor, bg_color_t->value->int32);
  }
  
  Tuple *hour_color_t = dict_find(iter, AppKeyHourColor);
  if(hour_color_t) {
    hour_color = GColorFromHEX(hour_color_t->value->int32);
    persist_write_int(AppKeyHourColor, hour_color_t->value->int32);
  }
  Tuple *minute_color_t = dict_find(iter, AppKeyMinColor);
  if(minute_color_t) {
    minute_color = GColorFromHEX(minute_color_t->value->int32);
    persist_write_int(AppKeyMinColor, minute_color_t->value->int32);
  }
  
  Tuple *show_batt_t = dict_find(iter, AppKeyShowBatt);
  if(show_batt_t) {
    always_show_battery = show_batt_t->value->int32 == 1;
    persist_write_bool(AppKeyShowBatt, show_batt_t->value->int32 == 1);
  }
  
  layer_mark_dirty(window_get_root_layer(s_window));
}

static void init() {
  if (persist_exists(AppKeyBackgroundColor)) {
    background_color = GColorFromHEX(persist_read_int(AppKeyBackgroundColor));    
  } else {
    background_color = GColorBlack;
  }
  
  if (persist_exists(AppKeyHourColor)) {
    hour_color = GColorFromHEX(persist_read_int(AppKeyHourColor));
  } else {
    hour_color = GColorGreen;
  }

  if (persist_exists(AppKeyMinColor)) {
    minute_color = GColorFromHEX(persist_read_int(AppKeyMinColor));
  } else {
    minute_color = GColorGreen;
  }
  
  if ( persist_exists(AppKeyShowBatt)) {
    always_show_battery = persist_read_bool(AppKeyShowBatt);
  } else {
    always_show_battery = true;
  }
  
  ...
  rest of init method
  ...

}
```



