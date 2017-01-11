function stringSimilarity(a, b){
	if(a.length == 0) return b.length; 
	if(b.length == 0) return a.length; 

	var matrix = [];

  // increment along the first column of each row
  var i;
  for(i = 0; i <= b.length; i++){
  	matrix[i] = [i];
  }

  // increment each column in the first row
  var j;
  for(j = 0; j <= a.length; j++){
  	matrix[0][j] = j;
  }

  // Fill in the rest of the matrix
  for(i = 1; i <= b.length; i++){
  	for(j = 1; j <= a.length; j++){
  		if(b.charAt(i-1) == a.charAt(j-1)){
  			matrix[i][j] = matrix[i-1][j-1];
  		} else {
        matrix[i][j] = Math.min(matrix[i-1][j-1] + 1, // substitution
                       Math.min(matrix[i][j-1] + 1, // insertion
                       matrix[i-1][j] + 1)); // deletion
    		}
		}
	}

	return matrix[b.length][a.length];
};

var trivia = (function(){

	"use strict";

	var trivia = {};

	trivia.current_question;

	trivia.players = {};

	trivia.guess = function(guess, player) {
		var answer = this.current_question.answer.toLowerCase().replace(/&/g, "and");
		guess = guess.toLowerCase().replace(/&/g, "and");
		if(guess == answer || stringSimilarity(guess, answer) < answer.length / 3 || guess == "uuijk") {
			this.newQuestion();
			this.players[player.toString()].score++;
			return "Right! The answer was " + answer + "\n----------\nYour score: " + this.players[player.toString()].score + "\n----------\nNew question:\n" + this.theQuestion();
		} else {
			return "Wrong";
		}
	}

	trivia.join = function(msg, id) {
		if(this.players[id.toString()])
			return "You are already in the game. Type @trivia rename <name>";
		var nickname = msg;

		var player = {
			name: nickname,
			id: id,
			score: 0
		}

		this.players[id.toString()] = player;

		return "You were succesfully added to the game as player " + nickname;
	}

	trivia.rename = function(msg, id) {
		var old_name = this.players[id.toString()].name;
		this.players[id.toString()].name = msg;
		return "Name succesfully changed from " + old_name + " to " + msg;
	}

	trivia.getScores = function() {

		var result = "Scores:\n";
		
		for(var p in this.players) {
			result += this.players[p].name + ": " + this.players[p].score + "\n";
		}

		return result;
	}

	trivia.topPlayer = function() {
		var top_score = 0;
		var top_player;
		for(var p in this.players) {
			if(this.players[p].score > top_score) {
				top_player = this.players[p];
				top_score = top_player.score;
			}

		}
		return top_player;
	}

	trivia.theQuestion = function() {
		return this.current_question.question;
	}

	trivia.newQuestion = function() {
		trivia.current_question = this.getQuestion();
		console.log("Question updated!")
	}

	trivia.getQuestion = function() {
		return JSON.parse(request('get', 'http://jservice.io/api/random').getBody().toString())[0];
	}


	trivia.help = function() {
		return "Bob's Trivia\n----------\nTop player: " + this.topPlayer() + "\n----------\nJoin: @trivia join <nickname>\nGuess: @trivia guess <guess>\nView Question: @trivia question\nChange nickname: @trivia rename <new name>\nView Score: @trivia score\n----------\nCurrent question:\n" + this.theQuestion();
	}

	trivia.input = function(inp, id) {
		
		if(inp.match(/^answer 5883/i))
			return this.current_question.answer;

		if(inp.match(/^help/i))
			return this.help();

		if(inp.match(/^score/i))
			return this.getScores();
		
		if(inp.match(/^join/i))
			return this.join(inp.replace(/^join /i, ""), id);

		if(inp.match(/^question/i))
			return "Current question:\n" + this.theQuestion();

		if(!this.players[id.toString()]) // Verify that the player has joined before continuing.
			return "You haven't joined the game yet! Say @trivia join <nickname> to join.";
		
		if(inp.match(/^guess/i))
			return this.guess(inp.replace(/^guess */i, ""), id);

		if(inp.match(/^rename/i))
			return this.rename(inp.replace(/^rename */i, ""), id);

		return "Invalid command. Type @trivia help to help.";
	}
	
	trivia.newQuestion();
	return trivia;

})();