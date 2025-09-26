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
