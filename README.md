# NodeJS Chat Bot
## About
This project aims to create a plugin and API focused application that hosts multiple chat bots and a http server where plugins can post information like logs and statistics.

The irc_protocol plugin is loosely based off of [ktiedt/NodeJS-IRC-Bot](https://github.com/ktiedt/NodeJS-IRC-Bot) with numerous adjustments.

I plan to implement the following features: 
* yaml configuration files.
*  A web interface that plugins can use to display information (i.e. statically serve logs).
* A channel logging plugin that statically hosts logs online.
* A statistics plugin that shows online graphs of channel activity.

## Progress Status
Currently the basic plugin code is in place. I will be working on some plugins and the http server code next.

## Legal
All code for this project is free to use with no restrictions and no guarantees.

## Prerequisites

NodeJS (tested under v0.9.3-pre)

__Note: When installing 3rd party plugins there may be additional requirements.__

## Documentation

### Plugin Documentation
For details on developing your own plugins see the Plugin_Dev.md document in this repository.

For general details on configuring plugins and specific configuration options for basic plugins see the Plugin_Configuration.md.

### File Descriptions

* index.js - Loads the configuration file and then creates the web server and bots.
* bot.js - Manages plugins.
* plugins/ - Folder where all plugins should be placed.
    * irc_protocol.js - Plugin that lets the bot connect to irc servers. Handles connecting, disconnecting, pings, receiving/sending messages, and parsing messages to JASON.

