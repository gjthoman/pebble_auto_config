#Pebble Auto Configuration
PAC is a simple configuration page for pebble watchface configuration.PAC uses url parameters to create a config page on the fly using JS.

##Configuration Options
Currently, PAC accepts 3 field types (keys):

* Color
* Bool
* Option

Configuration values can't have spaces (for now), use underscores. For each configuration field, you pass in the starting value.

###Title

`&title=corridor_configuration`

###Color

`&battery_background_color=65280`

###Bool

Bool will return a 1 or 0.

`&always_show_battery_bool=1`

`&always_show_battery_bool=0`

###Option

Option values are deliniated by double underscore. Options are displayed and returned in the order the are set. The first value will return 0, second 1 and so on. The default value is designated by '@':

`&battery_options=always_show_on__@never_show_on__shake_on_shake`

sample implementation to come later.

##How to use PAC with Pebble App Messaging

Basic usage complete with local storage example.

###SETTINGS Message keys:

```c
AppKeyBackgroundColor = 0,
AppKeyHourColor = 1,
AppKeyMinuteColor = 2,
AppKeyShowBatt = 3
```

###Full app.js example (simple):

```javascript
Pebble.addEventListener('showConfiguration', function() {
  var background = window.localStorage.getItem('BACKGROUND_COLOR') ? window.localStorage.getItem('BACKGROUND_COLOR') : 0;
  var hour = window.localStorage.getItem('HOUR_COLOR') ? window.localStorage.getItem('HOUR_COLOR') : 65280;
  var min = window.localStorage.getItem('MINUTE_COLOR') ? window.localStorage.getItem('MINUTE_COLOR') : 65280;
  var show_batt = window.localStorage.getItem('SHOW_BATT') ? window.localStorage.getItem('SHOW_BATT') : 1;
  
  var url = 'http://gjthoman.github.io/pebble_auto_config/'+
      '?title=' + 'orbit_config' +
      '&background_color=' + background +
      '&hour_color=' + hour +
      '&minute_color=' + min +
      '&always_show_battery_bool=' + show_batt
    
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



