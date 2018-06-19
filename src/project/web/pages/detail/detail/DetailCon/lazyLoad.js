import ajax from "../../../../../utils/ajax";

export const commonLazyLoad = (imgList, videoList, tid) => {
    let yThreshold = 2000
    let delList = [];
    let devRat = window.devicePixelRatio;
    let matchs = {
        'v.youku.com': {
            test: /.*id_(.*)\.html.*/,
            src: '//player.youku.com/embed/$1'
        },
        'v.qq.com': {
            test: /.*vid=([\w\-]+)&?.*/,
            src: '//v.qq.com/iframe/player.html?vid=$1&tiny=0&auto=0'
        }
    };
    new Promise(resolve => {
        for (let i = 0; i < imgList.length; i++) {
            let item = imgList[i];
            if (item.className.indexOf('fillimg') < 0) {
                let rect = item.getBoundingClientRect()
                if (rect.top > -2000 && rect.top < window.screen.height + yThreshold) {
                    let realSrc = item.getAttribute('data-original')//.replace('test1362383214.qiniudn.com', 'pic.qyer.com')
                    realSrc = devRat === 2 ? realSrc.replace('680x450', '1360x900').replace('/680x', '/1360x') : realSrc;
                    item.src = realSrc
                    item.onload = () => {
                        item.classList.add('gradient_img')
                    }
                    delList.push(i);
                }
                if (i === imgList.length - 1) {
                    resolve();
                }
            } else {
                break;
                resolve();
            }
        }
    }).then(() => {
        for (let l = delList.length - 1; l >= 0; l--) {
            imgList.splice(delList[l], 1);
        }
    })
    for (let i = 0; i < videoList.length; i++) {
        let rect = videoList[i].getBoundingClientRect()
        if (rect.top < window.screen.height + 800) {
            let ele = document.createElement('iframe')
            ele.style.height = parseInt(window.innerWidth * 0.6) + 'px'
            let item = videoList[i]
            let realSrc = item.getAttribute('data-osrc') || item.getAttribute('data-src');
            realSrc = decodeURIComponent(realSrc);
            if (realSrc.indexOf('v.qq.com') > -1 && !realSrc.match(/vid=\w+/)) {
                let qqid = item.getAttribute('data-src').replace(/.*vid=([\w\-]+)&?.*/, '$1')
                realSrc = realSrc.indexOf('?') > -1 ? realSrc + '&vid=' + qqid : realSrc + '?vid=' + qqid
            } else if (realSrc.match(/youku.com/) && realSrc.match(/\.swf/)) {
                let markPath = realSrc.split('sid/')
                if (markPath[1]) {
                    markPath = markPath[1].split('\/')[0]
                    realSrc = 'http://v.youku.com/v_show/id_' + markPath + '.html#paction'
                }
            }

            if (~realSrc.indexOf('.m3u8') || ~realSrc.indexOf('.mp4')) {
                // 视频直播
                ajax({
                    url: '/bbs/videoapi.php',
                    data: {
                        tid: tid,
                        url: realSrc,
                        nocache: 1,
                        timer: new Date() * 1
                    }
                }).then((msg) => {
                    if (!msg.error_code) {
                        realSrc = msg.data.url
                        ele.src = realSrc
                        videoList[i].appendChild(ele)
                    }
                })
            } else {
                for (let key in matchs) {
                    if (realSrc.indexOf(key) > -1) {
                        realSrc = realSrc.replace(matchs[key].test, matchs[key].src)
                        ele.src = realSrc
                        videoList[i].appendChild(ele)
                        videoList.splice(i, 1)
                    }
                }
            }
        }
    }
}