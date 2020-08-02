const fs = require('fs');
const { join } = require('path');
const parser = require('babylon');
const traverse = require('@babylon/traverse').default;
const entryPoint = './src/index.js';

let dependency = [];

function parse(filename) {
    const content = fs.readFileSync(filename, 'utf-8');
    //转成AST语法树
    const ast = parser.parse(content, {
        sourceType: 'module'
    })

    //declaration
    traverse(ast, {
        ImportDeclaration({ node }) {
            const { start, end, source } = node;
            
        }
    })
}

const depArr = parse(entryPoint);

let template = `(function(modules) {
    var installedModules = {};
  
      
      function __webpack_require__(moduleId) {
  
      
          if(installedModules[moduleId]) {
              return installedModules[moduleId].exports;
          }
      
          var module = installedModules[moduleId] = {
              exports: {}
          };
  
      //执行入口函数
          modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
  
      //返回
          return module.exports;
      }
  
    return __webpack_require__("./src/index.js");
  
  })({
    './src/index.js': (function(module, __webpack_exports__, __webpack_require__) {
  
    }),
    "./src/message.js": (function(module, __webpack_exports__, __webpack_require__) {

    })
  })
`;

fs.writeFileSync('./dist/index.js', template);