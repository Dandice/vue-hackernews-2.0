
const error = resolve => require(['./h5/pages/error/index.vue'], resolve)
//const richText = resolve => require(['./web/pages/richText/index.vue'], resolve)

module.exports = {
    // 项目 ID
    projectID: 'fe-ssr-bbs',

    // 运行端口
    PORT: 18088,

    // 路由列表
    routes: [
        {path: '/h5/post/error', component: error}, // 异常页面
    ]
}
