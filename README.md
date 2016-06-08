#Pebble Auto Configuration
PAC is a simple configuration page for pebble watchface configuration. PAC uses url parameters to create a config page on the fly using JS. While it's not really automatic, it does cut down on boilerplate for a Pebble watchface.

[URL Example](http://gjthoman.github.io/pebble_auto_config/?config=%5B%7B%22type%22%3A%22title%22%2C%22label%22%3A%22Pebble%20Auto%20Config%22%7D%2C%7B%22type%22%3A%22paragraph%22%2C%22content%22%3A%22Lorem%20ipsum%20dolor%20sit%20amet%2C%20consectetur%20adipiscing%20elit.%20Aenean%20non%20nulla%20turpis.%20Fusce%20in%20imperdiet%20odio%2C%20vitae%20pulvinar%20arcu.%20Duis%20varius%20sem%20mi%2C%20sit%20amet%20euismod%20est%20hendrerit%20sagittis.%22%7D%2C%7B%22type%22%3A%22text%22%2C%22key%22%3A%22pet_name%22%2C%22label%22%3A%22Add%20Some%20Text%20Here%22%2C%22default%22%3A%22Wicket%22%7D%2C%7B%22type%22%3A%22number%22%2C%22key%22%3A%22age%22%2C%22label%22%3A%22This%20Field%20is%20Numeric%22%2C%22default%22%3A%2230%22%7D%2C%7B%22type%22%3A%22section%22%2C%22label%22%3A%22Section%20Title%22%7D%2C%7B%22type%22%3A%22bool%22%2C%22key%22%3A%22always_seconds%22%2C%22label%22%3A%22Show%20this%20BOOL%3F%22%2C%22on%22%3A%22Always%22%2C%22off%22%3A%22Never%22%2C%22default%22%3A1%7D%2C%7B%22type%22%3A%22option%22%2C%22key%22%3A%22batt_visibility%22%2C%22label%22%3A%22Battery%20Visibility%22%2C%22default%22%3A1%2C%22options%22%3A%5B%22Always%20Show%22%2C%22Never%20Show%22%2C%22Show%20on%20Shake%22%5D%7D%2C%7B%22type%22%3A%22color%22%2C%22key%22%3A%22hour_color%22%2C%22label%22%3A%22Hour%20Color%22%2C%22default%22%3A65280%7D%5D)

##General

**Supported Fields**

* Title (page title)
* Paragraph
* Section
* Text
* Number
* Color
* Bool
* Option
 
##JSON configuration

* `key`: should be alpha numeric (starting with alpha) and contain no spaces
* `type`: one of [`"title"`,`"option"`,`"color"`,`"bool"`]
* `label`, `content`, `on`, `off`: string
* `options`: `["array", "of", "strings"]`
* `default`: number or string. 0 or 1 for bool. colors are 16 bit integers

```javascript
[	
	{
		type: "title",
		label: "Pebble Auto Config"
	},
	{
		type: "section",
		label: "Section Title"
	},
	{
		type: "paragraph",
		content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean non nulla turpis. Fusce in imperdiet odio, vitae pulvinar arcu. Duis varius sem mi, sit amet euismod est hendrerit sagittis."
	},
	{
		type: "text",
		key: "pet_name",
		label: "Add Some Text Here",
		default: "Wicket"
	},
	{
		type: "number",
		key: "age",
		label: "This Field is Numeric",
		default: "30"
	},
	{
		type: "bool",
		key: "always_seconds",
		label: "Show this BOOL?",
		on: "Always",
		off: "Never",
		default: 1
	},
	{
		type: "option",
		key: "batt_visibility",
		label: "Battery Visibility",
		default: 1,
		options: [ "Always Show", "Never Show", "Show on Shake"]
	},
	{
		type: "color",
		key: "hour_color",
		label: "Hour Color",
		default: 65280
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

###Reading appMessages *.c example (simple):

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



