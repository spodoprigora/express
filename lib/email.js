const nodemailer = require('nodemailer');

module.exports = function(credentials) {
  const mailTransport = nodemailer.createTransport('SMTP', {
    service: 'Gmail',
    auth: {
      user: credentials.gmail.user,
      pass: credentials.gmail.password,
    },
  });

  const from = '"Meadowlark Travel" <info@meadowlarktravel.com>';
  const errorRecipient = 'youremail@gmail.com';
  return {
    send: function(to, subj, body){
      mailTransport.sendMail({
        from: from,
        to: to,
        subject: subj,
        html: body,
        generateTextFromHtml: true
      }, function(err){
          if(err) console.error(' Невозможно отправить письмо: '
              + err);
      });
    },
    emailError: function(message, filename, exception){
      var body = '<h1>Meadowlark Travel Site Error</h1>' +
        'message:<br><pre>' + message + '</pre><br>';
      if (exception) body += 'exception:<br><pre>' +
         exception + '</pre><br>';
      if (filename) body += 'filename:<br><pre>' +
          filename + '</pre><br>';
      mailTransport.sendMail({
        from: from,
        to: errorRecipient,
        subject: 'Ошибка сайта Meadowlark Travel',
        html: body,
        generateTextFromHtml: true
      }, function(err){
        if (err) console.error(' Невозможно отправить письмо: ');
      });
    },
  };
};
