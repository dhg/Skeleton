'use strict'

const u = require('universalify').fromCallback
const jsonFile = require('./jsonfile')

jsonFile.outputJsonSync = require('./output-json-sync')
jsonFile.outputJson = u(require('./output-json'))
// aliases
jsonFile.outputJSONSync = jsonFile.outputJSONSync
jsonFile.outputJSON = jsonFile.outputJson
jsonFile.writeJSON = jsonFile.writeJson
jsonFile.writeJSONSync = jsonFile.writeJsonSync
jsonFile.readJSON = jsonFile.readJson
jsonFile.readJSONSync = jsonFile.readJsonSync

module.exports = jsonFile
