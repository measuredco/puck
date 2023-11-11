cd packages/core && npm publish --access public --tag $1
cd ../../

cd packages/plugin-heading-analyzer && npm publish --access public --tag $1
cd ../../

cd packages/create-puck-app && npm run removeGitignore && npm publish --access public --tag $1 && npm run restoreGitignore
cd ../../
