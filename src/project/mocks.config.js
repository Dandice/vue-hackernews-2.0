
module.exports = {

    // mockServer 程序运行端口，可自己任意修改，主要端口不冲突就行
  PORT: 3000,

    // 页面级别 mock 数据列表
  mocks: [
    {
            // 要渲染页面的名称
      name: '详情页',

            // 对应路由，和 project.config.js 里面的路由配置
      router: '/h5/post/detail/common',

            // 数据列表
      data: [
                {name: '测试数据1', data: require('./mocks/detail')}
      ]
    }
  ]

}
