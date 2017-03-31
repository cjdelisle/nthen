/*@flow*/
/*
 * Caleb James DeLisle
 * Sat Mar 23 01:42:29 EDT 2013
 * Public Domain or MIT License
 */
;(function() {
/*::
type WaitFor_t = (...Array<any>)=>(...Array<any>)=>void;
type NthenRet_t = { nThen: Nthen_t, orTimeout:((WaitFor_t)=>void, number)=>NthenRet_t };
type Nthen_t = ((WaitFor_t)=>void)=>NthenRet_t;
*/
var nThen /*:Nthen_t*/ = function(next) {
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
    var ret = {
        nThen: function(next) {
            if (!calls) {
                next(waitFor);
            } else {
                funcs.push(next);
            }
            return ret;
        },
        orTimeout: function(func, milliseconds) {
            if (!milliseconds) { throw Error("Must specify milliseconds to orTimeout()"); }
            var cto;
            var timeout = setTimeout(function() {
                while (funcs.shift() !== cto) { }
                func(waitFor);
                calls = (calls || 1) - 1;
                while (!calls && funcs.length) { funcs.shift()(waitFor); }
            }, milliseconds);
            funcs.push(cto = function() { clearTimeout(timeout); });
            return ret;
        }
    };
    return ret.nThen(next);
};

if (typeof(window) === 'object') {
    if (typeof(window.define) === 'function') {
        // AMD (require.js etc)
        window.define([], function() { return nThen; });
    } else {
        // Browser global var nThen
        window.nThen = nThen;
    }
} else if (typeof(module) !== 'undefined' && module.exports) {
    // Node.js
    module.exports = nThen;
}

})();
