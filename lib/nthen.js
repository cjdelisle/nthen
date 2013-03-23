/*
 * Caleb James DeLisle
 * Sat Mar 23 01:42:29 EDT 2013
 * Public Domain
 */
;(function() {
var nThen = function(next) {
    var funcs = [];
    var calls = 0;
    var waitFor = function(func) {
        calls++;
        return function() {
            if (func) {
                func.apply(null, arguments);
            }
            calls = (calls || 1) - 1;
            while (!calls && funcs.length) {
                funcs.shift()(waitFor);
            }
        };
    };
    next(waitFor);
    var ret = {
        nThen: function(next) {
            funcs.push(next);
            return ret;
        },
        orTimeout: function(func, milliseconds) {
            if (!milliseconds) { throw Error("Must specify milliseconds to orTimeout()"); }
            var cto;
            var timeout = setTimeout(function() {
                while (funcs.shift() !== cto) ;
                func(waitFor);
                calls = (calls || 1) - 1;
                while (!calls && funcs.length) { funcs.shift()(waitFor); }
            }, milliseconds);
            funcs.push(cto = function() { clearTimeout(timeout); });
            return ret;
        }
    };
    return ret;
};

if (typeof(define) == 'function') {
    // AMD (require.js etc)
    define([], function() { return nThen; });
} else if (typeof(window) !== 'undefined') {
    // Browser global var nThen
    window.nThen = nThen;
}
if (typeof(module) !== 'undefined' && module.exports) {
    // Node.js
    module.exports = nThen;
}

})();
