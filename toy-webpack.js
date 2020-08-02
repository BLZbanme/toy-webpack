const fs = require('fs');
const { join } = require('path');
const parser = require('babylon');
const traverse = require('@babel/traverse').default;

const MagicString = require("magic-string");
const entryPoint = './src/index.js';
const ejs = require('ejs');

let dependencies = [];

function parse(filename) {
    let depsArr = [];
    const content = fs.readFileSync(filename, 'utf-8');
    //转成AST语法树

    const code = new MagicString(content);
    const ast = parser.parse(content, {
        sourceType: 'module'
    })

    //declaration
    traverse(ast, {
        ExportDeclaration({ node }) {
            const { start, end, declaration } = node;
            code.overwrite(start, end, `__webpack_exports__["default"] = ${declaration.name}`);
        },
        ImportDeclaration({ node }) {
            const { start, end, specifiers ,source } = node;
            const newFile = './src/' + join(node.source.value);
            code.overwrite(start, end, `var ${specifiers[0].local.name} = __webpack_require__("${newFile}").default;`)
            depsArr.push(newFile);
        }
    })

    const _code = code.toString();

    dependencies.push({
        filename,
        _code
    })

    return depsArr;
}

const depsArr = parse(entryPoint);

for (let item of depsArr) {
    parse(item);
}

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
  
  })({<% for (var i = 0; i < dependencies.length; i++) {%>
        "<%- dependencies[i]["filename"]%>": (function(module, __webpack_exports__, __webpack_require__) {
            <%- dependencies[i]["_code"] %>
        }),<%}%>
  })
`;

let result = ejs.render(template, {
    dependencies
})

fs.writeFileSync('./dist/index.js', result);