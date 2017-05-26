import PromiseMap from '../lib/PromiseMap'
import fetch from 'node-fetch'

// Lets make some requests with fetch and add them to our PromiseMap
const P = new PromiseMap()

// Simple requests to show the resolution process
P.set('ip', fetch('http://ip-api.com/json').then(r => r.json()))
P.set('dns', fetch('http://edns.ip-api.com/json').then(r => r.json()))


P.then(result => {
  console.log(result)
})

/*
{ 
  ip: { 
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
*/
