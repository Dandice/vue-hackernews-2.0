const fs = require('fs')

module.exports = {
  afterBuild(){
    return new Promise((resolve,reject)=>{
      var tpl = `var hybridInfo={"version":"${Date.now()}"}`;
      fs.writeFileSync(`${process.cwd()}/dist/hybridversion.js`,tpl)
      resolve()
    })
  }
};

