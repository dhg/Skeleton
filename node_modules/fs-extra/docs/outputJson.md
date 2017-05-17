# outputJson(file, object, [options, callback])

Almost the same as [`writeJson`](writeJson.md), except that if the directory does not exist, it's created.
`options` are what you'd pass to [`jsonFile.writeFile()`](https://github.com/jprichardson/node-jsonfile#writefilefilename-options-callback).

**Alias:** `outputJSON()`

- `file` `<String>`
- `object` `<Object>`
- `options` `<Object>`
- `callback` `<Function>`

## Example:

```js
const fs = require('fs-extra')

const file = '/tmp/this/path/does/not/exist/file.json'
fs.outputJson(file, {name: 'JP'}, err => {
  console.log(err) // => null

  fs.readJson(file, (err, data) => {
    if (err) return console.error(err)
    console.log(data.name) // => JP
  })
})

// With Promises:
fs.outputJson(file, {name: 'JP'})
.then(() => fs.readJson(file))
.then(data => {
  console.log(data.name) // => JP
})
.catch(err => {
  console.error(err)
})
```
