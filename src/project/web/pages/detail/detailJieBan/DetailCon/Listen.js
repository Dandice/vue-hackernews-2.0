import ajax from '../../../../../utils/ajax'

class ChildISC {
    constructor(obj) {
        Object.assign(this, obj)
        setTimeout(() => {
            this.lazyLoad();
            this.onScroll();
        }, 2000)
    }

    lazyLoad() {
        let yThreshold = 500
        let delList = [];
        new Promise(resolve => {
            for (let i = 0; i < this.imgList.length; i++) {
                //let dataId = this.imgList[i].getAttribute('data-id')
                //let item = document.querySelector(`img[data-id="${dataId}"]`)
                let item = this.imgList[i];
                if (item.className.indexOf('fillimg') < 0) {
                    let rect = item.getBoundingClientRect()
                    if (rect.top > -800 && rect.top < window.screen.height + yThreshold) {
                        let realSrc = item.getAttribute('data-original')//.replace('test1362383214.qiniudn.com', 'pic.qyer.com')
                        item.src = realSrc
                        item.onload = () => {
                            item.classList.add('gradient_img')
                        }
                        delList.push(i);
                    }
                    if (i === this.imgList.length - 1) {
                        resolve();
                    }
                } else {
                    break;
                    resolve();
                }
            }
        }).then(() => {
            for (let l = delList.length - 1; l >= 0; l--) {
                this.imgList.splice(delList[l], 1);
            }
        })
        for (let i = 0; i < this.videoList.length; i++) {
            let rect = this.videoList[i].getBoundingClientRect()
            if (rect.top < window.screen.height + 800) {
                let ele = document.createElement('iframe')
                ele.style.height = parseInt(this.innerWidth * 0.6) + 'px'
                let item = this.videoList[i]
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

    onScroll() {
        const me = this;
        const newTop = Math.abs(document.getElementById('app').getBoundingClientRect().top)
        let sta = null;
        if (newTop < 620) {
            sta = 'canceldock'
        } else if (newTop > 620) {
            sta = 'topdock'
        }
        if (newTop > 1900) {
            sta = 'botdock'
        }

        if (this.markSta !== sta) {
            this.markSta = sta;
            this.callback(sta)
        }

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
            markSta: null,
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
        window.addEventListener('scroll', this.dispatch('onScroll'), false);
    }
}

export default Listen