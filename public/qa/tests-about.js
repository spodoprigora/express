suite('Test about page', () => {
    test('page must have link on contact page', () => {
        assert($('a[href="/contact"]').length);
    });
});