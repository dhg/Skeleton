# outputJsonSync(file, object, [options])

Almost the same as [`writeJsonSync`](writeJson-sync.md), except that if the directory does not exist, it's created.
`options` are what you'd pass to [`jsonFile.writeFileSync()`](https://github.com/jprichardson/node-jsonfile#writefilesyncfilename-obj-options).

**Alias:** `outputJSONSync()`

- `file` `<String>`
- `object` `<Object>`
- `options` `<Object>`

## Example:

```js
const fs = require('fs-extra')

const file = '/tmp/this/path/does/not/exist/file.json'
fs.outputJsonSync(file, {name: 'JP'})

const data = fs.readJsonSync(file)
console.log(data.name) // => JP
```
