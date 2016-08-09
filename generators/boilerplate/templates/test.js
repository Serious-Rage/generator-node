'use strict';
var psc = require('proxy-sinon-chai');
var expect = psc.expect;
var proxyquire = psc.proxyquire;

var <%= pkgSafeName %> = proxyquire('../lib');

describe('<%= pkgName %>', function () {
    beforeEach(() => {
    });

    it('should have a supermodule test!', function () {
        expect(<%= pkgSafeName %>, 'supermodule');
    });
});
