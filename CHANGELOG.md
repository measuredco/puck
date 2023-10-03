# CHANGELOG

<!--__CHANGELOG_ENTRY__-->

## [0.8.0](https://github.com/measuredco/puck/compare/v0.7.0...v0.8.0) (2023-10-03)


 ### Features

 * introduce DropZone API for nesting components and advanced layouts ([5053a84](https://github.com/measuredco/puck/commit/5053a8430de1f4bfb6fb7a4b1f194a1474ed3ae3))
 * introduce new outline UI ([e32c4ff](https://github.com/measuredco/puck/commit/e32c4ff784a2fcc5f2e2879807c045bd2742f4ac))
 * redesign action overlay and move outside of component ([5145cba](https://github.com/measuredco/puck/commit/5145cba6595e2051d14a7bfd37d9b180d9553330))
 * cast number field types to Number ([d5df959](https://github.com/measuredco/puck/commit/d5df95946dd9abf1502cb21bfc8682dd98efb1e1))


 ### Bug Fixes

 * add missing id type to render props ([18753cf](https://github.com/measuredco/puck/commit/18753cf1142d70f7100bc6fd5aa913813491042e))
 * add missing optional chaining operator to next recipe ([a368319](https://github.com/measuredco/puck/commit/a368319ec73adfc5bce8fb6bd31ac8e46e669400))
 * don't show margin underneath placeholder when dragging in ([2620455](https://github.com/measuredco/puck/commit/26204557b6fc92b208ee1051921965b793a78b1e))
 * don't switch between controlled/uncontrolled inputs ([b20e298](https://github.com/measuredco/puck/commit/b20e2980be6df6d57f9dfb6987b512686ccc5a7a))
 * ensure form styles override global styles ([104091a](https://github.com/measuredco/puck/commit/104091ac87c95d1395687d1785e621f5580efd87))
 * ensure hooks can always be used within render functions ([cbf8e8e](https://github.com/measuredco/puck/commit/cbf8e8e49fc5d43a8818cf41010cfba6034bbf28))
 * ensure types allow for nested arrays ([06b145b](https://github.com/measuredco/puck/commit/06b145b9089548725166fec3dd54f757b6e932cc))
 * fix unpredictable rendering of drop placeholder ([bf5f16b](https://github.com/measuredco/puck/commit/bf5f16b394ef950318949e9a440dd1bf2407636e))
 * only show sidebar scroll bars if necessary ([87c8736](https://github.com/measuredco/puck/commit/87c87369003f417600ca0a7bb38041de5c675afb))
 * prevent global styles from overwriting fieldset styles ([550bd0e](https://github.com/measuredco/puck/commit/550bd0ef9263766817709cea2c0365e9bd3e95cf))
 * respect labels for array item fields ([f2e7843](https://github.com/measuredco/puck/commit/f2e7843de0b12df4b15b1c1dd953e8b4d82ce366))
 * prevent global styles from overwriting outline styles ([1dc222c](https://github.com/measuredco/puck/commit/1dc222cfa5924aca2e5eb5ea535f77cfe2fe1281))
 * prevent styles from clashing with dark mode root element ([8506e8e](https://github.com/measuredco/puck/commit/8506e8e7f72aa8df7e69a1e7349eae273ebdee0e))
 * upgrade next version in recipe to ensure vercel builds pass ([c2d7fae](https://github.com/measuredco/puck/commit/c2d7faeed59fea5c7c795f76915cf354151d644d))


 ### Performance Improvements

 * reduce bundle size by 61% by removing unused react-feather icons ([f4b0563](https://github.com/measuredco/puck/commit/f4b0563e38a93a5f582b0210b0d75a846e3bada4))


## [0.7.0](https://github.com/measuredco/puck/compare/v0.6.2...v0.7.0) (2023-09-14)


### Features

* add support for custom fields ([b46b721](https://github.com/measuredco/puck/commit/b46b721aea70698e249cd3dfff34f88717952da7))




## [0.6.2](https://github.com/measuredco/puck/compare/v0.6.1...v0.6.2) (2023-09-07)


### Bug Fixes

* bust cache in generated app on publish ([6e1c8ed](https://github.com/measuredco/puck/commit/6e1c8ed9df1be9634e49d18edc8c42c7ebf6e864))
* don't 404 on homepage in generated app ([8fd7b3b](https://github.com/measuredco/puck/commit/8fd7b3b38a046776f69105e25f86a622b5e41c40))
* don't call API when building generated app ([8041fc1](https://github.com/measuredco/puck/commit/8041fc1da598f61b4c30c711d8233466c8643099))
* fix type issues in generated app ([b16e98e](https://github.com/measuredco/puck/commit/b16e98e15407678524d904211ecc74230b205018))




## [0.6.1](https://github.com/measuredco/puck/compare/v0.6.0...v0.6.1) (2023-09-06)


### Bug Fixes

* add missing glob dependency for create-puck-app ([7dbe190](https://github.com/measuredco/puck/commit/7dbe1902bf1c31a674b35c1269ee44ac09aac763))
* return component to original position when drag cancelled ([cae760f](https://github.com/measuredco/puck/commit/cae760fbfb8497de09311bb81e3059c07efe75ac))
* use correct peer dependencies for react ([39f4e7f](https://github.com/measuredco/puck/commit/39f4e7fab5818266aa75046d2c2ca6e858803a13))




## [0.6.0](https://github.com/measuredco/puck/compare/v0.5.0...v0.6.0) (2023-08-15)


### Bug Fixes

* ensure component label doesn't inherit user styles ([5c0d65b](https://github.com/measuredco/puck/commit/5c0d65b8519897c454b2f321330dd24dd30f831f))
* make default props on root optional ([dc5b1ae](https://github.com/measuredco/puck/commit/dc5b1aec6518f1c3ed1ad8f798bcfe359077865f))


### Features

* export Button and IconButton to make extending header seamless ([d98eb29](https://github.com/measuredco/puck/commit/d98eb298f14ef0ae8888a710cadf85fac13e084d))




## [0.5.0](https://github.com/measuredco/puck/compare/v0.4.1...v0.5.0) (2023-08-14)


### Features

* add headerTitle and headerPath APIs ([ae5c7c2](https://github.com/measuredco/puck/commit/ae5c7c2083b16e8f69e9995d74f8be7fffbe6ea5))
* gracefully fallback if component definition doesn't exist ([d7e3190](https://github.com/measuredco/puck/commit/d7e31901626734ce43cd9161971d9811b6d5c483))
* refine editor styles ([9e57649](https://github.com/measuredco/puck/commit/9e57649e7bd9444b290122ecbc1c40bc6d88c3d1))
* support booleans in radios and selects ([acb7a96](https://github.com/measuredco/puck/commit/acb7a96b727c9bc6d4599dcd06e2448c10e82d0f))




## [0.4.1](https://github.com/measuredco/puck/compare/v0.4.0...v0.4.1) (2023-08-09)


### Bug Fixes

* move incorrect dependency to devDependencies ([6ffd86c](https://github.com/measuredco/puck/commit/6ffd86c9d668449991a0642d79fa85c1a364deae))




## [0.4.0](https://github.com/measuredco/puck/compare/v0.3.2...v0.4.0) (2023-07-07)


### Bug Fixes

* avoid hardcoding localhost in strapi adaptor ([f8d920c](https://github.com/measuredco/puck/commit/f8d920c6d188e9b8c9ea1bc7cb58d63e6f25d823))
* stretch ExternalInput button to fill container ([69ee221](https://github.com/measuredco/puck/commit/69ee221e41ab09aae3d4d4d89c92d799d9b387f9))


### Features

* add adaptor-fetch package ([eaf7875](https://github.com/measuredco/puck/commit/eaf787527c0f76f3d43cbb8fd6fd1542aebdf5b0))
* rename page to root in API ([8519675](https://github.com/measuredco/puck/commit/8519675ab450438ae459bee54a8ae00bdc7553b4))




## [0.3.2](https://github.com/measuredco/puck/compare/v0.3.1...v0.3.2) (2023-07-06)


### Bug Fixes

* export correct files for Strapi adaptor ([577a849](https://github.com/measuredco/puck/commit/577a84928cd3c8e4f7a57d1f2746abd69db23eeb))
* set correct font family for empty outlines ([3d45841](https://github.com/measuredco/puck/commit/3d4584190e13f9b07077d6012d1ce4197de0a436))




## [0.3.1](https://github.com/measuredco/puck/compare/v0.3.0...v0.3.1) (2023-07-05)


### Bug Fixes

* include .gitignore in recipes ([e18bf67](https://github.com/measuredco/puck/commit/e18bf67e366c431a6bea08a9965b7d40866119e2))




## [0.3.0](https://github.com/measuredco/puck/compare/v0.2.2...v0.3.0) (2023-07-05)


### Features

* release create-puck-app ([0722a65](https://github.com/measuredco/puck/commit/0722a656c7da4b4caa9212385affd62323a56c92))




## [0.2.2](https://github.com/measuredco/puck/compare/v0.2.1...v0.2.2) (2023-07-05)


### Bug Fixes

* ensure margin collapse fix works with coloured backgrounds ([fdec4fa](https://github.com/measuredco/puck/commit/fdec4faac197e541a04785ab7c16919223b3ec9d))




## [0.2.1](https://github.com/measuredco/puck/compare/v0.2.0...v0.2.1) (2023-07-05)


### Bug Fixes

* remove border on draggable components ([726a27c](https://github.com/measuredco/puck/commit/726a27cc0df6b8c439d0aa8e0dd05cac32774b3e))




## [0.2.0](https://github.com/measuredco/puck/compare/v0.1.3...v0.2.0) (2023-07-04)


### Bug Fixes

* inject react into libraries ([7e10d91](https://github.com/measuredco/puck/commit/7e10d9141901aaf79ae4ebfa3a7b60b589c6c715))
* render drag and drop correctly when using margins ([f88025b](https://github.com/measuredco/puck/commit/f88025bf27479036426305a1004acfe8f0ab6644))


### Features

* add icons to inputs ([f47482e](https://github.com/measuredco/puck/commit/f47482e8cabd334360666ea90d2e6a12b3648cf9))
* improve UI for fields ([aa0d2fe](https://github.com/measuredco/puck/commit/aa0d2fe56ff633b9c2cff2023ae00c8b9ec04df3))
* rename "group" field type to "array" ([4f99c7d](https://github.com/measuredco/puck/commit/4f99c7d761b8e1cfa280fb5e74f6f369be84d7a2))




## [0.1.6](https://github.com/measuredco/puck/compare/v0.1.3...v0.1.6) (2023-07-04)


### Bug Fixes

* inject react into libraries ([7e10d91](https://github.com/measuredco/puck/commit/7e10d9141901aaf79ae4ebfa3a7b60b589c6c715))




## 0.1.5 (2023-07-03)

- Publish all packages
