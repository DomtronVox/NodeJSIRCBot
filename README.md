# NodeJS IRC Bot
## About
This project aims to create an application that hosts multiple IRC bots and a web portal with related information like logs and statistics. There are two parts to this application: The Server and Bot Objects. Basic operations like data transfer will be built into these two parts while third party plugins will handle processing and displaying data.

    The Bot Object attempts to follow the specification for IRC clients as defined in RFC 1459. The bot and IRC Network connection code is loosely based off the https://github.com/ktiedt/NodeJS-IRC-Bot with numerous adjustments.

I plan to implement the following features: yaml configuration files, application compatible with cloudfoundry, and a web interface that plugins can display information on (example statically serve logs).

Currently the basic bot code is in place and I am working on plugins for it.

## Legal
All code for this project is free to use with no restrictions and no guarantee of usability or safety.

## Prerequisites

NodeJS (tested under v0.9.3-pre)

Note: Some plugins may have additional requirements.

## Code Documentation

### Plugin API
For details on developing your own plugins see the PLUGIN_API.md document in this repository.

### File Descriptions

index.js - Mediates between bots, plugins, and the web interface.
bot/bot.js - Manages connections, plugins, and handles parsed messages.
bot/connection.js - Handles connecting, disconnecting, pings, receiving/sending messages, and parsing messages to JASON.
bot/plugins - folder where all the plugins should be placed.

### Quick Runtime Outline

index.js initiates the bot and web server objects

bot object receives a pointer to the web server object

bot initializes plugins

bot connects to the servers and channels

bot relays received messages to plugins

