const express = require('express');
const handlebars = require('express-handlebars').create({
  defaultLayout: 'main',
  helpers: {
    section: function(name, options){
      if (!this._sections) this._sections = {};
      this._sections[name] = options.fn(this);
      return null;
    },
  },
});
const fortune = require('./lib/fortune.js');
const bodyParser = require('body-parser').urlencoded({ extended: true });
const formidable = require('formidable');
const jqupload = require('jquery-file-upload-middleware');
const cookieParser = require('cookie-parser');
const credentials = require('./credentials');
const expressSession = require('express-session');
const cartValidation = require('./lib/cartValidation');
const emailService = require('./lib/email.js')(credentials);

function getWeatherData(){
  return {
    locations: [
      {
        name: 'Портленд',
        forecastUrl: 'http://www.wunderground.com/US/OR/Portland.html',
        iconUrl: 'https://icons.wxug.com/i/c/v4/cloudy.svg',
        weather: 'Сплошая облачность',
        temp: '54.1 F (12.3 C)',
      },
      {
        name: 'Бенд',
        forecastUrl: 'http://www.wunderground.com/US/OR/Bend.html',
        iconUrl: 'https://icons.wxug.com/i/c/v4/cloudy.svg',
        weather: 'Малооблачно',
        temp: '55.0 F (12.8 C)',
      },
      {
        name: 'Манзанита',
        forecastUrl: 'http://www.wunderground.com/US/OR/Manzanita.html',
        iconUrl: 'https://icons.wxug.com/i/c/v4/rain.svg',
        weather: 'Небольшой дождь',
        temp: '55.0 F (12.8 C)',
      },
    ],
  };
}
const VALID_EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

const app = express();

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.set('port', process.env.PORT || 3000);


app.use(express.static(__dirname + '/public'));
app.use(bodyParser);
app.use((req, res, next) => {
  res.locals.showTests = app.get('env') !== 'production' && +req.query.test === 1;
  next();
});
app.use((req, res, next) => {
  if (!res.locals.partials) res.locals.partials = {};
  res.locals.partials.weatherContext = getWeatherData();
  next();
});
/*app.use('/upload', (req, res, next) => {
  const now = Date.now();
  jqupload.fileHandler({
    uploadDir: () => {
      return `${__dirname}/public/uploads/${now}`;
    },
    uploadUrl: () => {
      return `/uploads/${now}`;
    },
  })(req, res, next);
})*/
app.use(cookieParser(credentials.cookieSecret));
app.use(expressSession({
  resave: false,
  saveUninitialized: false,
  secret: credentials.cookieSecret,
}));
app.use((req, res, next) => {
  res.locals.flash = req.session.flash;
  delete req.session.flash;
  next();
});
app.use(cartValidation.checkWaivers);
app.use(cartValidation.checkGuestCounts);

app.get('/', (req, res) => {
  res.render('home');
});

app.get('/about', (req, res) => {
  res.render('about', {
    fortune: fortune.getFortune(),
    pageTestScript: '/qa/tests-about.js'
  });
});
app.get('/tours/hood-river', (req, res) => {
  res.render('tours/hood-river');
});
app.get('/tours/request-group-rate', (req, res) => {
 res.render('tours/request-group-rate');
});
app.get('/tours/oregon-coast', (req, res) => {
  res.render('tours/oregon-coast');
});
app.get('/jquery-test', (req, res) => {
  res.render('jquery-test');
});
app.get('/nursery-rhyme', (req, res) => {
  res.render('nursery-rhyme');
});
app.get('/data/nursery-rhyme', (req, res) => {
  res.json({
    animal: 'бельченок',
    bodyPart: 'хвост',
    adjective: 'пушистый',
    noun: 'черт',
  });
});
app.get('/thank-you', (req, res) => {
  res.render('thank-you');
});
app.get('/newsletter', (req, res) => {
  res.render('newsletter', { csrf: 'CSRF token goes here' });
})
/*//for simple submit form
app.post('/process', (req, res) => {
  console.log(`Form (from querystring): ${req.query.form}`);
  console.log(`CSRF token (from hidden form field): ${req.body._csrf}`);
  console.log(`Name (from visible form field): ${req.body.name}`);
  console.log(`Name (from visible form field): ${req.body.email}`);
  res.redirect(303, '/thank-you');
})*/
app.post('/process', (req, res) => {
  if (req.xhr || req.accepts('json.html') === 'json') {
    res.send({sucess: true});
  } else {
    res.redirect(303, '/thank-you');
  }
});

app.get('/contest/vacation-photo', (req, res) => {
  const now = new Date();
  res.render('contest/vacation-photo', {
    year: now.getFullYear(),
    mounth: now.getMonth(),
  });
});
app.post('/contest/vacation-photo/:year/:month', (req, res) => {
  const form = new formidable.IncomingForm();
  form.parse(req, (err, fields, files) => {
    if (err) return res.redirect(303, '/error');
    console.log('received fields:');
    console.log(fields);
    console.log('received files:');
    console.log(files);
    res.redirect(303, '/thank-you');
  });
});
app.post('/cart/checkout', (req, res, next) => {
  const cart = req.session.cart;
  if (!cart) next(new Error('корзины не существует'));
  const name = req.body.name || '';
  const email = req.body.email || '';
  if (!email.match(VALID_EMAIL_REGEX)) {
    return res.next(new Error('Некорректный email'));
  }

  cart.number = Math.random().toString().replace(/^0\.0*/, '');
  cart.billing = { name, email };
  res.rendedr('email/cart-thank-you', { layout: null, cart }, (err, html) => {
    if (err) console.log('Ошибка в шаблоне письма');
    emailService.send(cart.billing.email, 'Thank youfor booking your tip with Meadowlark Travel', html);
  }, (err) => {
    if (err) console.error(`Не могу отправить подтверждение ${err.stack}`);
  });

});

// for now, we're mocking NewsletterSignup:
function NewsletterSignup(){}
NewsletterSignup.prototype.save = function (cb) {
  cb();
};


app.post('/newsletter', (req, res) => {
  const name = req.body.name || '';
  const email = req.body.email || '';
  if (!email.match(VALID_EMAIL_REGEX)) {
    if (req.xhr) return res.json({ error: 'Некорректный email' });
    req.session.flash = {
      type: 'danger',
      intro: 'Ошибка проверки',
      message: 'Введенный email некорректен',
    };
    return res.redirect(303, '/newsletter/archive');
    const newsletter = new NewsletterSignup({ name, email }).save((err) => {
      if (err) {
        if (req.xhr) return res.json({ error: 'Ошибка базы данных' });
        req.session.flash = {
          type: 'danger',
          intro: 'Ошибка базы данных',
          message: 'Произошла ошибка базы данных',
        };
        return res.redirect(303, '/newwsletter/archive');
      }
      if (req.xhr) return res.json({ success: true });
      req.session.flash = {
        type: 'success',
        intro: 'Спасибо',
        message: 'Вы подписались на новости',
      };
      return res.redirect(303, '/newsletter/archive');
    });
  }
});

app.use((req, res) => {
  res.status(404);
  res.render('404');
});

app.use((err, req, res, next) => {
  console.log(err.stack);
  res.status(500);
  res.render('500');
});

app.listen(app.get('port'), () => {
  console.log(`Express started on ${app.get('port')}`);
});


