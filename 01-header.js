/*
	This is the header file for bob.
	It is the first file to be run and it initiates the global variables.
	All global variables besides functions should be in this file.
*/

"use strict";

var version = "2.1",
	user_email = "email@gmail.com",
	user_password = "password";

var login = require("facebook-chat-api");
var fs = require('fs');
var math = require("mathjs");
var Horseman = require('node-horseman');
var request = require('sync-request');

var db = {
	w: [],
	thinking: ["hello","cool","awesome","memes","nice","words","school","bored","sentence"], // Misc words to start his thinking in case no one talks before he posts.
	last_sentence: ""
};

var api;

var post_countdown = 100;
setInterval(tryToPost, 36000 / 8); // Every 7.5 minutes there's a 50% chance of decreasing the post countdown.
