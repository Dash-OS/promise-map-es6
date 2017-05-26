import PromiseMap from 'promise-map-es6'

/*
  We use the aws-lambda-runner to simplify the execution and handling of our
  request.  It is utilizing the PromiseMapPlugin.
*/
import run from 'aws-lambda-runner'
import PromiseMapPlugin from 'runner-promise-map-plugin'
import fetch from 'node-fetch'

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
  
})

const handleQuery = {
  ip: async (request) => {
    return fetch(`http://ip-api.com/json/${request || ''}`).then(r => r.json())
  },
  // ... handle as many queries as needed
}