##Test Cases Doc
All test cases are in the json file `testCases.json` inside the `data` directory.  The next is an example of test item inside the `queue` array.

```
 {
      "function": "_getNewProperty",
      "title": "check %s with a object property",
      "errorMessage": "error checking %s with a object property",
      "params": [
        "prp_428269",
        "grp_111340",
        "ctr_C-1FRYVV3"
      ],
      "response":{
        "statusCode": 200,
        "path": "/papi/v1/properties/prp_428269?contractId=ctr_C-1FRYVV3&groupId=grp_111340"
      },
      "expectedResult": {
        "property": "properties.items.length",
        "comparison": "equal",
        "value": 1
      }
    }
```

###Details

* `function`: {String} Required. 
* `title`: {String} Optional. If `title` not exist the output will use the default message `Test for %s` where `%s` will be replace for the `function` value.
* `errorMessage`: {String} Optional. If not present by default the test will use `Error testing the function %s` where `%s` will be replace for the `function` value.
* `params`: {array[*]} Required.
  * For empty parameter leave the array empty like `params:[]`
  * More examples:
    * `paramas:[]`
    * `paramas:[{*}, 'String', 123]`
* `response`: {Object} Required. Object to configure the response with nock.
  * `statusCode`: {Integer} Optional. Default is 200. Status code for the mocked response.
  * `path`: {String} Required. This will be the matched path to trigger the response.
* `expectedResult`: {Object} Required. This object define how the result of the function will be evaluated.
  * `property`: {String} Optional. This string is translate to object properties or array keys, to access to the result parameter of the fucntion evaluated. If this parameter not exist this will evaluate the result directly as primary type.
  * `comparison` : {String} Required.
  * `value`: {*} Required. The value to evaluate the result against. 

