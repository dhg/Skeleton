# writeJson(file, object, [options, callback])

Writes an object to a JSON file. `options` are the same that
you'd pass to [`jsonFile.writeFile()`](https://github.com/jprichardson/node-jsonfile#writefilefilename-options-callback).

**Alias:** `writeJSON()`

- `file` `<String>`
- `object` `<Object>`
- `options` `<Object>`
- `callback` `<Function>`

## Example:

```js
const fs = require('fs-extra')

fs.writeJson('./package.json', {name: 'fs-extra'}, err => {
  if (err) return console.error(err)

  console.log('success!')
})

// With Promises
fs.writeJson('./package.json', {name: 'fs-extra'})
.then(() => {
  console.log('success!')
})
.catch(err => {
  console.error(err)
})
```

---

**See also:** [`outputJson()`](outputJson.md)
