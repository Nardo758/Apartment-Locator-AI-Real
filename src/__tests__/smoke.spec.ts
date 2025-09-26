import fetch from 'node-fetch'

test('index serves HTML', async () => {
  const res = await fetch('http://localhost:8080/')
  expect(res.status).toBe(200)
  const text = await res.text()
  expect(text).toMatch(/<html/i)
})
