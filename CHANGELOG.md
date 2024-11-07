# CHANGELOG

<!--__CHANGELOG_ENTRY__-->

## [0.16.2](https://github.com/measuredco/puck/compare/v0.16.1...v0.16.2) (2024-11-07)


### Bug Fixes

* always treat data as immutable, fixing Redux issues ([51154e9](https://github.com/measuredco/puck/commit/51154e92b9022311afa79d086f69b70b6b8beb77))
* don't crash if component definition missing ([525b506](https://github.com/measuredco/puck/commit/525b5065563675d03d89cf090ce1f7fdf8ff0486))
* don't crash when selecting component with no config ([cb90f5d](https://github.com/measuredco/puck/commit/cb90f5d9109b340407bc9828fcd9761183d83e68)), closes [#671](https://github.com/measuredco/puck/issues/671)
* export missing resolveAllData lib in RSC bundle ([2f5fb7b](https://github.com/measuredco/puck/commit/2f5fb7ba69b61b857ad14720b93ceab026571aa7))
* fix RTL styles in action bar overlay ([bf5c5a3](https://github.com/measuredco/puck/commit/bf5c5a33081599331049063c79c7859aea96d0da))
* remove internal AutoField and FieldLabel components from bundle ([5df1597](https://github.com/measuredco/puck/commit/5df1597feede2f0ff922ad13297fd3acaf942da2))
* remove unused label from AutoField type ([18b6f1a](https://github.com/measuredco/puck/commit/18b6f1acae0186245817f35d4a27e6fdf4153ea1))




## [0.16.1](https://github.com/measuredco/puck/compare/v0.16.0...v0.16.1) (2024-10-07)


### Bug Fixes

* don't delete array field on click in FieldLabel ([ed282b9](https://github.com/measuredco/puck/commit/ed282b98ebe8574258444ba91716d8da7e8117d1))
* don't overwrite user input when field recently changed ([6126040](https://github.com/measuredco/puck/commit/61260407c5c87cc8c5c4fe925835f2d0d2a6f9ff))
* don't show field loader if no resolver defined ([8c706cd](https://github.com/measuredco/puck/commit/8c706cda92474114faffc7ed77f4b4024f75bf68))
* hide ActionBar.Group border when empty ([4345165](https://github.com/measuredco/puck/commit/4345165ee71b9762e6bca9baaa53d0c53144d0c4))
* prevent item click before iframe load ([61e1653](https://github.com/measuredco/puck/commit/61e1653020b9e272133c70fa9494f1a81782531e))
* prevent flash of field loader when no data changed ([20d7309](https://github.com/measuredco/puck/commit/20d730924d2f235871bfec4f0467a6652a518704))
* respect readOnly styles in AutoField ([9ffe817](https://github.com/measuredco/puck/commit/9ffe8176c1c437524fd9f7b2912f1a5846fc5e55))




## [0.16.0](https://github.com/measuredco/puck/compare/v0.15.0...v0.16.0) (2024-09-16)


### Features

* add actionBar override for adding component controls ([48ec0d7](https://github.com/measuredco/puck/commit/48ec0d786c7c589efc8b97152a5e1a4c065c0312))
* add automatic RSC export, replacing /rsc bundle ([d21eba6](https://github.com/measuredco/puck/commit/d21eba6185da8efcbcb5458eaaa5be6c321b3d1a))
* add isDisabled prop to Drawer.Item ([cad95b8](https://github.com/measuredco/puck/commit/cad95b887c6b06a41a2bacf28792fd4dbc808d72))
* add generic type to usePuck hook ([01703a9](https://github.com/measuredco/puck/commit/01703a95093413a57af1314b1f31cc34f85c38e0))
* add iframe override for style injection ([7cac376](https://github.com/measuredco/puck/commit/7cac3764d1f9336776b97fa08cbd48bec95e6a10))
* add initialHistory prop to Puck ([54b5a87](https://github.com/measuredco/puck/commit/54b5a871570120a3d0d55e96738746ec375dee0d))
* add onAction API to track and react to state changes ([c7007ac](https://github.com/measuredco/puck/commit/c7007acab334ec2d08f95669d685edb8c3947bcc))
* add permissions API ([a43914d](https://github.com/measuredco/puck/commit/a43914dc36e70c5596c186d3c63b9497949365a9))
* add plugin for injecting Emotion cache ([f8a88b9](https://github.com/measuredco/puck/commit/f8a88b9c2447c76f2f7a00ce5705f8fae07be58c))
* add resolvePermissions API ([f0655f0](https://github.com/measuredco/puck/commit/f0655f08a96b853cf18d681025f40e8d30df3013))
* add waitForStyles option to iframe config ([bc81d9c](https://github.com/measuredco/puck/commit/bc81d9c7de671fea0bc155911ee11598a1b920c2))
* call resolveData when new item inserted ([3298831](https://github.com/measuredco/puck/commit/329883165c9e428b9f291add7b6009ba29680146))
* don't mandate fields for optional props ([5a219ef](https://github.com/measuredco/puck/commit/5a219eff0c2f4763ec1d9f48f45fe684e6482b8f))
* export ActionBar component for use in overrides ([04fd6c5](https://github.com/measuredco/puck/commit/04fd6c5c7a65fc3ec9a05da277865341efe229af))
* infer Data type from user config ([50045bb](https://github.com/measuredco/puck/commit/50045bbda2cf3b64e37e0e6bedcfce14f680cda1))
* make ID optional in History type (BREAKING CHANGE) ([d917229](https://github.com/measuredco/puck/commit/d917229ae4f553bb54a420e1c708c1a509431106))
* provide ES Module build ([ff9076b](https://github.com/measuredco/puck/commit/ff9076b9d24d030ad47619b6a359b1f120422d70))
* rename history.data to history.state (BREAKING CHANGE) ([b09244c](https://github.com/measuredco/puck/commit/b09244c864fd049ceeda2b7eb20ec6cab9f40054))
* show spinner if iframe load takes over 500ms ([cfecf54](https://github.com/measuredco/puck/commit/cfecf5499d06b8e90438dc151e5e915da06ccb87))
* streamline usePuck history API ([c8b2807](https://github.com/measuredco/puck/commit/c8b28075fde0081b8ac824eb256114c9b8836f9e))
* upgrade "next" recipe to typescript@5.5.4 ([60fe631](https://github.com/measuredco/puck/commit/60fe63113f8ad8bbce52d8457ee4372aa4b09509))


### Bug Fixes

* add favicon to next recipe to prevent Puck 404 ([2c52d27](https://github.com/measuredco/puck/commit/2c52d271c6c20e9368a59eb1f2a5df184cef72bc))
* add missing readOnly state to External fields ([bf1449d](https://github.com/measuredco/puck/commit/bf1449dd8b299a4f469986d94f8986b02b79a688))
* always record history on component insert ([88c5ab6](https://github.com/measuredco/puck/commit/88c5ab6b545ecbd045de3ee0d43801c48f50e8b0))
* don't cache /edit route in Next recipe ([94f16b2](https://github.com/measuredco/puck/commit/94f16b25efea86ff475683d3a21f5937e07b201c))
* don't submit buttons if Puck used in form ([f761e5f](https://github.com/measuredco/puck/commit/f761e5fed63fc698e3a9d6ba94607364ed46f31b))
* ensure demo types are satisfied with TypeScript@5 ([958dc25](https://github.com/measuredco/puck/commit/958dc255ac5d285f98b6b592df677883b74e2830))
* export missing Plugin type ([eb42734](https://github.com/measuredco/puck/commit/eb427343fd58752861cac850f59c1098cf473f50))
* fix crash if component in data is missing from config ([0daf478](https://github.com/measuredco/puck/commit/0daf478d9ad8b14d2844ff6ae2db9bd72970d680))
* improve resiliency of iframe CSS for some frameworks, like Mantine ([538cb05](https://github.com/measuredco/puck/commit/538cb05606126c338e97c047b97065463e618d36))
* make Config and Data types more robust ([6bcf555](https://github.com/measuredco/puck/commit/6bcf555da74d54d70f00f37878d35fa166bb7e4c))
* prevent infinite loop when using plugins with some frameworks ([3870871](https://github.com/measuredco/puck/commit/38708716f32d65a9131b87fe664ba96b32aead15))
* prevent Tailwind from clashing with viewport zoom select ([9151255](https://github.com/measuredco/puck/commit/91512553430b295c37c80a935f0db929bb37870c))
* remove body margin in remix recipe ([0898b26](https://github.com/measuredco/puck/commit/0898b26cd021680dfb77a439b04140ce2fb8cb2c))
* resize viewport when changed via app state ([14419ec](https://github.com/measuredco/puck/commit/14419ecf1c606e6fa0d6d9c5198401eb01bc72dd))
* resolve fields when switching between items of same type ([a3518ca](https://github.com/measuredco/puck/commit/a3518ca8560ba9fcdbe5086220490920ecf24fc0))
* return lastData as null instead of empty object in resolvers (BREAKING CHANGE) ([648eb92](https://github.com/measuredco/puck/commit/648eb92b3d2c5be8f5fc99a22db5eff64cefb155))
* show warning if heading-analyzer styles aren't loaded ([4e7110b](https://github.com/measuredco/puck/commit/4e7110b591a4a12e2b3c89eb1fa98faf5f9338d4))
* use correct color in FieldLabel labels ([b0469a1](https://github.com/measuredco/puck/commit/b0469a1134ac8eafc9a3b16de4d7805241127947))




## [0.15.0](https://github.com/measuredco/puck/compare/v0.14.2...v0.15.0) (2024-05-30)


### Bug Fixes

* align Drawer behaviour and docs with expectation ([e2cd445](https://github.com/measuredco/puck/commit/e2cd445f9d3abccca5b3daf95a4d92774a1dd47a))
* animate loader in iframe ([151a267](https://github.com/measuredco/puck/commit/151a2675bf8e700368aad0652192bc7d9fd2bbd6))
* don't inline link stylesheets for more predictable behaviour ([c0a331d](https://github.com/measuredco/puck/commit/c0a331de31c2d59e0e21ef342eb4c821850e10be))
* don't overflow external inputs inside arrays/objects ([42ef582](https://github.com/measuredco/puck/commit/42ef582cac949f8a24f9cdad204baf24d808b410))
* don't throw warning when user is correctly specifying root props ([46aa8ff](https://github.com/measuredco/puck/commit/46aa8ff3a68dcbd4aec4ebfef246d400469ca4d4))
* don't unintentionally use read-only styles in external fields ([acaf727](https://github.com/measuredco/puck/commit/acaf72746c2c82881a753dab6350161c774cd13f))
* fix defaultProps for root ([9a1cc7c](https://github.com/measuredco/puck/commit/9a1cc7c925f0b8a79b5f523fc7c8a6d6afdc2067))
* infer correct value types in Custom fields ([5c8c0e1](https://github.com/measuredco/puck/commit/5c8c0e1bfa9ca4da04e1cfac83c7a3ab5883fc5c))
* position field loader relative to sidebar, not fields ([2e8936e](https://github.com/measuredco/puck/commit/2e8936e4f416b0a04b273250cf3848447fb7e045))
* show external field modal when using custom interfaces ([6e97a0e](https://github.com/measuredco/puck/commit/6e97a0e18aea72581ba466e8cf3f87e60f3a65f3))
* show field loader when using field overrides ([8ccfa4c](https://github.com/measuredco/puck/commit/8ccfa4c0c3477b8e1d2db2fcc7a352b353643095))
* still load iframe if styles fail to load ([3e56bc1](https://github.com/measuredco/puck/commit/3e56bc1816c40c555de2eb28148baf5dcdcacbea))


### Features

* add AutoField component for using Puck fields inside custom fields ([106028b](https://github.com/measuredco/puck/commit/106028b59bb1a02756645bb76ce400adc398430d))
* add isEditing flag to `puck` object prop ([13bb1bd](https://github.com/measuredco/puck/commit/13bb1bdf03a62000c07a7d49a56ad09c1433fda0))
* add resolveFields API for dynamic fields ([0a18bdb](https://github.com/measuredco/puck/commit/0a18bdb9387f302565f74fa30f09fd912ea0769b))
* allow data prop to accept an empty object ([aedd401](https://github.com/measuredco/puck/commit/aedd401dd415e9d7dc1cbd6e33e59f5264180374))
* bump next recipe to Next@14 ([47a27ed](https://github.com/measuredco/puck/commit/47a27ed2c6aee80d4093975c399d96b950cb6956))
* enable override of publish button (breaking change) ([480467a](https://github.com/measuredco/puck/commit/480467ae2e06ae4d36c4fd67f75757557058f561))
* expose previous data to resolveData via `lastData` param ([dd7051e](https://github.com/measuredco/puck/commit/dd7051e8fbb3770714100c92f7f5c69d0be5dab6))
* replace history chevrons with undo/redo icons ([91dff22](https://github.com/measuredco/puck/commit/91dff227c382ddd5ad183cd69cb4d2fabd56f093))




## [0.14.2](https://github.com/measuredco/puck/compare/v0.14.0...v0.14.2) (2024-04-17)


### Bug Fixes

* add DropZone iframe compatablity mode for bug in Safari 17.2, 17.3 and 17.4 ([47496c2](https://github.com/measuredco/puck/commit/47496c25407b1a5fdb88333e1fbf5416efc51c50))
* check for optionality to handle race condition when dragging ([4dbd487](https://github.com/measuredco/puck/commit/4dbd487f6055ea3d38ab7de54e29bd6e4ffe84ce))
* defer iframe event binding until contentWindow is ready ([268ea53](https://github.com/measuredco/puck/commit/268ea53f969a892843c026e5ba9ced15edb9f801))
* don't crash if component is missing after referenced in category ([dc93789](https://github.com/measuredco/puck/commit/dc93789c4311e386b022b5c3d7c8595c00a8a212))
* don't force height of DropZones in custom interfaces ([046c255](https://github.com/measuredco/puck/commit/046c2557b6baa62994380c547ad006759b02cc92))
* don't query iframe document if not ready ([2b2ef32](https://github.com/measuredco/puck/commit/2b2ef32555387d4656872674289740b73dcd406b))
* don't throw undefined error if rapidly zooming browser in some environments ([282a8b0](https://github.com/measuredco/puck/commit/282a8b0d9f170ea95f5717c8b2ad08ec487d7d8f))
* fix drag-and-drop when entire Puck component used inside an iframe ([23db292](https://github.com/measuredco/puck/commit/23db292b9a2caa8e65117c08706843d3ed343454))
* fix support for boolean values in select fields ([c4a66ad](https://github.com/measuredco/puck/commit/c4a66addacd9acdc1f042ac54831b7dac38f2757))
* make draggable outlines consistent ([9008b70](https://github.com/measuredco/puck/commit/9008b70ed63155140a5241914c86456a2d4c9388))
* prevent grid layout issues in generated apps ([5c05f94](https://github.com/measuredco/puck/commit/5c05f945679f7f2c0edd5d99c652989c00920ac6))
* reflect value changes made via resolveData in radio fields ([9a7066f](https://github.com/measuredco/puck/commit/9a7066f4e837575aecbde0de4dd2bc96328a2a15))
* remove peer dependencies causing warnings ([041ca64](https://github.com/measuredco/puck/commit/041ca64a6fe96539681d88e9cd0e66a6ac27a6ce))
* resolve security warning when additional iframes present ([03ab0bd](https://github.com/measuredco/puck/commit/03ab0bd3314a4d6dfc863bdcf5f23246331b959b))
* use 100% width for Puck preview when iframe disabled ([#414](https://github.com/measuredco/puck/issues/414)) ([64303c8](https://github.com/measuredco/puck/commit/64303c8510df15b6ca94bc7be0294d9746193b35))
* use more custom interface friendly styles for iframes ([e6e01c6](https://github.com/measuredco/puck/commit/e6e01c6ec5b2bee9ab3a4a9425276ad4f1840c20))


### Performance Improvements

* add API for disabling auto-scroll due to performance issues ([3e5599e](https://github.com/measuredco/puck/commit/3e5599e687643094f7c80d0ce99a7c6a0c947e28))
* batch load initial iframe styles ([e585f20](https://github.com/measuredco/puck/commit/e585f2090c0457d124006bd6349a69c9883d3c03))
* don't lock main thread when iframe styles changed ([e529e85](https://github.com/measuredco/puck/commit/e529e8525eb758025261577c424d8601c1ed8daf))
* reuse host window styles in iframes ([e7fe7e0](https://github.com/measuredco/puck/commit/e7fe7e0d7577bae1ab90650e5d7986d6745fbaf9))




## [0.14.1](https://github.com/measuredco/puck/compare/v0.14.0...v0.14.1) (2024-04-01)


### Bug Fixes

* don't throw undefined error if rapidly zooming browser in some environments ([282a8b0](https://github.com/measuredco/puck/commit/282a8b0d9f170ea95f5717c8b2ad08ec487d7d8f))
* prevent grid layout issues in generated apps ([5c05f94](https://github.com/measuredco/puck/commit/5c05f945679f7f2c0edd5d99c652989c00920ac6))
* remove peer dependencies causing warnings ([041ca64](https://github.com/measuredco/puck/commit/041ca64a6fe96539681d88e9cd0e66a6ac27a6ce))




## [0.14.0](https://github.com/measuredco/puck/compare/v0.13.0...v0.14.0) (2024-03-28)


### Features

* add "name" prop to componentItem override ([45bbceb](https://github.com/measuredco/puck/commit/45bbceb1d2805455fa38f5bce91d892f6acacfbf))
* add `min` and `max` APIs to array fields ([53b7937](https://github.com/measuredco/puck/commit/53b7937675303bc3cf282bbd005309c8c276d1b2))
* add API to opt-out of iframes ([03dd90b](https://github.com/measuredco/puck/commit/03dd90b98c8a72e2af3baa8fc436ff7d4f4c7449))
* add Contentful field package ([d944288](https://github.com/measuredco/puck/commit/d94428819a958b4f566e5d0e8cd29b3bf1107881))
* add filter fields to ExternalFields ([7a55053](https://github.com/measuredco/puck/commit/7a5505374953ab8004720a9c91d8975ad3df94e5))
* add iframe support ([1d0bf57](https://github.com/measuredco/puck/commit/1d0bf57894200edc6b9a883a41937f7a3141074f))
* add `min` and `max` APIs to number fields ([4932a6e](https://github.com/measuredco/puck/commit/4932a6ef1b640410b3291cc67fb1f3153c04eac4))
* add `selectedItem` convenience param to usePuck ([c1224d0](https://github.com/measuredco/puck/commit/c1224d026d37bbbcf1366804947771902e29d9bb))
* add viewport switching ([ccf9149](https://github.com/measuredco/puck/commit/ccf91495f3a9f20a37051ba407abd992095a7b4d))
* enable mapping of table rows in external fields ([d50c56e](https://github.com/measuredco/puck/commit/d50c56e829b482f13c5ec08acc76eed70494d3cf))
* expose history via usePuck hook ([1b907cb](https://github.com/measuredco/puck/commit/1b907cba506dda7a2b1fe201a426e1c4bcfffecc))
* hide array Add button when array is readOnly ([4e27c3f](https://github.com/measuredco/puck/commit/4e27c3f18a0fa9a97dcd5fd240b01a133d7cb153))
* improve touch, contrast & keyboard a11y ([f975d87](https://github.com/measuredco/puck/commit/f975d87c5c2823e1f27161e6b6aa76a0d3fafad2))
* refine UI for external field modal ([6a2afa1](https://github.com/measuredco/puck/commit/6a2afa1abbd33a062bca6962b547b5534ed93036))
* support custom component labels via the new label param ([712fb8e](https://github.com/measuredco/puck/commit/712fb8eeac0502b2baea4c86a4494eb8f924ed82))
* update to 12-tint color palette ([d43da58](https://github.com/measuredco/puck/commit/d43da581da3bd79324ed846ca5c5cd0c86469b23))
* use InterVariable font ([88532fb](https://github.com/measuredco/puck/commit/88532fbc248a3a171dc2e26906dcd68ba5979570))


### Bug Fixes

* avoid FOUC of side bars on mobile ([83be956](https://github.com/measuredco/puck/commit/83be95643e4dcb96e30d0e6a9dbfe03c60f83002))
* correctly infer objectFields type from props ([e8991cc](https://github.com/measuredco/puck/commit/e8991cc90d5fd899a3357f6d1f50b382d90aad23))
* don't attempt to resolve data if component missing from config ([cc7d391](https://github.com/measuredco/puck/commit/cc7d391503cce3cbdbad9b769b5fb0fca6610cb0))
* don't flash nested DropZones on first drag ([38c3dc4](https://github.com/measuredco/puck/commit/38c3dc418e047b7f1218c8c50cf3ba3f2e6b74d8))
* don't unexpectedly show DropZone background ([2001fa2](https://github.com/measuredco/puck/commit/2001fa2bb6e69451f68cd94a3f872a0f83ff2b4b))
* ensure font loads for ExternalFields ([e9bca75](https://github.com/measuredco/puck/commit/e9bca751926db8a88f4f6ad2bc135a10705987d9))
* ensure heading-analyzer updates when content changes ([d75df7a](https://github.com/measuredco/puck/commit/d75df7a5c8ab365a4ef0de6c81c707e706433383))
* ensure select and radio fields support read only arrays ([cbdf66d](https://github.com/measuredco/puck/commit/cbdf66d348acc3461f321956c80dbc87a896069e))
* fix array field when used on root ([95280e6](https://github.com/measuredco/puck/commit/95280e686409342d3be3d68ec2acb90f7cfc570e))
* fix renderDropZone method in editor ([2c738dd](https://github.com/measuredco/puck/commit/2c738dd3761596925caecfee2bfdcb2960a10b83))
* lower opacity of DropZone background to support dark backgrounds ([9a5c0b8](https://github.com/measuredco/puck/commit/9a5c0b8ec57e41eeda3592d9a45ab00907a7a313))
* make getItemSummary optional on ExternalFields, as expected ([26bc4ff](https://github.com/measuredco/puck/commit/26bc4ff320cc93bf4376edd190b3779774f2f87c))
* only import Puck CSS on editor pages ([22a4182](https://github.com/measuredco/puck/commit/22a41823559d36fd06842496d59788004b316797))
* prevent unexpected field behaviour when pressing "Enter" key ([bf4f527](https://github.com/measuredco/puck/commit/bf4f5277f5d5cbf7a7ccf473130055575a5e983a))
* use strict return type for resolveData ([777cd3c](https://github.com/measuredco/puck/commit/777cd3c02a0b0ec8df1b81e19654b1179b56cb53))
* vertically align field icons ([fa92436](https://github.com/measuredco/puck/commit/fa924363c8f2e5ad3d866793ba34a1b488250ce5))



## [0.13.1](https://github.com/measuredco/puck/compare/v0.13.0...v0.13.1) (2023-12-23)


### Bug Fixes

* don't render plugins twice when using React strict mode ([f70c722](https://github.com/measuredco/puck/commit/f70c7222dd844257fab791fb4d5f8cf90e3361df))
* replace crypto with uuid lib ([a84e06f](https://github.com/measuredco/puck/commit/a84e06feec977bca1ac7e08b6e55ba8afe0141dc))




## [0.13.0](https://github.com/measuredco/puck/compare/v0.12.0...v0.13.0) (2023-12-19)


### Features

* add "ui" prop to Puck to set the initial state ([71f8b2f](https://github.com/measuredco/puck/commit/71f8b2f1143b9774fd763a8f5a3685957474237b))
* add APIs to restrict components dropped in DropZones ([28f24f9](https://github.com/measuredco/puck/commit/28f24f927a2d1c378834f124e85abfcc2267a0d7))
* add data migration API ([f987324](https://github.com/measuredco/puck/commit/f987324804d59e55a3a5e6770389305d88f39194))
* add generic Config type to Puck and Render components ([1c4b97f](https://github.com/measuredco/puck/commit/1c4b97f0a8487785b5a677a2a1ba168b292e5ca4))
* add object field type ([243278b](https://github.com/measuredco/puck/commit/243278bb01e34de6123a47d902fcc58ea7678642))
* add Puck class to outer div ([0698a12](https://github.com/measuredco/puck/commit/0698a127e093cb2cf66fa35dafca80ebd4c73f89))
* add search to external fields ([fe3b439](https://github.com/measuredco/puck/commit/fe3b4394c7464eeab69e1af5a96bd525bd15872a))
* add transformProps lib to migrate component props ([1ec2a78](https://github.com/measuredco/puck/commit/1ec2a78968e10efc5666aaf994b6feea6c820449))
* add usePuck hook ([13f3ccb](https://github.com/measuredco/puck/commit/13f3ccbd314e5a82f5a509c713ad34d3d0614b34))
* introduce UI overrides API ([8a7c325](https://github.com/measuredco/puck/commit/8a7c3252d8aed2c160e390c1ba7c411d8b884b6f))
* make onPublish prop optional ([60f317f](https://github.com/measuredco/puck/commit/60f317f75bb1a18bd59819d1323c45266334138c))
* remove renderComponentList in favour of overrides API ([97f65e3](https://github.com/measuredco/puck/commit/97f65e3f0411abab66a72ea3c9ecd485cd941b4e))
* replace existing plugin API with plugin overrides ([46cca26](https://github.com/measuredco/puck/commit/46cca26c879a2ae53cf3e668f1dad37bb480bd84))
* support compositional Puck ([22f053f](https://github.com/measuredco/puck/commit/22f053fa6209735c27b172eb625ea25d9df4bb3d))
* track isDragging in app state ([841ae12](https://github.com/measuredco/puck/commit/841ae126d3f5e8a9e40c064b69d5ee675169e4cd))


### Bug Fixes

* don't crash when loading external data into array field items ([d13d00b](https://github.com/measuredco/puck/commit/d13d00b67a7106889a0fc3beae94fa9c2e5bfcc3))
* enable user to pass in config without casting ([ee211e2](https://github.com/measuredco/puck/commit/ee211e2a3ae6fbcb3d2b12316172e49f11fecd1e)), closes [#185](https://github.com/measuredco/puck/issues/185)
* fix broken nested array fields ([7a3949f](https://github.com/measuredco/puck/commit/7a3949f7f10b2323504b31bcae9a9aa5d46f4074))
* fix initial UI state on mobile ([3aa0057](https://github.com/measuredco/puck/commit/3aa005740b650879d95318a01ac9e2949ec5e9d8))
* prevent pollution of global styles into component overlay ([3fcf8e3](https://github.com/measuredco/puck/commit/3fcf8e3f9975a14d8bc355e025585c9f55f233b1))
* record history when a user selects an item ([3a649c9](https://github.com/measuredco/puck/commit/3a649c9922cc0a6c8c6c2b96f5fbe44bd3a6176a))
* remove packages triggering superficial security warning ([0f52b61](https://github.com/measuredco/puck/commit/0f52b610769550b3365ab91f856b264d02d005c2))
* respect label in radio fields ([fe550d7](https://github.com/measuredco/puck/commit/fe550d795eed20ce3a3004a2e7c8dfdbaca0b67d))
* set aria-label on all loaders ([9adca27](https://github.com/measuredco/puck/commit/9adca2774dae5e532134be76de9c79e0b4af751c))
* stop color pollution in external field modals ([2e1b5ef](https://github.com/measuredco/puck/commit/2e1b5ef330ebbddee8c44b5002be65c2361fda4f))
* use correct title path in recipes ([60244ba](https://github.com/measuredco/puck/commit/60244ba5637d889530ae646986b1890c6b89efea))
* watch puck.config.tsx in Remix recipe ([ecb276c](https://github.com/measuredco/puck/commit/ecb276c39fd3cf03d524b221b3f34b3a8df99823))




## [0.12.0](https://github.com/measuredco/puck/compare/v0.11.0...v0.12.0) (2023-11-23)


### Features

* support React server components via @measured/puck/rsc bundle ([90ac161](https://github.com/measuredco/puck/commit/90ac161513d0c8c84f6b2bb968f7e5400c732a0a))
* add remix recipe ([f882878](https://github.com/measuredco/puck/commit/f882878e081b44a2b0bd1f773114f3c35b8398b1))
* add explicit rsc and css exports ([0b6a527](https://github.com/measuredco/puck/commit/0b6a52792628225d392775ba6b3d549aab5be59b))
* improve responsive behaviour ([889b4c7](https://github.com/measuredco/puck/commit/889b4c7a91f1a9b95c9fd7d4b3cdb20b2ee4946b))
* add visibility toggle for right-hand sidebar ([3d6c5d4](https://github.com/measuredco/puck/commit/3d6c5d479f2237400e0dc7cab6d5ed5773058d3b))
* allow custom fields to set UI state during onChange ([388793c](https://github.com/measuredco/puck/commit/388793c9b0ac27b14a538b70357abd0dc4f26779))
* expose field "id" to custom fields ([849161e](https://github.com/measuredco/puck/commit/849161ef0e2e2e01f6a1b9f517ba4bcc66cf6bd1))
* improve IconButton accessibility ([4c71d39](https://github.com/measuredco/puck/commit/4c71d39d1138f0fc823ada04710d0057433475b7))
* add new monospaced font stack ([c484ea6](https://github.com/measuredco/puck/commit/c484ea6bae5e6283bf82860e9a84413e60720163))
* tweak Field input focus state ([8012afd](https://github.com/measuredco/puck/commit/8012afdd9be2e3bc96185b4f0208b3ebdef0ed21))


### Bug Fixes

* don't enable style pollution of input background color ([bb1a76b](https://github.com/measuredco/puck/commit/bb1a76b314f744b76197cb670c448abc7896a45e))
* don't reset array item labels when changing order ([57563e1](https://github.com/measuredco/puck/commit/57563e1da1826dbfa08a32fabb27153e4618ab40))
* ensure field icon and label are vertically aligned ([caa40e0](https://github.com/measuredco/puck/commit/caa40e0499570831e5779f9a6a031e38f054c3f8))
* ensure root render receives props from latest data API ([abb6ff1](https://github.com/measuredco/puck/commit/abb6ff1bd53d7f93ef0ac287290712943ca2c1ce))
* export missing PuckAction type ([f22f32d](https://github.com/measuredco/puck/commit/f22f32dc5569eaa9cea90f896cf4cdafc59940fe))
* fix rootResolver behaviour when using recommended root data API ([5c13de5](https://github.com/measuredco/puck/commit/5c13de58a335f2b4c81f2b424fee8b4a356fb563))
* migrate to @hello-pangea/dnd to fix defaultProps warning ([2c97362](https://github.com/measuredco/puck/commit/2c97362e15f5d2046dc216c6e5fc25f5199d0a37))
* prevent inconsistent default input font-size ([99f90b3](https://github.com/measuredco/puck/commit/99f90b3ba81bf286758685f7c2a457abaffeb2e1))
* show a default value when no placeholder set on external fields ([e30b5b6](https://github.com/measuredco/puck/commit/e30b5b69b6a9f6467db4b05c55ffdc5f1ecebcfb))
* stop `zones` getting wiped out if data prop updated ([0c4514f](https://github.com/measuredco/puck/commit/0c4514fcde24d0ba585fea0981d73e7a8188840f))
* stop style pollution into array field items ([03b89d5](https://github.com/measuredco/puck/commit/03b89d568ded7cae6eb34e0dcf45e60eb758b552))
* stretch external field table to width of modal ([f6d89f6](https://github.com/measuredco/puck/commit/f6d89f69f1a24f94479365b9d955a3ea60b17b8d))
* use correct root data API in next recipe example database ([b598144](https://github.com/measuredco/puck/commit/b5981446ee64a3b5451eb17b8d42263f42df179f))
* use Inter font in button type Buttons ([1973847](https://github.com/measuredco/puck/commit/19738473723c49ddb0d764864283bf597280c7c5))




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
