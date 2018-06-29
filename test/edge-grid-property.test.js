// Copyright 2018 Akamai Technologies, Inc. All Rights Reserved
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
/* eslint-disable */
/* istanbul ignore next */
'use strict';

const chai = require('chai');
const {expect, assert} = chai;
const Utils = require('./utils');
const _ = require('lodash');
const untildify = require('untildify');
const nock = require('nock');
const path = require('path');

const PropertyAPI = require('../index').EdgeGridProperty;
let propertyId = 'prp_428260';
let propertyName = 'test.sandbox.akamaideveloper.com';
const AKAMAI_HOST = 'https://akab-k2xkiy23rrusrdph-q5l2kvdaiqvylisj.luna.akamaiapis.net';
const testCases = Utils();

/**
 * Get json data from a file to mock the request response
 *
 * @param fncName
 * @returns {*}
 * @private
 */
function getJsonMockedData(fncName) {
  const file = path.resolve(`./test/data/${fncName}.json`);
  let response = require(file);
  return response;
}

function recursiveGetDependantKnock(dependOn, queue) {
  if (dependOn && dependOn instanceof Array) {
    dependOn.forEach((dependantString) => {
      let test = testCases.queue.filter(item => item.function === dependantString);
      if (test.length > 0 && test[0].response) {
        test = test[0];
        if (test.response.dependOn && test.response.dependOn instanceof Array) {
          recursiveGetDependantKnock(test.response.dependOn, queue);

        }
        if (test.response.queue && test.response.queue instanceof Array) {
          queue = queue.concat(test.response.queue);
        }
        if (test.response.path) {
          if (!test.response.file) {
            test.response.file = test.function;
          }
          queue.push(test.response);
        }
      }
    });
  }
  return queue;
}

function prepareNock(response, base_file) {
  let queue = [];
  if (response instanceof Array) {
    queue = queue.concat(response);
  } else {
    if (response.dependOn && response.dependOn instanceof Array) {
      queue = queue.concat(recursiveGetDependantKnock(response.dependOn, []));
    }
    if (response.queue) {
      if (response.queue instanceof Array) {
        queue = queue.concat(response.queue);
      } else {
        queue.push(response.queue);
      }
    }
    if (response.path) {
      queue.push(response);
    }
  }
  queue = _.uniq(queue, 'function');
  queue.forEach((item) => {
    internalPrepareNock(item, base_file);
  });
}

function internalPrepareNock(response, base_file) {
  let statusCode = 200;
  if (response.statusCode) {
    statusCode = response.statusCode;
  }
  let jsonFile = base_file;
  if (response.file) {
    jsonFile = response.file;
  }
  let method = 'GET';
  if (response.method) {
    method = response.method;
  }
  let post_body = undefined;
  if (response.body) {
    post_body = response.body;
  }
  nock(AKAMAI_HOST)
    .intercept(response.path, method, post_body)
    .replyWithFile(statusCode, __dirname + `/data/${jsonFile}.json`, {'Content-Type': 'application/json'});
}

function executeTestCase(testCase) {
  let config = {path: '~/.edgerc', section: 'papi'};
  let testCaseTitle = 'Test for %s';
  if (testCase.title) {
    testCaseTitle = testCase.title;
  }
  testCaseTitle = testCaseTitle.replace(/%s/g, testCase.function);
  it(testCaseTitle, function(done) {
    Promise.resolve()
      .then(() => {
        if (!testCase.response) {
          throw new Error('Invalid Response Object, review the test case');
        }

        prepareNock(testCase.response, testCase.function);

        let errorMessage = 'Error testing the function %s';
        if (testCase.errorMessage) {
          errorMessage = testCase.errorMessage;
        }
        errorMessage = errorMessage.replace(/%s/g, testCase.function);
        let akamaiPropertyApi = new PropertyAPI(config);
        akamaiPropertyApi[testCase.function].apply(akamaiPropertyApi, testCase.params)
          .then((result) => {
            let expected = result;
            if(testCase.expectedResult.expect && testCase.expectedResult.expect === 'assert'){
              assert[testCase.expectedResult.comparison](expected);
              done();
            } else {
              if (testCase.expectedResult.property) {
                expected = _.get(result, testCase.expectedResult.property);
              }
              expect(expected, errorMessage).to[testCase.expectedResult.comparison](testCase.expectedResult.value);
              done();
            }
          })
          .catch((error) => {
            let expected = error;
            if(testCase.expectedError.expect && testCase.expectedError.expect === 'assert'){
              assert[testCase.expectedError.comparison](expected);
              done();
            } else {
              if (testCase.expectedError.property) {
                expected = _.get(error, testCase.expectedError.property);
              }
              expect(expected, errorMessage).to[testCase.expectedError.comparison](testCase.expectedError.value);
              done();
            }
          });
      })
      .catch(done);
  });
}

