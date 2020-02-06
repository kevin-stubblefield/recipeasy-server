function slugify(inputString) {
    if (typeof(inputString) !== 'string') {
        return null;
    }

    let result;

    result = inputString.split(' ').join('-').toLowerCase();

    return result;
}