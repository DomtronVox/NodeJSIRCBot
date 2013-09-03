# NodeJS IRC Bot
## About
This project aims to create an application that hosts multiple IRC bots and a web portal with related information like logs and statistics. There are two parts to this application: The Server and Bot Objects. Basic operations like data transfer will be built into these two parts while third party plugins will handle processing and displaying data.

This project attempts to follow the specification for IRC clients as defined in RFC 1459. The bot and IRC Network irc protocol plugin is loosely based off the [ktiedt/NodeJS-IRC-Bot](https://github.com/ktiedt/NodeJS-IRC-Bot) with numerous adjustments.

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

* index.js - Loads the configuration file and creates bots based on it.
* bot.js - Manages plugins. Will probably provide the http server
* plugins - Folder where all plugins should be placed.
    * irc_protocol.js - Plugin that lets the bot connect to irc servers. Handles connecting, disconnecting, pings, receiving/sending messages, and parsing messages to JASON.

