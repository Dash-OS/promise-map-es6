import PromiseMap from 'promise-map-es6'
import fetch from 'node-fetch'

/*
  We use the aws-lambda-runner to simplify the execution and handling of our
  request.  It is utilizing the PromiseMapPlugin.
  
  This lambda will parse the url queries ?query=value&... and respond with a mapping 
  of the results of each query to the user.  We have one handler but can add however 
  many as needed.
  
  https://my.url/query?ip=208.80.152.201 -->
    {
      "result": "success",
      "query": {
        "ip": "208.80.152.201"
      },
      "ip": {
        "as":"AS14907 Wikimedia Foundation, Inc.",
        "city":"Cleveland",
        "country":"United States",
        "countryCode":"US",
        "isp":"Wikimedia Foundation, Inc.",
        "lat":41.4995,
        "lon":-81.6954,
        "org":"Wikimedia Foundation, Inc.",
        "query":"208.80.152.201",
        "region":"OH",
        "regionName":"Ohio",
        "status":"success",
        "timezone":"America/New_York",
        "zip":"44192"
      }
    }
*/
// https://github.com/Dash-OS/aws-lambda-runner
import run from 'aws-lambda-runner'
// https://github.com/Dash-OS/aws-lambda-runner/tree/master/extras/plugins/PromiseMapPlugin
import PromiseMapPlugin from 'runner-promise-map-plugin'

export default run({
  plugins: [
    // Adds a PromiseMap to config.promises that resolves into the response
    // to the caller
    PromiseMapPlugin,
  ]
}, async (body, config, ctx) => {
  
  const { queries = {} } = config
  
  /*
    Iterate through all url queries, check if we have a handler specified
    for a given query, add it as part of the response body
  */
  for ( let query in queries ) {
    if ( typeof handleQuery[query] === 'function' ) {
      config.promises.set(query, handleQuery[query](queries[query]))
    }
  }
  
  /*
    If we have any tasks that should be completed before returning to the caller,
    we can add them using config.promises.push(...promises) - these will resolve 
    before returning, but no response will be added to the caller.
  */
  
  /*
    We can also add data as a response to include.
  */
  return {
    result: 'success',
    query: queries
  }
})

const handleQuery = {
  // &ip || &ip=208.80.152.201 --> { ip: { ...results }, ...rest }
  ip: async (request) => fetch(`http://ip-api.com/json/${request || ''}`).then(r => r.json()),
  // ... handle as many queries as needed
}