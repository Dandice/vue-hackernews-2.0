import ajax from '../../../../../utils/ajax'

class ChildISC {
    constructor(obj) {
        Object.assign(this, obj)
        const {floorIdArray} = this.thisVue.$store.state.project;
        if (this.pid) {
            floorIdArray.forEach((item, i) => {
                if (item === this.pid) {
                    floorIdArray.splice(i, 1);
                }
            })
        } else {
            this.analyFloorId();
        }
    }

    analyFloorId() {
        const {floorIdArray} = this.thisVue.$store.state.project;
        const yThreshold = 200, me = this;
        let markIdxArray = [];
        let markIdArray = [];

        new Promise(resolve => {
            for (let i = 0; i < floorIdArray.length; i++) {
                let item = document.getElementById(`item-post-${floorIdArray[i]}`)
                let rect = item.getBoundingClientRect()
                if (rect.top > -200 && rect.top < window.innerHeight + yThreshold) {
                    markIdxArray.push(i);
                    if (i === floorIdArray.length - 1) {
                        for (let l = markIdxArray.length - 1; l >= 0; l--) {
                            markIdArray.push(floorIdArray.splice(markIdxArray[l], 1)[0]);
                        }
                        resolve(markIdArray);
                    }
                } else if (rect.top > window.innerHeight + yThreshold) {
                    if (markIdxArray.length) {
                        for (let l = markIdxArray.length - 1; l >= 0; l--) {
                            markIdArray.push(floorIdArray.splice(markIdxArray[l], 1)[0]);
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
                ajaxID: '5aa7a6618776329315f6d14c',
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
        }, 50)
    }
}

class Listen {
    constructor(element, options) {
        const {callback, pid, thisVue} = options;
        this.wrapper = element
        this.changeState(new ChildISC({
            timer: 0,
            pid,
            thisVue,
            callback
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