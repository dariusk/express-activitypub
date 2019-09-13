const ASContext = 'https://www.w3.org/ns/activitystreams';

function convertId(obj) {
    if (obj._id) {
        obj.id = obj._id
        delete obj._id
    }
    return obj
}
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
    obj['@context'] = ASContext;
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