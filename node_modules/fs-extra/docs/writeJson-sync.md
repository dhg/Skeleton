# writeJsonSync(file, object, [options])

Writes an object to a JSON file. `options` are the same that
you'd pass to [`jsonFile.writeFileSync()`](https://github.com/jprichardson/node-jsonfile#writefilesyncfilename-obj-options).

**Alias:** `writeJSONSync()`

- `file` `<String>`
- `object` `<Object>`
- `options` `<Object>`

## Example:

```js
const fs = require('fs-extra')

fs.writeJsonSync('./package.json', {name: 'fs-extra'})
```
---

**See also:** [`outputJsonSync()`](outputJson-sync.md)
