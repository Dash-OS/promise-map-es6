import PromiseMap from 'promise-map-es6'
import fetch from 'node-fetch'

// Now lets take the fetch-example to another level.  We may want to 
// add to the object over time and form a final object from the results.

const result = new PromiseMap()
// Our IP key within Result
const ip = new PromiseMap()

// Simple requests to show the resolution process
ip.set('geo', fetch('http://ip-api.com/json').then(r => r.json()))
ip.set('dns', fetch('http://edns.ip-api.com/json').then(r => r.json()))

// Add our `ip` PromiseMap to our `result` PromiseMap.
result.set('ip', ip)

// Resolve the entire PromiseMap
result.then(result => {
  console.log(result)
})

/*
{ 
  ip: {
    geo: {
      as: 'AS15169 Google Inc.',
      city: 'Mountain View',
      country: 'United States',
      countryCode: 'US',
      isp: 'Google Cloud',
      lat: 37.4192,
      lon: -122.0574,
      org: 'Google Cloud',
      query: '104.198.35.139',
      region: 'CA',
      regionName: 'California',
      status: 'success',
      timezone: 'America/Los_Angeles',
      zip: '94043' 
    },
    dns: { 
      dns: { 
        geo: 'United States - Google', ip: '74.125.76.10' 
      },
      edns: { 
        geo: 'United States - Google Cloud', ip: '104.198.35.0' 
      } 
    }
  }
}
*/