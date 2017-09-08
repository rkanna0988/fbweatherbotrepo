'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()

app.set('port', (process.env.PORT || 5000))

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// Process application/json
app.use(bodyParser.json())

// Index route
app.get('/', function (req, res) {
	res.send('Hello Ramana, I am your chat bot')
})

// for Facebook verification
app.get('/webhook/', function (req, res) {
	if (req.query['hub.verify_token'] === 'my_bot_is_weather_bot') {
		res.send(req.query['hub.challenge'])
	}
	res.send('Error, wrong token')
})

// Spin up the server
app.listen(app.get('port'), function() {
	console.log('running on port', app.get('port'))
})

app.post('/webhook/', function (req, res) {
    let messaging_events = req.body.entry[0].messaging
    for (let i = 0; i < messaging_events.length; i++) {
	    let event = req.body.entry[0].messaging[i]
	    let sender = event.sender.id
	    if (event.message && event.message.text) {
		    let text = event.message.text
			if(text === 'weather')
			{
				let url = "http://api.openweathermap.org/data/2.5/weather?q=portland&units=imperial&appid=bf1c64016018980463a350575ffdb905"
				request(url, function (err, response, body) {
				  if(err){
					console.log('error:', err);
				  } else {
					let weather = JSON.parse(body)
					let message = `It's ${weather.main.temp} degrees in ${weather.name}!`;
					sendTextMessage(sender, message.substring(0, 200))
				  }
				});				
			}
			else
				sendTextMessage(sender, text.substring(0, 200))
	    }
    }
    res.sendStatus(200)
})

const token = "EAAbu0c39avkBADkngwn3jtW1QZAmsPoKWdwcIFV8MpBVcdZAv3nFwsvUz2Ia08UbayIKV4JGJ3ZCCXjAuabzGBcHQesdPb3qVgAscLQ9lFfkHQ2QQlpeohThePHedWJY8aICbY5GYEpDlZBHJoFA1ULi8B6u1VfrC1HHvw0psgZDZD"

function sendTextMessage(sender, text) {
    let messageData = { text:text }
    request({
	    url: 'https://graph.facebook.com/v2.6/me/messages',
	    qs: {access_token:token},
	    method: 'POST',
		json: {
		    recipient: {id:sender},
			message: messageData,
		}
	}, function(error, response, body) {
		if (error) {
		    console.log('Error sending messages: ', error)
		} else if (response.body.error) {
		    console.log('Error: ', response.body.error)
	    }
    })
}