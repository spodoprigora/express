const Browser = require('zombie');
const assert = require('chai').assert;

let browser;
suite('Межстраничные тесты', () => {
    setup(() => {
        browser = new Browser();
    });

    test('запрос расценок для групп со страницы туров по реке Худ должен заполнять поле реферера', (done) => {
        const referrer = 'http://localhost:3000/tours/hood-river';
        browser.visit(referrer, () => {
            browser.clickLink('.requestGroupRate', () => {
                browser.assert.element('form input[name=referrer]',  referrer);
                done();
            });
        });
    });

    test('запрос расценок для групп со страницы туров пансионата Орегон Коуст должен заполнять поле реферера', (done) => {
        const referrer = 'http://localhost:3000/tours/oregon-coast';
        browser.visit(referrer, () => {
            browser.clickLink('.requestGroupRate', () => {
                browser.assert.element('form input[name=referrer]',  referrer);
                done();
            });
        });
    });

     test('посещение страницы запрос расценок для групп напрямую должен приводить к пустому полю реферера', (done) => {
         const referrer = 'http://localhost:3000/tours/request-group-rate';
         browser.visit(referrer, () => {
            browser.assert.element('form input[name=referrer]',  '');
            done();

         });
     });
});
