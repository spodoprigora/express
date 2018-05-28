suite('Test global', () => {
    test('page have correct title', () => {
        assert(document.title && document.title.match(/\S/) && document.title.toUpperCase() !== 'TODO');
    });
});