# CHANGELOG

<!--__CHANGELOG_ENTRY__-->

## [0.11.3](https://github.com/measuredco/puck/compare/v0.11.2...v0.11.3) (2023-11-12)


### Bug Fixes

* ensure field debounce doesn't sporadically lock preview update ([487ab83](https://github.com/measuredco/puck/commit/487ab83e2ffa42ad93ab90c2eadea9486008de9b))
* stop generator crashing on Windows due to commits with single quotes ([ab9d43f](https://github.com/measuredco/puck/commit/ab9d43f08113ef1c3f6fa30f7f87ba881b74a1e1))




## [0.11.2](https://github.com/measuredco/puck/compare/v0.11.1...v0.11.2) (2023-11-11)


### Bug Fixes

* add missing database.json back to generated next recipe ([3c15255](https://github.com/measuredco/puck/commit/3c15255a8f7f5e77c047ce853382f92715045c8d))




## [0.11.1](https://github.com/measuredco/puck/compare/v0.11.0...v0.11.1) (2023-11-11)


### Bug Fixes

* include next recipe in generator ([5b833ef](https://github.com/measuredco/puck/commit/5b833efd0f87b21e57303256e89f1456254b82bf))




## [0.11.0](https://github.com/measuredco/puck/compare/v0.10.0...v0.11.0) (2023-11-03)


### Bug Fixes

* don't flicker root DropZone when dragging ([358435c](https://github.com/measuredco/puck/commit/358435c36a216e6749be73599ab631ffdd8069c8))
* ensure array fields can render if value is undefined ([47ab3c9](https://github.com/measuredco/puck/commit/47ab3c971e4aafec443e8b4d73e7c921dec38ac6))
* isolate external field modal from high z-indexes ([fdf97c7](https://github.com/measuredco/puck/commit/fdf97c7f6da6035447e9b7deec9019217875c4ef))
* make Field types required based on type ([daf36ac](https://github.com/measuredco/puck/commit/daf36ac8864dc1b0f324c3e08294f9d62568acf2))
* prevent global style pollution in external fields ([429731d](https://github.com/measuredco/puck/commit/429731dbb77de2d8ca1c4a88832c73294a9b141c))
* prevent long header titles from rendering over actions ([4613df4](https://github.com/measuredco/puck/commit/4613df47fdde9ac796419f02a2d9f649892b3d35))
* use correct heading component for external inputs ([462266d](https://github.com/measuredco/puck/commit/462266d069b04a3de09684af4b816e1d1dac46dc))


### Features

* add categories API for grouping components in side bar ([594cc76](https://github.com/measuredco/puck/commit/594cc76c763a7d2ce06cd78f34a4683c0fa89f8e))
* add read-only states to all field types ([746d896](https://github.com/measuredco/puck/commit/746d896996f01d086d557f2a2918f4e76e3f5b35))
* add icon to external fields ([a3a018b](https://github.com/measuredco/puck/commit/a3a018bb1876fd4b831676e8ff848052ec7ba527))
* add loading state to external field modal ([5b4fc92](https://github.com/measuredco/puck/commit/5b4fc92f96caf83148fa335321dad3a5f1a65789))
* add lock icon when field is read-only ([a051000](https://github.com/measuredco/puck/commit/a05100016fed1e368be333f2707087b152fb4c0e))
* add mapProp API to external fields ([86c4979](https://github.com/measuredco/puck/commit/86c49795ac1d198836242772ec01bd755ee699c8))
* add renderComponentList API ([ec985e3](https://github.com/measuredco/puck/commit/ec985e3d28a4915f8fb2816b9599060d20bbf621))
* add resolveData API for modifying props dynamically ([c1181ad](https://github.com/measuredco/puck/commit/c1181ad9b1de6cc036cfedebcc3e57334ef62196))
* deprecate adaptors in favour of new external field APIs ([7f13efc](https://github.com/measuredco/puck/commit/7f13efc769ddc77fc7931a8191796f017354e89a))
* deprecate magic adaptor _data behaviour in favour of resolveData API ([4ee31e7](https://github.com/measuredco/puck/commit/4ee31e7c0d93578976b2b655e0c56477571f8341))
* deprecate props under root in favour of `root.props` ([7593584](https://github.com/measuredco/puck/commit/759358446e01b4320e55156dbe849d264e4e7edf))
* make external field more consistent with other fields ([5bfbc5b](https://github.com/measuredco/puck/commit/5bfbc5bf71b0af72e97e24b5828ad7009836e51e))
* update next recipe to render to static ([a333857](https://github.com/measuredco/puck/commit/a33385783022179e12ef3f732cb4e2e387985030))


### Performance Improvements

* cache data between fetchList calls in external fields ([04b7322](https://github.com/measuredco/puck/commit/04b7322d5fa5a5506b853c3dcde7a0b47d5b21bc))
* improve render performance of fields ([d92de7f](https://github.com/measuredco/puck/commit/d92de7fe6eaf081deff139b010e4741d07ba6114))




## [0.10.0](https://github.com/measuredco/puck/compare/v0.9.0...v0.10.0) (2023-10-18)


### Bug Fixes

* ensure layer tree consistently shows selected item ([6a9145c](https://github.com/measuredco/puck/commit/6a9145c23b1461e46f3568e9a107d3c429aa87d2))
* only render strings or numbers in external adaptors ([3c337be](https://github.com/measuredco/puck/commit/3c337be171c5fa6ad464f5a16fcb7f17e9b1a4f9))
* prevent style pollution for select fields ([fa7af7d](https://github.com/measuredco/puck/commit/fa7af7da9d770d5e790944d421dc0a30f0da84b1))


### Features

* align component list UI with refreshed array fields ([74cd3a7](https://github.com/measuredco/puck/commit/74cd3a7ba9100e5e7e1a5e626511906fbdf75b98))
* enable drag-and-drop of array items ([12800f8](https://github.com/measuredco/puck/commit/12800f816b872d614ed50c9fcf3179f41dbbbfb2))
* expose state dispatcher to plugins ([e94accb](https://github.com/measuredco/puck/commit/e94accb22bae2afbb30728e0d58f8c6a558b3e39))
* expose state to plugins, removing data ([89f9f2e](https://github.com/measuredco/puck/commit/89f9f2e3a526a1459d14bdd7301f2c761f7c340d))
* expose state to renderHeader, removing data ([29ddaaf](https://github.com/measuredco/puck/commit/29ddaaf376b57134be46a489e7686978d0465669))
* record application state in undo/redo history ([0f2d7c5](https://github.com/measuredco/puck/commit/0f2d7c55aebe898925084ff27d5af97e9a7b9090))
* refresh UI for array fields ([5ef8a96](https://github.com/measuredco/puck/commit/5ef8a96b6952d450927a499f1ec0f93610450864))




## [0.9.0](https://github.com/measuredco/puck/compare/v0.8.0...v0.9.0) (2023-10-06)


### Bug Fixes

* fill empty space under puck-root ([d42cfb6](https://github.com/measuredco/puck/commit/d42cfb69aa7c7e0b70321b4b509efd3c6fdbe393))
* prevent global pollution of Heading color ([327721c](https://github.com/measuredco/puck/commit/327721c705546a538fedd0a3b794926605cd58fc))
* render `icon` if provided to FieldLabel ([ae01891](https://github.com/measuredco/puck/commit/ae01891ce55b844c5a76a20faa33e5df16c2d593))
* reset stacking context for each item ([a826492](https://github.com/measuredco/puck/commit/a826492ee7bab57710edad6b7df498f294398606))


### Features

* add undo/redo history ([222697e](https://github.com/measuredco/puck/commit/222697e5b9e95e3b28d0dfd9ac0b85f46c56068e))
* make actions sticky to component scroll ([f3e5b50](https://github.com/measuredco/puck/commit/f3e5b50d921f0c75978f805a7d44b88511fbaf69))




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
