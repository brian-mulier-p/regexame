# (?i)(?:RE)?G(?:EX)?4ME(?-i)
A fun way to enjoy and learn REGEX as a team :)

# Start the app
Simply run `npm start` and you're ready to go. If needed, you can run `npm run start:dev` to run the application with sources linked for debug.

# What's the goal of the app ?
The "teacher" should start creating a server and specify a few examples which should be matched by the students.
The "students" can then join the server and start specifying a REGEX to try to match all given examples. There is an indicator next to each example which explains whether the regex matches against it or not. Note that if there is nothing next to examples, it means that you're REGEX is probably incorrect.

For now the "go back to menu" button won't clean the app properly so everyone should probably reload the page to start from the beginning in a new server.

# How to expose it for students ?
You can use https://dashboard.ngrok.com/get-started/setup for a quick start to expose your local app on internet. Any cloud solution should also work but it has to be persistent (cloud functions won't work for example because the websocket should be kept running).
