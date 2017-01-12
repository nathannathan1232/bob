/*
	This file is for Bob's wall posts.
*/

function genPost() {

	var message = genMessage(removeUnknownWords(db.thinking));

	postToWall(swearFilter(message))

}

/*
	Every once in a while bob posts something. This function triggers that.
*/

function tryToPost() {
	if(Math.random() > .5)
		post_countdown--;

	if(post_countdown < 1) {
		console.log("Generating wall post!");
		genPost();
		post_countdown = 100;
	}
}

function postToWall(message) {
	
	var horseman = new Horseman();

	horseman
		.viewport(1920,1080)
		.open('http://www.facebook.com')
		.type('input[name="email"]', user_email) // Login
		.type('input[name="pass"]', user_password)
		.waitForSelector('#u_0_r')
		.click('#loginbutton')
		.waitForNextPage()
		.mouseEvent('click', 750, 125, 'left').wait(200) // Click on post textarea
		.do(function(done){
			horseman.keyboardEvent('keypress', message);
			done();
		})
		.wait(500)
		.mouseEvent('click', 1110, 300, 'left').wait(500) // Click post button
		.screenshot("./test3.png").log("Posted to wall:").log(message)
		.close();
}