describe('edgeGridProperty Constants', function() {
  it('check if the class was initialized', function(done) {
    let config = {path: '~/.edgerc', section: 'papi'};
    let akamaiPropertyApi = new PropertyAPI(config);
    assert.isDefined(akamaiPropertyApi);
    config = {
      create: true,
      clientToken: '~/.edgerc',
      clientSecret: 'papi',
      accessToken: 'papi',
      host: AKAMAI_HOST
    };
    akamaiPropertyApi = new PropertyAPI(config);
    assert.isDefined(akamaiPropertyApi);
    done();
  });

  it('check the _init function', function(done) {
    let config = {
      create: true,
      clientToken: '~/.edgerc',
      clientSecret: 'papi',
      accessToken: 'papi',
      host: AKAMAI_HOST
    };
    prepareNock({
      "statusCode": 200,
      "file": "_retrieveFormats",
      "path": "/papi/v1/rule-formats"
    });
    let akamaiPropertyApi = new PropertyAPI(config);
    assert.isDefined(akamaiPropertyApi);
    akamaiPropertyApi._init();
    akamaiPropertyApi._initComplete = false;
    akamaiPropertyApi._propertyById = ['lorem', 'ipsum'];
    akamaiPropertyApi._init();
    expect(akamaiPropertyApi._initComplete).to.be.true;
    akamaiPropertyApi._initComplete = false;
    akamaiPropertyApi._propertyById = {};
    akamaiPropertyApi._init();
    expect(akamaiPropertyApi._newestRulesFormat !== undefined).to.be.true;
    done();
  });

  it('check _initPropertyCache', function() {
    let config = {
      create: true,
      clientToken: '~/.edgerc',
      clientSecret: 'papi',
      accessToken: 'papi',
      host: AKAMAI_HOST
    };
    let nock_calls = [
      {
        "statusCode": 200,
        "file": "_getGroupList",
        "path": "/papi/v1/groups"
      },
      {
        "statusCode": 200,
        "file": "_getPropertyList",
        "path": "/papi/v1/properties?contractId=ctr_C-1FRYVV3&groupId=grp_111340"
      }
    ];
    prepareNock(nock_calls);
    let akamaiPropertyApi = new PropertyAPI(config);
    akamaiPropertyApi._initPropertyCache(propertyName)
      .catch(error => {
        assert.isUndefined(error);
      });
  });

  //Example of how work the nock and the test one by one
  it('check EdgeGridmock', function(done) {
    let config = {path: '~/.edgerc', section: 'papi'};
    nock(AKAMAI_HOST)
      .get(function(uri) {
        return uri === '/papi/v1/properties/prp_428269?contractId=ctr_C-1FRYVV3&groupId=grp_111340';
      })
      .replyWithFile(200, __dirname + '/data/_getNewProperty.json', {'Content-Type': 'application/json'});
    let akamaiPropertyApi = new PropertyAPI(config);
    akamaiPropertyApi._getNewProperty("prp_428269", "grp_111340", "ctr_C-1FRYVV3")
      .then((result) => {
        let t = result;
        done();
      })
      .catch(done);
  });

  describe('Execute One Test Cases from the json file', function() {
    const testCase = testCases.queue.filter(item => item.function === 'createNewPropertyVersion');
    testCase.forEach((testCase) => {
      executeTestCase(testCase);
    });
  });

  describe('Execute All Test Cases from json file', function() {
    testCases.queue.forEach((testCase) => {
      executeTestCase(testCase);
    });
  });

  it('check static methods for constant', function(done) {
    assert.isDefined(PropertyAPI.getAkamaiEnv());
    assert.isDefined(PropertyAPI.getLatestVersion());
    done();
  });

});


