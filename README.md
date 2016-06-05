#Pebble Auto Configuration
PAC is a simple configuration page for pebble watchface configuration.PAC uses url parameters to create a config page on the fly using JS.

##Configuration Options
Currently, PAC accepts 3 field types (keys):

* Color
* Bool
* Option

Configuration values can't have spaces (for now), use underscores. For each configuration field, you pass in the starting value.

###Title
```&title=corridor_configuration```

###Color
```&battery_background_color=65280```

###Bool
Bool will return a 1 or 0.

```&always_show_battery_bool=1```

```&always_show_battery_bool=0```

###Option
Option values are deliniated by double underscore. Options are displayed and returned in the order the are set. The first value will return 0, second 1 and so on. The default value is designated by '@':

```battery_options=always_show_on__@never_show_on__shake_on_shake```

##How to use PAC with Pebble App Messaging
More to come here

