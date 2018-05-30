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
app.use('/upload', (req, res, next) => {
  const now = Date.now();
  jqupload.fileHandler({
    uploadDir: () => {
      return `${__dirname}/public/uploads/${now}`;
    },
    uploadUrl: () => {
      return `/uploads/${now}`;
    },
  })(req, res, next);
})

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


