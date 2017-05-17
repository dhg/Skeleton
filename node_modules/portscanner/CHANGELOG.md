# 2.1.0

## New

* [[`ed4682bd3c`](https://github.com/baalexander/node-portscanner/commit/ed4682bd3c)] - Accept ports as strings (laggingreflex)

# 2.0.0

## Breaking Changes

* Ports must be numbers. Some of the new changes are based on the assumption that ports must be numbers.

## New

* [[`84db394996`](https://github.com/baalexander/node-portscanner/commit/84db394996)] - promise support (laggingreflex)
* [[`3b90e2ca74`](https://github.com/baalexander/node-portscanner/commit/3b90e2ca74)] - Improve arguments parsing (laggingreflex)
* [[`eb345da68c`](https://github.com/baalexander/node-portscanner/commit/eb345da68c)] - Make host parameter optional (Maciej Dudzinski)
* [[`2ed556b159`](https://github.com/baalexander/node-portscanner/commit/2ed556b159)] [[`99483dc28e`](https://github.com/baalexander/node-portscanner/commit/99483dc28e)] [#26](https://github.com/baalexander/node-portscanner/issues/26) - Add support for checking array of ports instead of range (Maciej Dudzinski)

## Fixes

* [[`da8ff250bd`](https://github.com/baalexander/node-portscanner/commit/da8ff250bd)] [#23](https://github.com/baalexander/node-portscanner/issues/23) - handle ports range provided in reverse order (laggingreflex)
* [[`4c7a88436f`](https://github.com/baalexander/node-portscanner/commit/4c7a88436f)] - Update async module for use this module in strict mode (Luca Pau)
* [[`04fea5dd4d`](https://github.com/baalexander/node-portscanner/commit/04fea5dd4d)] - Preserve error message from socket's error event (Jan Melcher)

## Misc

* [[`0beeca8cbd`](https://github.com/baalexander/node-portscanner/commit/0beeca8cbd)] - Implement JavaScript Standard Style Guide (laggingreflex)
* [[`da1ce58319`](https://github.com/baalexander/node-portscanner/commit/da1ce58319)] - more tests for different argument signatures (laggingreflex)
* [[`9fdbdc38d7`](https://github.com/baalexander/node-portscanner/commit/9fdbdc38d7)] - Add basic unit tests with Ava runner (Maciej Dudzinski)

# 1.2.0

Some recent changes in 1.1.0 [[`3b90e2ca74`](https://github.com/baalexander/node-portscanner/commit/3b90e2ca74)] [[`eb345da68c`](https://github.com/baalexander/node-portscanner/commit/eb345da68c)] were based on the assumption that the ports would always be of the type numbers. This broke portscanner in some cases [#49](https://github.com/baalexander/node-portscanner/issues/49) [#50](https://github.com/baalexander/node-portscanner/issues/50). All changes were reverted back to 1.0.0 and only some very critical fixes [[`4c7a88436f`](https://github.com/baalexander/node-portscanner/commit/4c7a88436f)] [[`04fea5dd4d`](https://github.com/baalexander/node-portscanner/commit/04fea5dd4d)] were applied to this version.


## Fixes

* [[`4c7a88436f`](https://github.com/baalexander/node-portscanner/commit/4c7a88436f)] - Update async module for use this module in strict mode (Luca Pau)
* [[`04fea5dd4d`](https://github.com/baalexander/node-portscanner/commit/04fea5dd4d)] - Preserve error message from socket's error event (Jan Melcher)

## Misc

* [[`69c648c740`](https://github.com/baalexander/node-portscanner/commit/69c648c740)] - tests - ports as strings (laggingreflex)
* [[`9fdbdc38d7`](https://github.com/baalexander/node-portscanner/commit/9fdbdc38d7)] - Add basic unit tests with Ava runner (Maciej Dudzinski)


# 1.1.1

Reverted to 1.0.0

# 1.1.0

Some breaking changes were introduced in this version which have since been reverted in 1.1.1.

Please update to either 1.1.1 or 2.0.0.

# 1.0.0

* [[`2463e64a0a`](https://github.com/baalexander/node-portscanner/commit/2463e64a0a)] - 1.0.0 (Sean Massa)
* [[`21aa98b632`](https://github.com/baalexander/node-portscanner/commit/21aa98b632)] - update readme (Sean Massa)
* [[`5fe4ab4a69`](https://github.com/baalexander/node-portscanner/commit/5fe4ab4a69)] - Merge pull request #21 from jdwilliams15/master (Sean Massa)
* [[`725afef7b4`](https://github.com/baalexander/node-portscanner/commit/725afef7b4)] - fix indent (jdwilliams15)
* [[`053b56e455`](https://github.com/baalexander/node-portscanner/commit/053b56e455)] - fixed indentation (jdwilliams15)
* [[`b1dd496633`](https://github.com/baalexander/node-portscanner/commit/b1dd496633)] - Changed socket error handler to handle 'ECONNREFUSED'. In event of ECONNREFUSED the port is available (jdwilliams15)
* [[`512cfdbf78`](https://github.com/baalexander/node-portscanner/commit/512cfdbf78)] - 0.2.3 (Sean Massa)
* [[`5526b8b4eb`](https://github.com/baalexander/node-portscanner/commit/5526b8b4eb)] - Merge pull request #19 from thomseddon/fix-end (Sean Massa)
* [[`a854ec6bd6`](https://github.com/baalexander/node-portscanner/commit/a854ec6bd6)] - Use socket.destroy() not socket.end() on successful connection (Thom Seddon)
* [[`c747ffa9de`](https://github.com/baalexander/node-portscanner/commit/c747ffa9de)] - 0.2.2 (Sean Massa)
* [[`4a1f8f811b`](https://github.com/baalexander/node-portscanner/commit/4a1f8f811b)] - Merge pull request #16 from baalexander/fix-port-finding (Sean Massa)
* [[`ff51ebe871`](https://github.com/baalexander/node-portscanner/commit/ff51ebe871)] - fix port reporting (Sean Massa)
* [[`e9070e85ca`](https://github.com/baalexander/node-portscanner/commit/e9070e85ca)] - 0.2.1 (Sean Massa)
* [[`809b7760ad`](https://github.com/baalexander/node-portscanner/commit/809b7760ad)] - 0.2.0 (Sean Massa)
* [[`87f35e5b87`](https://github.com/baalexander/node-portscanner/commit/87f35e5b87)] - Merge pull request #14 from baalexander/localhost-127.0.0.1 (Sean Massa)
* [[`0b72b83cab`](https://github.com/baalexander/node-portscanner/commit/0b72b83cab)] - switch out localhost for 127.0.0.1 (Sean Massa)
* [[`4407d6f701`](https://github.com/baalexander/node-portscanner/commit/4407d6f701)] - Merge pull request #13 from skilesare/master (Sean Massa)
* [[`3ed682ad7a`](https://github.com/baalexander/node-portscanner/commit/3ed682ad7a)] - Update portscanner.js (skilesare)
* [[`c1544a1bb3`](https://github.com/baalexander/node-portscanner/commit/c1544a1bb3)] - Update portscanner.js (skilesare)
* [[`d3b029c384`](https://github.com/baalexander/node-portscanner/commit/d3b029c384)] - Adds @EndangeredMassa as a package maintainer. (Brandon Alexander)
* [[`8f5559b1fe`](https://github.com/baalexander/node-portscanner/commit/8f5559b1fe)] - Merge pull request #7 from EndangeredMassa/smassa/timeout (Brandon Alexander)
* [[`16d0db3944`](https://github.com/baalexander/node-portscanner/commit/16d0db3944)] - added options param to checkPortStatus; supports host and timeout (Sean Massa)
* [[`b8acb18a08`](https://github.com/baalexander/node-portscanner/commit/b8acb18a08)] - exposed errors for checkPortStatus (Sean Massa)
* [[`381769162d`](https://github.com/baalexander/node-portscanner/commit/381769162d)] - Updates version to 0.1.3. (Brandon Alexander)
* [[`38cb922d1c`](https://github.com/baalexander/node-portscanner/commit/38cb922d1c)] - Uses callback in listen() instead of a timeout. (Brandon Alexander)
* [[`aefd8ccad1`](https://github.com/baalexander/node-portscanner/commit/aefd8ccad1)] - Merge pull request #4 from DennisKehrig/master (Brandon Alexander)
* [[`5b58f03421`](https://github.com/baalexander/node-portscanner/commit/5b58f03421)] - Call socket.destroy() on timeout (Dennis Kehrig)
* [[`45028c6e3e`](https://github.com/baalexander/node-portscanner/commit/45028c6e3e)] - Updates version to 0.1.2. (Brandon Alexander)
* [[`a60a248a2a`](https://github.com/baalexander/node-portscanner/commit/a60a248a2a)] - Fixes multiple callbacks when checking port status. (Brandon Alexander)
* [[`19a8c1df2c`](https://github.com/baalexander/node-portscanner/commit/19a8c1df2c)] - Updates to v0.1.1. (Brandon Alexander)
* [[`c81ae8d6e4`](https://github.com/baalexander/node-portscanner/commit/c81ae8d6e4)] - Checks range of ports one at a time. (Brandon Alexander)
* [[`fe9726773d`](https://github.com/baalexander/node-portscanner/commit/fe9726773d)] - Only returns status of a port after connection closed. (Brandon Alexander)
* [[`af6c474f38`](https://github.com/baalexander/node-portscanner/commit/af6c474f38)] - Ignores example and test directories in NPM. (Brandon Alexander)
* [[`78be727cb4`](https://github.com/baalexander/node-portscanner/commit/78be727cb4)] - Initial release to NPM. (Brandon Alexander)
* [[`cc71a028cb`](https://github.com/baalexander/node-portscanner/commit/cc71a028cb)] - Renames port finding functions for clarity. (Brandon Alexander)
* [[`bb0356a82e`](https://github.com/baalexander/node-portscanner/commit/bb0356a82e)] - Quits scanning ports when a matching port has been found. (Brandon Alexander)
* [[`24224b8148`](https://github.com/baalexander/node-portscanner/commit/24224b8148)] - Destroys the socket on error instead of end. (Brandon Alexander)
* [[`e2c4448293`](https://github.com/baalexander/node-portscanner/commit/e2c4448293)] - Updates README since not yet ready for NPM. (Brandon Alexander)
* [[`5cca315f8b`](https://github.com/baalexander/node-portscanner/commit/5cca315f8b)] - Packages up port scanner for NPM. (Brandon Alexander)
* [[`8c1f11e76c`](https://github.com/baalexander/node-portscanner/commit/8c1f11e76c)] - Adds JSDocs and updates example code. (Brandon Alexander)
* [[`4b432ba950`](https://github.com/baalexander/node-portscanner/commit/4b432ba950)] - Set max port range to 65535. (Brandon Alexander)
* [[`3a78761e4f`](https://github.com/baalexander/node-portscanner/commit/3a78761e4f)] - Adds README and MIT license. (Brandon Alexander)
* [[`e232efc85f`](https://github.com/baalexander/node-portscanner/commit/e232efc85f)] - Checks a range of ports for first open or closed port. (Brandon Alexander)
* [[`8568c23e7c`](https://github.com/baalexander/node-portscanner/commit/8568c23e7c)] - Initial commit checks status of a specified port. (Brandon Alexander)