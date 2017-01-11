/*
	messageIn() is called when a message is recieved.
	It submits the sentences to learnWords, then decides weather or not to respond and returns either the response or false.
	This function doesn't make sense. Good luck.
*/

function messageIn(e){

	if(typeof e == "undefined" || !e.body || typeof e.body != "string")
		return false;

	var msg = e.body.replace(/\./, " ");

	console.log("Message in: " + msg + " ##########");

	learnWords(removeNonWords(msg.split(" ")).reverse()); // Learn words from the message

	if(shouldRespond(msg))
		return messageOut(msg, e);
	else {
		return false;
	}
}

/*
	messageOut generates a response based on the last message in. It first looks for commands and if it's not a command
	it generates a response.
*/

function messageOut(o_msg, e){
	var msg = o_msg.split(" ").reverse(); // Why do I reverse this? Who knows?
	for(var i = 0; i < msg.length; i++)
		if(wordIndex(msg[i]) == -1){
			msg.splice(i, 1); i--;
		}

	var out = games(o_msg, e) || command(o_msg, e) || genMessage(msg);

	console.log("Message out: " + out);

	return swearFilter(out);
}

function games(o_msg, e) {

	if(o_msg.match(/@trivia/i)) {
		var result = trivia.input(o_msg.replace(/@trivia */i, ""), e.senderID);
		return result;
	} else console.log("Not trivia");

	return false;
}

/*
	Learns words without generating a response.
*/

function justLearn(msg){
	var msg_words = msg.replace(/\?/, ".");
	msg_words = msg.split(".");
	for(var i = 0; i < msg_words.length; i++)
		learnWords(removeNonWords(msg_words[i].split(" ")).reverse());
	console.log("Words learned!");
}

// This line is for when bob needs to relearn words
//justLearn(fs.readFileSync("/home/nathan/Documents/ai/reddit words.txt").toString()); justLearn(fs.readFileSync("/home/nathan/Documents/words/words.txt").toString()); justLearn(fs.readFileSync("/home/nathan/Documents/f/messages.txt").toString());

// Load word db from file.

db.w = JSON.parse(fs.readFileSync("/home/nathan/Documents/f/db.txt").toString());

login({email: user_email, password: user_password}, function callback (err, api_o) {
    if(err) return console.error(err);

    api = api_o;

    api.setOptions({listenEvents: true});
    var stopListening = api.listen(function(err, event) {
        if(err) return console.error(err);

        switch(event.type) {
          case "message":
            if(event.body === '/stop') {
              api.sendMessage("Goodbye...", event.threadID);
              return stopListening();
            }
            api.markAsRead(event.threadID, function(err) {
              if(err) console.log(err);
            });
            var msg = {
      			body: messageIn(event),
   			}
            api.sendMessage(msg, event.threadID);
            break;
          case "event":
            console.log(event);
            break;
        }
    });
});