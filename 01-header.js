/*
	This is the header file for bob.
	It is the first file to be run and it initiates the global variables.
	All global variables besides functions should be in this file.

	The command to start bob is ./bob.sh <email> <password> [admin password]

	The admin password is for certain commands and if it's not specified it defaults to 5883.
*/

"use strict";

var version = "2.1",
	user_email,
	user_password,
	admin_password = "5883";

var login = require("facebook-chat-api");
var fs = require('fs');
var math = require("mathjs");
var Horseman = require('node-horseman');
var request = require('sync-request');
var yargs = require('yargs').argv;

var db = {
	w: [],
	thinking: [],
	last_sentence: ""
};

var api;

var post_countdown = 100;

if(yargs.user_email)
	user_email = yargs.user_email;
else
	console.log("No login email provided! Start Bob using ./bob.sh email@email.com password")

if(yargs.user_password)
	user_password = yargs.user_password;
else
	console.log("No login password provided! Start Bob using ./bob.sh email@email.com password")

admin_password = yargs.admin_password || admin_password;
