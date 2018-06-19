const utils = {
    quadratic: {
        style: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    }
}

class ChildSLI {
    constructor(obj) {
        Object.assign(this, obj)
        if (this.staticData === undefined) {
            this.refresh()
            this.setTransitionTimingFunction()
        }
    }

    refresh() {
        const is = {}
        is.wrapper = this.element
        is.scroller = is.wrapper.children[0]
        is.wrapperWidth = is.wrapper.clientWidth
        is.wrapperHeight = is.wrapper.clientHeight
        is.maxOffsetWidth = is.wrapperWidth - is.scroller.clientWidth
        is.maxOffsetHeight = is.wrapperHeight - is.scroller.clientHeight
        if (is.maxOffsetWidth >= 0) is.maxOffsetWidth = -1
        if (is.maxOffsetHeight >= 0) is.maxOffsetHeight = -1
        is.scrollerStyle = is.scroller.style
        is.scrollerStyle[this.transform] = `translate(${0}px,${0}px) translateZ(0)`
        this.staticData = is
        this.scroller = is.scroller
    }

    touchStart(e) {
        let touch = e.touches[0]
        this.startY = this.y
        this.startX = this.x
        this.distX = 0
        this.distY = 0
        this.pointY = touch.pageY
        this.pointX = touch.pageX
        this.startTime = Date.now()
        this.directionLocked = null
        this.moved = null
    }

    touchMove(e) {
        let touch = e.touches[0]
        let pointY = touch.pageY
        let pointX = touch.pageX
        let deltaX = pointX - this.pointX
        let deltaY = pointY - this.pointY
        let moveTime = Date.now()
        let absDistX
        let absDistY
        let newY = this.y + deltaY
        let newX = this.x + deltaX
        this.distX += deltaX
        this.distY += deltaY
        absDistX = Math.abs(this.distX)
        absDistY = Math.abs(this.distY)

        if (moveTime - this.endTime > 300 && (absDistX < 10 && absDistY < 10)) {
            return
        }
        newY = 0
        if ((this.cliIndex === 0 && this.distX > 0) || this.cliIndex === this.imgLen - 1 && this.distX < 0) {
            newX = this.x + deltaX / 4
        }
        e.preventDefault()
        this.moved = true
        this.pointY = pointY
        this.pointX = pointX
        this.to(newX, newY)
        if (moveTime > (this.startTime + 200)) {
            this.startTime = moveTime
            this.startX = this.x
            this.startY = this.y
        }
    }

    touchEnd() {
        let duration = Date.now() - this.startTime
        if (this.distX > 0 && this.cliIndex === 0) {
            this.to(0, 0, 300)
        } else if (this.distX < 0 && this.cliIndex === (this.imgLen - 1)) {
            this.to(-this.nIndex * this.screenWid, 0, 300)
        } else if (duration < 300) {
            if (Math.abs(this.distX) > parseInt(this.screenWid / 10)) {
                this.nIndex = this.distX > 0 ? this.nIndex - 1 : this.nIndex + 1
                this.cliIndex = this.distX > 0 ? this.cliIndex - 1 : this.cliIndex + 1
                this.to(-this.nIndex * this.screenWid, 0, 300)
            } else {
                this.to(-this.nIndex * this.screenWid, 0, 300)
            }
        } else {
            if (Math.abs(this.distX) > parseInt(this.screenWid / 2)) {
                this.nIndex = this.distX > 0 ? this.nIndex - 1 : this.nIndex + 1
                this.cliIndex = this.distX > 0 ? this.cliIndex - 1 : this.cliIndex + 1
                this.to(-this.nIndex * this.screenWid, 0, 300)
            } else {
                this.to(-this.nIndex * this.screenWid, 0, 300)
            }
        }
    }

    to(x, y, time) {
        if (x !== this.x || y !== this.y) {
            this.x = x
            this.y = y

            this.setTransitionTime(time)
            this.staticData.scrollerStyle[this.transform] = `translate(${x}px,${y}px) translateZ(0)`
        }
    }

    resetPosition() {
        // 换图
        if (this.cliIndex > 0 && this.cliIndex < this.imgLen - 1) {
            if (this.nIndex === 0 || this.nIndex === this.preLen - 1) {
                // 换图
                this.callback('edge', this.cliIndex)
            }
        }
        this.callback('pageNum', this.cliIndex)
    }

    setTransitionTime(time = 0) {
        this.staticData.scrollerStyle[this.transitionDuration] = time + 'ms'
    }

    setTransitionTimingFunction() {
        this.staticData.scrollerStyle[this.transitionTimingFunction] = utils.quadratic.style
    }
}

class IScroll {
    constructor(element, options) {
        this.wrapper = element
        this.changeState(new ChildSLI({
            element: this.wrapper,
            _scrollIns: this,
            nIndex: options.nIndex,
            screenWid: options.screenWid,
            imgLen: options.imgLen,
            x: 0,
            y: 0,
            scrollTop: 0,
            preLen: options.preLen,
            cliIndex: options.cliIndex,
            callback: options.callback,
            transform: this.getPrefix(element, 'transform'),
            transitionDuration: this.getPrefix(element, 'transitionDuration'),
            transitionTimingFunction: this.getPrefix(element, 'transitionTimingFunction'),
            options: Object.assign({
                bounceTime: 300,
                direction: 'x',
                bounce: true,
                drag: false,
                timeout: 2000
            }, options || {})
        }))

        this.bindEvents(options)
    }

    getPrefix(element, style) {
        const preFixArr = ['webkit', 'Moz', 'ms', 'O']
        let elementStyleCol = element.style
        if (style in elementStyleCol) {
            return style
        }
        for (let i = 0; i < preFixArr.length; i++) {
            let styleName = preFixArr[i] + style.replace(/[a-z]/, match => match.toUpperCase())
            if (styleName in elementStyleCol) return styleName
        }
        return null
    }

    changeState(newState) {
        this._state = newState
        this._state.to(-newState.nIndex * newState.screenWid, 0, 0)
    }

    dispatch(method) {
        return (e) => {
            this._state[method](e)
        }
    }

    bindEvents() {
        this.wrapper.addEventListener('touchstart', this.dispatch('touchStart'))
        this.wrapper.addEventListener('touchmove', this.dispatch('touchMove'))
        this.wrapper.addEventListener('touchend', this.dispatch('touchEnd'))
        this.wrapper.addEventListener('touchcancel', this.dispatch('touchEnd'))
        this.wrapper.addEventListener('transitionend', this.dispatch('resetPosition'))
        this.wrapper.addEventListener('webkitTransitionEnd', this.dispatch('resetPosition'))
    }
}

export default IScroll
