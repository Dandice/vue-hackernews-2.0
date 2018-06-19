import ajax from '../../../../../utils/ajax'

class ChildISC {
    constructor(obj) {
        Object.assign(this, obj)
        if (location.href.indexOf('#/') < 0) {
            this.analyFloorId();
        }
    }

    analyFloorId() {
        const yThreshold = 150, me = this;
        let markIdxArray = [];
        let markIdArray = [];
        new Promise(resolve => {
            for (let i = 0; i < this.floorIdArray.length; i++) {
                let item = document.getElementById(`item-post-${this.floorIdArray[i]}`)
                let rect = item.getBoundingClientRect()
                if (rect.top > -150 && rect.top < window.screen.height + yThreshold) {
                    markIdxArray.push(i);
                    if (i === this.floorIdArray.length - 1) {
                        for (let l = markIdxArray.length - 1; l >= 0; l--) {
                            markIdArray.push(me.floorIdArray.splice(markIdxArray[l], 1)[0]);
                        }
                        resolve(markIdArray);
                    }
                } else if (rect.top > window.screen.height + yThreshold) {
                    if (markIdxArray.length) {
                        for (let l = markIdxArray.length - 1; l >= 0; l--) {
                            markIdArray.push(me.floorIdArray.splice(markIdxArray[l], 1)[0]);
                        }
                        resolve(markIdArray);
                        break;
                    }
                }
            }
        }).then(pid => {
            if (pid.length) {
                this.getFloorCon(pid);
            }
        });

    }

    getFloorCon(pid) {
        const me = this;
        ajax({
            url: `/detail/content/p/${encodeURIComponent(pid.join())}.json`,
            data: {
                //action: 'content',
                ajaxID: '5aa7a6618776329315f6d14c',
                //pid: pid.join(),
                time_sta: new Date() * 1,
            }
        }).then(msg => {
            me.callback(msg, pid);
        });
    }


    onScroll() {
        const me = this;
        clearTimeout(this.timer);
        this.timer = setTimeout(function () {
            me.analyFloorId();
        }, 200)
    }
}

class Listen {
    constructor(element, options) {
        this.wrapper = element
        this.changeState(new ChildISC({
            element: this.wrapper,
            thisVue: options.thisVue,
            floorIdArray: options.floorIdArray,
            timer: 0,
            callback: options.callback
        }));
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