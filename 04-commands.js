
/*
	Commands are useful and awesome.
	Commands detection should be somewhat strict so it only gets detected when it should be.
	In general, regex should be used instead of something like msg[2] == "". Regex can ignore capitol letters
	and it can be made to be more relaxed than strict comparison operators.
*/

function command(o_msg, e){

	if(o_msg.match(/^@bob/i)) // Detect bob code
		return bobCode(o_msg);

	// o_msg is the original message, msg is split by word, and msg_b is the original minus the bob.
	var msg = o_msg.split(" ");
	var msg_b = o_msg.replace(/bob /i, "");

	if(!msg[0].match(/bob/i) || msg.length < 2)
		return false; // Returns false if the message doesn't start with bob.

	// Returning false means that bob will generate a normal response.

	if(msg[1].match(/calc|calculate|math|evaluate/i)){
		var equation = [];
		for(var i = 0; i < msg.length; i++)
			if(i > 1)
				equation.push(msg[i]);
		equation = equation.join(" ");
		var result = math.eval(equation);
		return result.toString();
	}

	if(o_msg.match(/how many words|words do you|do you know|how smart|what words/ig))
		return "I know " + db.w.length + " words.";

	if(o_msg.replace(/bob /i, "").match(/what can|you do|your abilities|you able/i)){
		var message = [
			"I can convert currency. Try \"Bob convert USD to CAD\".",
			"I can calculate stuff. Try \"Bob calc 5 * sin(3) / 2\"",
			"I can tell you how many words I know. Try \"Bob how many words do you know?\"",
			"I can countdown to a holiday. Try \"Bob how many days until christmas?\"",
			"I can pick a random number. Try \"Bob pick a random number between 5 and 800\"",
			"I can tell time. Try \"What time is it?\"",
			"I can flip a coin. Try \"Bob flip 25 coins\""
		];
		return message[r(message)];
	}

	if(msg_b.match(/what version|your version/i))
		return "I am version " + version;

	if(msg_b.match(/random number/i)){
		if(msg_b.match(/pick a random number between/i)){
			var min = msg[6],
				max = msg[8];
			return (Math.floor(Math.random() * (max - min) + min)).toString();
		} else {
			return Math.random().toString();
		}
	}

	if(msg_b.match(/what time|the time|what day|what year|what month/i))
		return (new Date());

	if(o_msg.match(/how many times|heard the word/i)){
		if(wordIndex(msg[msg.length - 1]) > -1)
			return db.w[wordIndex(msg[msg.length -1])].count + " times.";
		else
			return false;
	}

	// Logs information about a word to chat

	if(msg_b.match(/show info for/i))
		return JSON.stringify(db.w[wordIndex(msg[msg.length - 1])]);

	if(msg_b.match(/remind me [\s\S]* in/i) && e){
		var reminder = msg_b.replace(/remind me to|remind me|in[0-9]*seconds|in[\s\S]*hours|in[\s\S]*minutes/ig, "");
		var time = parseInt(msg[msg.length - 2]);

		var mod = msg[msg.length - 1];
		var mod_val = 0;
		
		if(mod.match(/second/i))
			mod_val = 1000;
		else if(mod.match(/minute/i))
			mod_val = 60000;
		else if(mod.match(/hour/i))
			mod_val = 3600000;
		else
			return "How long is a " + mod + "?";

		setTimeout((function(){api.sendMessage(reminder, e.threadID)}), time * mod_val);

		return "Reminder set!";
	}

	if(msg_b.match(/change color/i) && e){
		var color = msg[msg.length - 1];
		if(!color.length > 3 || !color.match(/#.../i)) {
			color = '#'+'0123456789abcdef'.split('').map(function(v,i,a){
				return i > 5 ? null : a[Math.floor(Math.random() * 16)] }).join('');
		}

 		api.changeThreadColor(color, e.threadID, function callback(err) {
 				if(err) return console.error(err);
 		});

 		return "Color changed to " + color;
 	}

 	if(msg_b.match(/flip.*coin/i)) {
 		var num;
 		if(!msg_b.match(/times|coins/i))
 			return coinFlip();
 		else if(msg_b.match(/flip.*coins/))
 			num = parseInt(msg_b.replace(/flip|coi.*| /ig, ""));
 		else if(msg_b.match(/flip a coin.*times/i))
 			num = parseInt(msg_b.replace(/flip a coin|times| /ig, ""));
	
		var result = "";
		for(var i = 0; i < num; i++) {
			result += coinFlip() + " ";
		}
		return result;
 	}

 	if(msg_b.match(/rps/i)) {
 		var choices = [
 			"rock", "paper", "scissors"
 		];
 		var chosen = msg[msg.length - 1];
 		var bobs_choice = r(choices);

 		if(msg_b.match(/finger.*gun/i))
 			return "*Finger guns back at you* aaaayyyYYY";

 		if(chosen == choices[(bobs_choice + 1) % 3])
 			return "I chose " + choices[bobs_choice] + " and you chose " + chosen + ". You win! :(";
 		else if(chosen == choices[bobs_choice])
 			return "I chose " + choices[bobs_choice] + " and you chose " + chosen + ". It's a tie!";
 		else if(chosen == choices[(bobs_choice + 2) % 3])
 			return "I chose " + choices[bobs_choice] + " and you chose " + chosen + ". I win! :)";
 		else
 			return chosen + " is not a choice mate. Learn to play! ;)";
 	}

 	if(msg_b.match(/replace.*with.*in/i)) { // Regex
 		var strings = msg_b.match(/".*"/g)[0].split(" in ");
 		var string_b = strings[0].replace(/^"|"$/g, "");
 		var string_a = strings[1].replace(/^"|"$/g, "");
 		var reg = msg_b.match(/\/.*\/\S*/i)[0];
 		var elemets = reg.replace(/\//, "").split("/");
 		exp = new RegExp(elemets[0], elemets[1]);
 		return string_a.replace(exp, string_b);
 	}

 	if(msg_b.match(/gen.*random string/i)) {
 		var length;
 		if(msg_b.match(/length [0-9]*/i))
	 		length = parseInt(msg[msg.length - 1]);
 		else
 			length = 10;

 		var letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890".split("");
 		var result = "";
 		for(var i = 0; i < length; i++)
 			result += letters[r(letters)];
 		return result;
 	}

 	if(msg[msg.length - 1] == admin_password) { // Admin commands

		if(msg_b.match(/write database/)){
			fs.writeFile('db.json', JSON.stringify(db), function (err) {
				if (err)
					return console.log(err);
				console.log('Database saved to file!');
			});
			return "ok";
		}

		if(msg_b.match(/post to wall/i)) {
			genPost();
			return "Done!";
		}

		if(msg_b.match(/how long until you post/i))
			return post_countdown + "/100";
		
		if(msg_b.match(/decrease post countdown by/i)) {
			post_countdown -= msg[msg.length - 2];
			return "Post countdown is now " + post_countdown;
		}
	}

	return false;
} // End commands

/*
	This function evaluates bob's special code.
	It allows people to make queries about bob and make him do certain things without
	the eval function.
*/

function bobCode(code) {
	code = code.replace(/^@bob /i, "");

	var lines = code.split(";");

	var result = {};

	for(var i = 0; i < lines.length && i < 15; i++) {
		var line = lines[i];
		var args = line.replace(/^[\s\S]*\(|\)$/g, "").split(",");
		
		var arg_spaces = JSON.parse(JSON.stringify(args));
		for(var a = 0; a < arg_spaces.length; a++)
			arg_spaces[a].replace(/  */g, " ");

		for(var a = 0; a < args.length; a++)
			args[a] = args[a].replace(/ /g, "");

		if(line.match(/^words\(\)/))
			result.words = db.w.length;

		if(line.match(/^wordInfo\([\s\S]*\)/)) {
			var info = {};
			for(var a = 0; a < args.length; a++) {
				if(wordIndex(args[a]) > -1) {
					var this_word_info = db.w[wordIndex(args[a])];
					if(this_word_info && JSON.stringify(this_word_info).length < 800)
						info[args[a]] = this_word_info;
					else if(JSON.stringify(this_word_info).length >= 800)
						info[args[a]] = "Too much info to log";
				} else
					info[args[a]] = "Unknown word";
			}
			result.info = info;
		}

		if(line.match(/^wordCount\([\s\S]*\)/)) {
			var counts = {};
			for(var a = 0; a < args.length; a++) {
				if(arg_spaces[a].match(/. ./)) {

					var words = arg_spaces[a].split(" ");
					for(var i = 0; i < words.length; i++)
						words[i] = wordIndex(words[i]);

					var matches_phrase = db.w[words[0]].after;
					for(var w = 0; w < words.length; w++)
						for(var i = 0; i < matches_phrase.length; i++)
							if(matches_phrase[i][w] != words[w + 1] && words[w + 1]) {
								matches_phrase.splice(i, 1);
								i--;
							}

					var phrase_display = "";
					for(var i = 0; i < words.length; i++)
						phrase_display += db.w[words[i]].word + " ";

					counts[phrase_display.replace(/ $/, "")] = matches_phrase.length;
				} else {
					if(wordIndex(args[a]) > -1) {
						var this_word_count = db.w[wordIndex(args[a])].count;
						counts[args[a]] = this_word_count;
					} else
						counts[args[a]] = "Unknown Word";
				}
			}
			result.counts = counts;
		}

		if(line.match(/^relatedWords\([\s\S]*\)/)) {
			var related = {};
			for(var a = 0; a < args.length; a++) {
				if(wordIndex(args[a]) > -1) {
					var this_word_related = db.w[wordIndex(args[a])].related;
					if(this_word_related && JSON.stringify(this_word_related).length < 800)
						related[args[a]] = this_word_related;
					else if(JSON.stringify(this_word_related).length >= 800)
						related[args[a]] = "Too many related words";
				} else
						related[args[a]] = "Unknown word";
				
			}
			result.related = related;
		}

		if(line.match(/^topWords\([\s\S]*\)/)) {
			var num = parseInt(args[0]); console.log(num);
			var top_words = {};
			var words_length = db.w.length;
			for(var x = 0; x < num; x++) {
				var top_count = 0;
				var top_word = 0;

				for(var w = 0; w < words_length; w++)
					if(db.w[w].count > top_count && !top_words[db.w[w].word]) {
						top_count = db.w[w].count; console.log(w);
						top_word = db.w[w].word;
					}
				top_words[top_word] = top_count;
			}

			result.top_words = top_words;
		}

		if(line.match(/^thinking\([\s\S]*\)/))
			result.thinking = db.thinking;

		if(line.match(/^version\([\s\S]*\)/))
			result.version = version;

		if(line.match(/^lastSentence\([\s\S]*\)/))
			result.last_sentence = db.last_sentence;

		if(line.match(/^averageWordCount\([\s\S]*\)/))
			result.average_word_count = avgCount();

	}
	console.log(result);
	return JSON.stringify(result, null, "\t");
}
