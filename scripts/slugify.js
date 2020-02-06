function slugify(inputString) {
    if (typeof(inputString) !== 'string') {
        return null;
    }

    let result;

    // remove any existing hyphens first because I'm bad at regex and other reasons that aren't important :)
    result = inputString.replace(/[-]/g, ' ');
    result = result.replace(/[\s]+/g, '-').toLowerCase();

    return result;
}

module.exports = slugify;