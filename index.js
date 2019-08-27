/*@flow*/
/*
 * Caleb James DeLisle
 * Sat Mar 23 01:42:29 EDT 2013
 * Public Domain or MIT License
 */
/*::
type WaitFor_t = { <F>(?F):(F), abort: ()=>void };
type NthenRet_t = { nThen: Nthen_t, orTimeout:((WaitFor_t)=>void, number)=>NthenRet_t };
type Nthen_t = ((WaitFor_t)=>void)=>NthenRet_t;
module.exports = */ (function() {
var nThen /*:Nthen_t*/ = function(next) {
    var funcs /*:Array<(WaitFor_t)=>void>*/ = [];
    var timeouts = [];
    var calls = 0;
    var abort;
    var inNthen = 0;
    var callNext = function (arg) {
        inNthen++;
        funcs.shift()(arg);
        inNthen--;
    };
    var waitFor = ((function(func) {
        calls++;
        return function() {
            var args = Array.prototype.slice.call(arguments);
            var f = function () {
                if (func) {
                    func.apply(null, args);
                }
                calls = (calls || 1) - 1;
                while (!calls && funcs.length && !abort) {
                    callNext(waitFor);
                }
            };
            if (inNthen) {
                setTimeout(f);
            } else {
                f();
            }
        };
    }/*:any*/)/*:WaitFor_t*/);
    waitFor.abort = function () {
        timeouts.forEach(clearTimeout);
        abort = 1;
    };
    var ret = {
        nThen: function(next) {
            if (!abort) {
                if (!calls) {
                    inNthen++;
                    next(waitFor);
                    inNthen--;
                } else {
                    funcs.push(next);
                }
            }
            return ret;
        },
        orTimeout: function(func, milliseconds) {
            if (abort) { return ret; }
            if (!milliseconds) { throw Error("Must specify milliseconds to orTimeout()"); }
            var cto;
            var timeout = setTimeout(function() {
                while (funcs.shift() !== cto) { }
                inNthen++;
                func(waitFor);
                inNthen--;
                calls = (calls || 1) - 1;
                while (!calls && funcs.length) { callNext(waitFor); }
            }, milliseconds);
            funcs.push(cto = function() {
                var idx = timeouts.indexOf(timeout);
                if (idx > -1) {
                    timeouts.splice(idx, 1);
                    clearTimeout(timeout);
                    return;
                }
                throw new Error('timeout not listed in array');
            });
            timeouts.push(timeout);
            return ret;
        }
    };
    return ret.nThen(next);
};

if (typeof(module) !== 'undefined') { module.exports = nThen; }
else if (typeof(window.define) === 'function' && window.define.amd) { window.define(function () { return nThen; }); }
else { window.nThen = nThen; }
/*:: return nThen; */
})();
