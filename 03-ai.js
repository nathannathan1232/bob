/*
	This file contains the main functions for bob.
	The messageIn and messageOut functions in main.js call these functions.
*/

function shouldRespond(msg){
	return msg.match(/bob|everyone|^@/ig) && true;
}

function wordIndex(word){
	for(var i = 0; i < db.w.length; i++)
		if(db.w[i].word === word)
			return i;
	return -1; // Unknown word
}

/*
	Each sentence is inspected individually and words are either
	added to the database with information or more information is
	gathered about that word.
*/

function learnWords(words){
	words = sanitizeInput(words).split(" ").reverse();
	
	if(words.length < 1)
		return 0;

	for(var i = 0, w_length = words.length; i < w_length; i++){

		var index = wordIndex(words[i]);

		if(index < 0){ // If word is not known yet
			var new_word = {
				word: words[i],
				after: [],
				related: [],
				count: 0
			};
			var words_after = [];

			db.w.push(new_word);

			index = wordIndex(words[i]); // Set index now that the word exists
		}

		if(!db.w[index].related)
			db.w[index].related = [];

		db.w[index].count++;

		var words_after = [];
		for(var x = 0; x < 3; x++){
			if(i > x)
				words_after.push(wordIndex(words[i-(x+1)]));
			else if(i == x)
				words_after.push(-1);
		}
		db.w[index].after.push(words_after);
	}

	// Looks at the last sentence/message and learns related words.

	if(db.last_sentence){
		var main_in_last = findMainWords(db.last_sentence);
		var main_in_this = findMainWords(words);
		for(var a = 0, am = main_in_last.length; a < am; a++)
			for(var b = 0, bm = main_in_this.length; b < bm; b++){
				var index = wordIndex(main_in_last[a]);
				if(index > -1)
					db.w[index].related.push(main_in_this[b]);
			}
	}
	db.last_sentence = words;

	var important_words = findMainWords(words); // Add the main word to what bob is thinking about
	db.thinking.push(important_words[0]);
	if(db.thinking.length > 20)
		db.thinking.shift();

}

/*
	Generates a response based on an input message.
*/

function genMessage(topic){
	//The starting word is one of the important words from the original message
	var important_words = findMainWords(topic); console.log("Important words: " + important_words);
	var word = pickFirstWord(important_words);

	var sentence = db.w[word].word;

	var length = Math.floor(Math.random()*(15)+25);

	var words_done = [word];
	var possible = [[],[],[]];

	for(var i = 0; i < length; i++){
		if(db.w[word].after[0].length > 0){

				possible[0] = db.w[word].after;
			if(i > 1){
				possible[1] = db.w[words_done[words_done.length - 2]].after;
			if(i > 2)
				possible[2] = db.w[words_done[words_done.length - 3]].after;
			}

			word = pickNext(possible[0],possible[1],possible[2],[words_done[words_done.length - 1], words_done[words_done.length - 2] || false],important_words);	
			words_done.push(word);
			if(word > -1){
				sentence += " " + db.w[word].word;
			} else
				i = length;
		}
	}

	sentence += ".";
	return capitalizeFirstLetter(sentence);
}

// Chooses the next word in the sentence based on the last 3 words and the topic.

function pickNext(a, b, c, prev, topic){

	var c_possible = [];
	for(var i = 0; i < c.length; i++)
		if(prev[0] == c[i][1] && prev[1] == c[i][0])
			c_possible.push(c[i][2]);

	if(c_possible.length > 0){
		return c_possible[r(c_possible)];
	}

	var b_possible = [];
	for(var i = 0; i < b.length; b++)
		if(prev[0] == b[i][0])
			b_possible.push(b[i][1]);
	
	if(b_possible.length > 0){
		return b_possible[r(b_possible)];
	}
		
	var a_possible = [];
	for(var i = 0; i < a.length; i++)
		a_possible.push(a[i][0]);

	if(a_possible.length > 0){
		return a_possible[r(a_possible)];
	}

	return db.w[r(db.w)].word;
}

/*
	Finds important words in a sentence like the topic and anything related to it. Takes an array.
*/

function findMainWords(words){
	var important = [];
	var avg_count = avgCount();
	for(var i = 0; i < words.length; i++){
		if(db.w[wordIndex(words[i])].count < avg_count * 100 && !words[i].match(/bob/))
			important.push(words[i]);
	}

	// Sort by word length.
	important = important.sort(function(a, b){
		return b.length - a.length;
	});
	
	if(important.length > 0)
		return important;
	else
		return words[r(words)];
}

/*
	Picks the first word of a response.
*/

function pickFirstWord(msg){
	var main_words = findMainWords(msg);
	
	var possible = Array(main_words.length);

	for(var i = 0; i < possible.length; i++)
		possible[i] = db.w[wordIndex(main_words[i])].related;

	if(possible.length > 1)
		for(var i = 0; i < possible[0].length; i++)
			for(var x = 0; x < possible[1].length; x++)
				if(possible[0][i] == possible[1][x])
					return wordIndex(possible[0][i]);

	if(possible[0].length < 1)
		return wordIndex(main_words[r(main_words)]);

	return wordIndex(possible[0][r(possible[0])]);
}

// Finds the average count for a word. Useful for finding the rarity of a word in relation to every other word.

function avgCount(){
	var avg = 0;
	for(var i = 0; i < db.w.length; i++)
		avg += db.w[i].count;
	avg /= db.w.length;
	return avg;
}