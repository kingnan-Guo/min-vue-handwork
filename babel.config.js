// babel.config.js

// npm i -D babel-jest @babel/core @babel/preset-env
// npm i -D @babel/preset-typescript
module.exports = {
    presets: [['@babel/preset-env', {targets: {node: 'current'}}], '@babel/preset-typescript'],
  };