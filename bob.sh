cat 01-header.js 02-functions.js 03-ai.js 04-commands.js 05-posting.js 10-trivia.js 99-main.js > bob-compiled.js
nodejs ./bob-compiled.js --user_email=$1 --user_password=$2 --admin_password=$3