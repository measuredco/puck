cd packages/core && npm publish --dry-run --access public --tag $1
cd ../../

cd packages/adaptor-strapi && npm publish --dry-run --access public --tag $1
cd ../../

cd packages/plugin-heading-analyzer && npm publish --dry-run --access public --tag $1
cd ../../

cd packages/create-puck-app && npm publish --dry-run --access public --tag $1
cd ../../
