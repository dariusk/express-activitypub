const { ASContext } = require('./consts')
module.exports.validators = require('./validators');
const config = require('../config.json')

function isObject(value) {
    return value && typeof value === 'object' && value.constructor === Object
}
// outtermost closure starts the recursion counter
// const level = 0;
function traverseObject(obj, f) {
    const traverse = o => {
        // const level = level + 1
        // if (level > 5) return o
        traverseObject(o, f)
    }
    if (!isObject(obj)) return obj;
    Object.keys(obj).forEach(traverse)
    return f(obj);
}
module.exports.toJSONLD = function (obj) {
    obj['@context'] = obj['@context'] || ASContext;
    return obj;
}

module.exports.arrayToCollection = function (arr, ordered) {

    return {
        '@context': ASContext,
        totalItems: arr.length,
        type: ordered ? 'orderedCollection' : 'collection',
        [ordered ? 'orderedItems' : 'items']: arr,
    }
}

module.exports.userNameToIRI = function (user) {
    return `https://${config.DOMAIN}/u/${user}`
}