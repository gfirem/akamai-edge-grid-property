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

'use strict';

const path = require('path');
const untildify = require('untildify');

const EdgeGrid = require('edgegrid');

class EdgeGridMock extends EdgeGrid {
  constructor(auth) {
    super({
      path: untildify(auth.path),
      section: auth.section,
      debug: auth.debug,
    });
  }

  stripEndQuotes(s) {
    let t = s.length;
    if (s.charAt(0) === '"') s = s.substring(1, t--);
    if (s.charAt(--t) === '"') s = s.substring(0, t);
    return s;
  }

  /**
   * Get json data from a file to mock the request response
   *
   * @param fncName
   * @returns {*}
   * @private
   */
  getJsonMockedData(fncName) {
    const file = path.resolve(`./test/data/${fncName}.json`);
    let response = require(file);
    return response;
  }

  /**
   * Get function name to retriview the json form the function name
   *
   * @param request
   * @returns {string}
   */
  convertRequestToFunctionName(request) {
    let path = request.path;
    let functionName = '';
    if (request.method === 'GET') {
      switch (path) {
        case '/papi/v1/properties/prp_428269?contractId=ctr_C-1FRYVV3&groupId=grp_111340':
          functionName = 'getNewProperty';
          break;
        case '/papi/v1/edgehostnames?contractId=ctr_C-1FRYVV3&groupId=grp_111340':
          functionName = 'retrieveEdgeHostnames';
          break;
        case '/papi/v1/products?contractId=ctr_C-1FRYVV3&groupId=grp_111340':
          functionName = 'getMainProduct';
          break;
        case '/papi/v1/properties/prp_428269/versions/1/hostnames/?contractId=ctr_C-1FRYVV3&groupId=grp_111340':
          functionName = 'getHostnameList';
          break;
        // case '':
        //   functionName = '_getProperty';
        //   break;
        case '/papi/v1/properties/prp_428269/versions/1?contractId=ctr_C-1FRYVV3&groupId=grp_111340':
          functionName = 'getCloneConfig';
          break;
        case '/papi/v1/properties/prp_428269/versions/1/rules?contractId=ctr_C-1FRYVV3&groupId=grp_111340':
          functionName = 'getPropertyRules';
          break;
        // case '':
        //   functionName = '_getNewProperty';
        //   break;
        // case '':
        //   functionName = '_getPropertyList';
        //   break;
        // case '':
        //   functionName = 'retrieveFormats';
        //   break;
        // case '':
        //   functionName = 'retrieveFormats';
        //   break;
        case '/papi/v1/rule-formats':
          functionName = 'retrieveFormats';
          break;
        // case '':
        //   functionName = '_getGroupList';
        //   break;
        // case '':
        //   functionName = '_getPropertyRules';
        //   break;
        // case '':
        //   functionName = '_copyPropertyVersion';
        //   break;
        // case '':
        //   functionName = '_createProperty';
        //   break;
        // case '':
        //   functionName = '_updatePropertyRules';
        //   break;
        // case '':
        //   functionName = '_createCPCode';
        //   break;
      }
    } else {
      switch (path) {
        case '/papi/v1/search/find-by-value':
          functionName = 'searchByValue';
          break;
        // case '':
        //   functionName = '_findProperty';
        //   break;
        // case '':
        //   functionName = '_getProperty';
        //   break;
        // case '':
        //   functionName = '_getProperty';
        //   break;
        // case '':
        //   functionName = '_getCloneConfig';
        //   break;
        // case '':
        //   functionName = '_getNewProperty';
        //   break;
        // case '':
        //   functionName = '_getPropertyList';
        //   break;
        // case '':
        //   functionName = 'retrieveFormats';
        //   break;
        // case '':
        //   functionName = 'retrieveFormats';
        //   break;
        // case '':
        //   functionName = '_retrieveFormats';
        //   break;
        // case '':
        //   functionName = '_getGroupList';
        //   break;
        // case '':
        //   functionName = '_getPropertyRules';
        //   break;
        // case '':
        //   functionName = '_copyPropertyVersion';
        //   break;
        // case '':
        //   functionName = '_createProperty';
        //   break;
        // case '':
        //   functionName = '_updatePropertyRules';
        //   break;
        // case '':
        //   functionName = '_createCPCode';
        //   break;
      }
    }
    return functionName;
  }

  // send(callback) {
  //   let fncName = this.convertRequestToFunctionName(this._internalRequest);
  //   let response = this.getJsonMockedData(fncName);
  //   callback(null, response);
  // }

  // auth(request) {
  //   this._internalRequest = request;
  // }
}

module.exports = EdgeGridMock;
