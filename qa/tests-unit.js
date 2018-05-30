const fortune = require('../lib/fortune.js');
const expect = require('chai').expect;

suite('тесты печений предсказаний', () => {
  test('getFortune() должна возвращать предсказание', () => {
    expect(typeof fortune.getFortune() === 'string');
  });
});
