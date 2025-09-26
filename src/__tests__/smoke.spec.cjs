/* Simple CommonJS smoke test for the dev server. Uses plain JS so Jest can run without TypeScript/Babel config.
   Kept minimal: checks that / returns HTML and 200 status. */
const http = require('http')

test('index serves HTML', (done) => {
  http.get('http://localhost:8080/', (res) => {
    expect(res.statusCode).toBe(200)
    let data = ''
    res.on('data', (chunk) => { data += chunk })
    res.on('end', () => {
      expect(/<html/i.test(data)).toBeTruthy()
      done()
    })
  }).on('error', (err) => { done(err) })
})
