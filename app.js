const express = require('express');
const handlebars = require('express-handlebars').create({defaultLayout: 'main'});

const app = express();
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
const fortunes = [
    'Победи свои страхи, или они победят тебя',
    'Рекам нужны истоки',
    'Не бойся неведомого',
    'Тебя ждет приятный сюрприз',
    'Будь проще везде, где только можно'
];
app.set('port', process.env.PORT || 3000);


app.use(express.static(__dirname + '/public'));
app.use((req, res, next) => {
    res.locals.showTests = app.get('env') !== 'production' && +req.query.test === 1;
    next();
});
app.get('/', (req, res) => {
    res.render('home');
});

app.get('/about', (req, res) => {
    const randomFortune = fortunes[Math.floor(Math.random() * fortunes.length)];
    res.render('about', {
       fortune: randomFortune,
       pageTestScript: '/qa/tests-about.js'
   });
});
app.get('/tours/hood-river', (req, res) => {
    res.render('tours/hood-river');
});
app.get('/tours/request-group-rate', (req, res) => {
   res.render('tours/request-group-rate');
});


app.use((req, res) => {
    res.status(404);
    res.render('404');
})

app.use((err, req, res, next) => {
    console.log(err.stack);
    res.status(500);
    res.render('500');
})

app.listen(app.get('port'), () => {
    console.log(`Express started on ${app.get('port')}`);
})