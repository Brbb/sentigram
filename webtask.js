var request = require('request');
var indico = require('indico.io');
var token = '<my:telegramToken>',
  baseUrl = 'https://api.telegram.org/bot' + token + '/';

var logError = function (err) { console.log('Error:' + err); }
indico.apiKey = '<indico-api-key>';

module.exports = function (context, cb) {

  if (context === null || context.body === null || context.body.message === null ||
    context === undefined || context.body === undefined || context.body.message === undefined) {
    cb(null, { status: 'Ok, but null/undefined message' });
  }
  else {

    var command = context.body.message.text;
    var chat = context.body.message.chat.id;

    if (command.lastIndexOf('/sentiment', 0) === 0) {
      var sentimentText = command.replace('/sentiment', '').trim();
      
      indico.sentimentHQ(sentimentText)
        .then(function (res) {
          console.log(res);
          var sentiment ='*Sentiment analysis*\n'
                          +'positivity level: '+prepareEmotion(res);
          
          sendMessage(chat, sentiment);
        })
        .catch(logError);

      cb(null, { status: 'ok' });
    }
    else if (command.lastIndexOf('/emotions', 0) === 0) {
      // response message
      var joy = '😄';
      var angry = '😠';
      var fear = '😨';
      var sadness = '😢';
      var surprise = '😲';

      var text = command.replace('/emotions', '').trim();
      
      indico.emotion(text)
        .then(function (res) {
          console.log(res);
          var emotions ='*Emotions analysis*\n' 
                        +angry + ' '+prepareEmotion(res.anger)+'\n'
                        +fear + ' '+prepareEmotion(res.fear)+'\n'
                        +joy + ' '+prepareEmotion(res.joy)+'\n'
                        +sadness + ' '+prepareEmotion(res.sadness)+'\n'
                        +surprise + ' '+prepareEmotion(res.surprise)+'\n';
          
          sendMessage(chat, emotions);
        })
        .catch(logError);

      // not required but...
      cb(null, { status: 'ok' });
    }
    else
      cb(null, { status: 'Still ok' });
  }
};

var prepareEmotion = function(emotionValue){
  return (emotionValue * 100).toFixed(1)+'%';
}

var sendMessage = function (chatId, message) {
  request.post(
    baseUrl + 'sendMessage',
    {
      form: {
        'chat_id': chatId,
        'text': message,
        'parse_mode':'Markdown'
      }
    }
  );
};