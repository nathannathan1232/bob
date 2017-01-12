/*
	This file contains useful functions for various purposes.
*/

/*
	This function sanitizes every input message so things like case don't matter,
	and weird things like "------" don't show up in what Bob says.
*/

function sanitizeInput(str) {
	return removeNonWords(
			str
				.toLowerCase()
				.replace(/  *|\t/g, " ")
				.replace(/\n/g, " ")
				.split(" ")
		).join(" ");
}

function removeNonWords(words){
	var invalid_words = [
		"",
		" "
	];
	for(var i = 0; i < words.length; i++){
		if(includes(invalid_words, words[i])){
			words.splice(i, 1);
			i--;
		}
	}
	return words;
}

function removeUnknownWords(words){
	for(var i = 0; i < words.length; i++){
		if(wordIndex(words[i]) === -1){
			words.splice(i, 1);
			i--;
		}
	}
	return words;
}

function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function includes(arr, item){
	for(var i = 0; i < arr.length; i++){
		if(arr[i] == item)
			return true;
	}
	return false;
}

function r(arr){
	return Math.floor(Math.random()*arr.length);
}

/*
	Compare two arrays. Return the index of the first word in [a] that matches something in [b].
*/

function compare(a, b){
	for(var i = 0; i < a.length; i++)
		if(includes(b, a[i]))
			return i;
	return false;
}

function swearFilter(str){
	return str.replace(/fuck|shit|damn|porn|dick|slut|cunt|bitch|mast.rba|vagina|penis/ig, "****");
}

function coinFlip() {
	if(Math.random() >= .5)
		return "Heads";
	else
		return "Tails";
}
