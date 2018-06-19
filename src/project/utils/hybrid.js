import ajax from './ajax'


// 电梯 app<7.12 window.elevatorOpt

// 点击电梯列表
export const toAnchor = () => {
    window.BBS.toAnchor = (pid, jumpId) => {
        //当前页面跳转
        //let nPid = `post-${pid}-${jumpId}`
        if (document.getElementById(jumpId)) {
            location.href = `${location.href.split('#')[0]}#${jumpId}`
        } else {
            //非当前页面跳转
            ajax({
                url: '/qcross/bbs/post.php',
                data: {
                    action: 'getPostPage',
                    tid: window.BBS.TID,
                    pid
                }
            }).then(res => {
                if (!res.error_code) {
                    const page = res.data.page;
                    const cpSpi = location.href.split('?')[0].split('-')
                    location.href = `${cpSpi[0]}-${cpSpi[1]}-${page}.html#${jumpId}`
                }
            });
        }
    };
}

// 只看楼主
export const onlyLz = (onlyLzUrl) => {
    window.bbsDetailAncOpt = () => {
        let url = location.href;
        if (location.href.indexOf('authorid') > -1) {
            let cpSpi = url.split('?')[0].split('-')
            location.href = `${cpSpi[0]}-${cpSpi[1]}-${cpSpi[2].replace(/[\d]+/, 1)}`
        } else {
            location.href = onlyLzUrl
        }
    };
}

// 有图无图模式  window.bbsDetailPhotoOpt

