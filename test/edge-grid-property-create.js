'use strict';

require('dotenv').config();
const {expect, assert} = require('chai');
const PropertyAPI = require('../index').EdgeGridProperty;
const path = require('path');
const fs = require('fs');
let propertyId = 'prp_428260';
let propertyName = 'sandbox.akamaideveloper.com'; // Change this to your test property

// To run locally, set AKAMAI_TEST_HOST and AKAMAI_TEST_PROPID in your environment
// You must have a 'papi' section in your .edgerc file or use Akamai environment
// variables to set your credentials.  These credentials must be at the account
// tlevel with read and write access in order to run these tess.
if (process.env.AKAMAI_TEST_HOST) {
  propertyName = process.env.AKAMAI_TEST_HOST;
}
if (process.env.AKAMAI_TEST_PROPID) {
  propertyId = process.env.AKAMAI_TEST_PROPID;
}
let tempProperty = 'travis-' + Date.now() + '.example.com';

const akamaiweb = new PropertyAPI({path: '~/.edgerc', section: 'papi'});

describe('Create a new property from clone', function(done) {
  it('should clone a new property', function() {
    const options = {'clone': propertyName};
    return akamaiweb.createFromExisting(tempProperty, options)
      .then(data => {
        assert.isDefined(data);
        done();
      })
      .catch((error) => {
        assert(error);
      });
  });
  it('should update the property from rule files', function(done) {
    akamaiweb.updateFromFile(propertyName, 'test/new_rules.json')
      .then(data => {
        assert.isDefined(data.propertyId);
        expect(data.propertyId).to.equal(propertyId);
        done();
      })
      .catch(done);
  });
  it('get the defined property from server', function(done) {
    akamaiweb.retrieve(propertyName)
      .then(data => {
        assert.isDefined(data.propertyId);
        expect(data.propertyId).to.equal(propertyId);
        done();
      })
      .catch(done);
  });
  // TODO this block need clarification
  // it('activate the property from server', function(done) {
  //   akamaiweb.activate(propertyName)
  //     .then(data => {
  //       assert.isDefined(data.propertyId);
  //       expect(data.propertyId).to.equal(propertyId);
  //       done();
  //     })
  //     .catch(done);
  // });
  // it('deactivate the property from server', function(done) {
  //   akamaiweb.deactivate(propertyName)
  //     .then(data => {
  //       assert.isDefined(data.propertyId);
  //       expect(data.propertyId).to.equal(propertyId);
  //       done();
  //     })
  //     .catch(done);
  // });
  // it('delete the property in the server', function(done) {
  //   akamaiweb.deleteProperty(propertyName)
  //     .then(data => {
  //       assert.isDefined(data.propertyId);
  //       expect(data.propertyId).to.equal(propertyId);
  //       done();
  //     })
  //     .catch(done);
  // });
  it('should retrieve the property rules to a file', function() {
    return akamaiweb.retrieveToFile(propertyName, 'test/new_rules.json')
      .then(() => {
        fs.readFile('test/new_rules.json', 'utf8', function(err, fileData) {
          if (err) throw err;
          const obj = JSON.parse(fileData);
          assert(obj['rules']);
        });
      });
  });
});
