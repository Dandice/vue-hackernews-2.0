
import {commonLazyLoad} from "./lazyLoad";

class ChildISC {
    constructor(obj) {
        Object.assign(this, obj)
        setTimeout(() => {
            this.lazyLoad();
            this.onScroll();
        }, 2000)
    }

    lazyLoad() {
        commonLazyLoad(this.imgList,this.videoList, this.tid);
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
        if (newTop > 2500) {
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
            devRat: options.devRat,
            fixedBar: false,
            markSta: null,
            timer: 0,
            lastScrollingTime: 0,
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