import ajax from '../../../../../utils/ajax'
class ChildISC {
    constructor(obj) {
        Object.assign(this, obj)
        setTimeout(()=>{
            this.lazyLoad();
        },300)
    }

    touchStart() {
        if (!this.getRec) {
            this.callback('getRec')
            this.getRec = true
        }
        this.startY = document.getElementById('app').getBoundingClientRect().top
    }

    lazyLoad() {
        let yThreshold = 500
        let delList = [];
        new Promise(resolve => {
            for (let i = 0; i < this.imgList.length; i++) {
                let dataId = this.imgList[i].getAttribute('data-id')
                let item = document.querySelector(`img[data-id="${dataId}"]`)
                if (item.className.indexOf('fillimg') < 0) {
                    let rect = item.getBoundingClientRect()
                    if (rect.top > -800 && rect.top < window.screen.height + yThreshold) {
                        let realSrc = item.getAttribute('data-original')
                        item.src = realSrc.replace('test1362383214.qiniudn.com', 'pic.qyer.com')
                        item.onload = () => {
                            item.classList.add('gradient_img')
                        }
                        delList.push(i);
                    } else if (rect.top > window.screen.height + yThreshold) {
                        break;
                        resolve();
                    }
                } else {
                    break;
                    resolve();
                }
            }
        }).then(() => {
            delList.forEach(item => {
                this.imgList.splice(item, 1)
            });
        })
        for (let i = 0; i < this.videoList.length; i++) {
            let rect = this.videoList[i].getBoundingClientRect()
            if (rect.top < window.screen.height + 800) {
                let ele = document.createElement('iframe')
                ele.style.height = parseInt(this.innerWidth * 0.6) + 'px'
                let item = this.videoList[i]
                let realSrc = item.getAttribute('data-osrc') || item.getAttribute('data-src')
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
                            tid: this.tid,
                            url: realSrc,
                            nocache: 1,
                            timer: new Date() * 1
                        }
                    }).then((msg) => {
                        if (!msg.error_code) {
                            realSrc = msg.data.url
                            ele.src = realSrc
                            this.videoList[i].appendChild(ele)
                        }
                    })
                } else {
                    for (let key in this.matchs) {
                        if (realSrc.indexOf(key) > -1) {
                            realSrc = realSrc.replace(this.matchs[key].test, this.matchs[key].src)
                            ele.src = realSrc
                            this.videoList[i].appendChild(ele)
                            this.videoList.splice(i, 1)
                        }
                    }
                }
            }
        }
    }

    touchEnd() {
        this.markTop = document.getElementById('app').getBoundingClientRect().top
    }

    onScroll() {
        const me = this;
        const newTop = document.getElementById('app').getBoundingClientRect().top
        const curTrend = newTop - this.markTop
        if (newTop > -200) {
            return
        }
        if (newTop > -300 && curTrend > 0 && this.fixedBar !== 'hideTop') {
            // 快滑动到顶部了
            this.callback('hideTop')
            this.fixedBar = 'hideTop'
            return
        }
        if (curTrend * this.trend < 0) {
            // 出现反方向
            if (Math.abs(curTrend) < 30) return
            if (curTrend > 0) {
                this.callback('showToolBar')
                this.fixedBar = 'showToolBar'
            } else {
                this.callback('hideToolBar')
                this.fixedBar = 'hideToolBar'
            }
        } else if (curTrend * this.trend == 0) {
            this.callback('hideToolBar')
            this.fixedBar = 'hideToolBar'
        }
        this.trend = curTrend
        this.markTop = newTop
        clearTimeout(this.timer);
        const currentTime = new Date();
        this.lastScrollingTime = currentTime;
        this.timer = setTimeout(function () {
            me.lazyLoad();
        }, 200)
    }
}

class Listen {
    constructor(element, options) {
        this.wrapper = element
        this.changeState(new ChildISC({
            element: this.wrapper,
            imgList: Array.prototype.slice.call(options.imgList),
            videoList: Array.prototype.slice.call(options.videoList),
            haveback: false,
            getRec: false,
            tid: options.tid,
            fixedBar: false,
            markTop: 0,
            trend: 0,
            startY: 0,
            timer: 0,
            lastScrollingTime: 0,
            matchs: {
                'v.youku.com': {
                    test: /.*id_(.*)\.html.*/,
                    src: '//player.youku.com/embed/$1'
                },
                'v.qq.com': {
                    test: /.*vid=([\w\-]+)&?.*/,
                    src: '//v.qq.com/iframe/player.html?vid=$1&tiny=0&auto=0'
                }
            },
            innerWidth: options.innerWidth,
            callback: options.callback
        }))
        this.bindEvents()
    }

    changeState(newState) {
        this._state = newState
    }

    dispatch(method) {
        return (e) => {
            this._state[method](e)
        }
    }

    bindEvents() {
        this.wrapper.addEventListener('touchstart', this.dispatch('touchStart'))
        this.wrapper.addEventListener('touchend', this.dispatch('touchEnd'))
        window.onscroll = this.dispatch('onScroll')
    }
}

export default Listen