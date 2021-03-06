var test = require("tap").test;
var nThen = require("../index");
test("make sure nThen works", function (t) {
    var to = setTimeout(function() { throw Error("timeout"); }, 1000);
    var i = 0;
    var lastI = 0;
    var chk = function() { t.equal(i, ++lastI); };

    nThen(function(waitFor) {
        // Obvious path.
        setTimeout(waitFor(function() {
            i++;
        }), 1);
    }).nThen(function(waitFor) {
        // Traditional chained calls should work.
        chk();
        setTimeout(waitFor(function() {
            chk();
            setTimeout(waitFor(function() {
                chk();
                i++;
            }), 1);
            i++;
        }), 1);
        i++;
    }).nThen(function(waitFor) {
        chk();
        i++;
        // no callback should still work
    }).nThen(function(waitFor) {
        chk();
        i++;
        // This will timeout.
        setTimeout(waitFor(function() {
            // never run.
            i = 10000;
        }), 100);
    }).nThen(function(waitFor) {
        t.notOk(1);
    }).nThen(function(waitFor) {
        t.notOk(1);
    }).nThen(function(waitFor) {
        t.notOk(1);
    }).nThen(function(waitFor) {
        t.notOk(1);
    }).orTimeout(function(waitFor) {
        chk();
        setTimeout(waitFor(function() {
            i++;
        }), 1);
    }, 30).nThen(function(waitFor) {
        chk();
        setTimeout(waitFor(function() {
            i++;
        }), 1);
    }).nThen(function(waitFor) {
        chk();
        t.equals(lastI, 8);
        clearTimeout(to);
        t.end();
    });
});

test("no callback first function", function (t) {
    var to = setTimeout(function() {
        t.notOk(1);
        t.end();
    }, 100);
    var i = 0;
    nThen(function(waitFor) {
        i++;
        // waitFor is never called
    }).nThen(function(waitfor) {
        t.equals(i, 1);
        clearTimeout(to);
        t.end();
    });
});
