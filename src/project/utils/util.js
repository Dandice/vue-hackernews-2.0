// 是否微信 微博 QQ
export const _Platform = (ua) => {
    const _isQQ = (/QQ/i).test(ua)
    const _isWeChat = (/micromessenger/i).test(ua)
    const _isWeibo = (/weibo/i).test(ua)
    return _isQQ || _isWeChat || _isWeibo
}

export const _IsIOS = (ua) => {
    return ua.match(/iphone|ipad|ipod/i)
}

// 跳转逻辑
export const _ChaPage = (page, authorid) => {
    let cpLoa = location.href.split('#')[0].split('?')
    let cpSpi = cpLoa[0].split('-')
    let url = `${cpSpi[0]}-${cpSpi[1]}-${cpSpi[2].replace(/[\d]+/, page)}`
    if (cpSpi[2]) {
        if (authorid) {
            location.href = authorid === 'all' ? url : `${url}?authorid=${authorid}`
        } else if (cpLoa[1]) {
            location.href = `${url}?${cpLoa[1]}`
        } else {
            location.href = url
        }
    }
}

// 获取url参数
export const _getQueryString = (name) => {
    let reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i')
    let result = window.location.search.substr(1).match(reg)
    if (result != null) return unescape(result[2])
    return null
}

export const _getCkVal = (name) => {
    const strCookie = document.cookie
    const arrCookie = strCookie.split(';')
    for (let i = 0; i < arrCookie.length; i++) {
        const c = arrCookie[i].split('=')
        if (c[0].indexOf(name) > -1) {
            return c[1].split(',')
        }
    }
    return []
}

export const _calTime = (st, type) => {
    if (JSON.stringify(st).length === 10) {
        st = parseInt(st) * 1000
    }
    let date = new Date(parseInt(st))
    let year = date.getFullYear()
    let month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1)
    let day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate()
    let hour = date.getHours() < 10 ? '0' + date.getHours() : date.getHours()
    let min = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()
    let sec = date.getSeconds()
    switch (type) {
        case 1:
            return `${year}-${month}-${day} ${hour}:${min}`  // 2013年12月29日 13:42
        case 2:
            return `${year}-${month}-${day}`  // 2013-12-29
    }
}

export const loadQiNiu = (url) => {
    return new Promise((resolve) => {
        let domScript = document.createElement('script')
        domScript.src = url
        domScript.onload = domScript.onreadystatechange = () => {
            if (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete') {
                resolve()
            }
        }
        document.getElementsByTagName('head')[0].appendChild(domScript)
    })
}

export function loadGA() {
    setTimeout(() => loadQiNiu('//common1.qyerstatic.com/qyer_ui_frame/js/base_beacon_ga.js'), 100)
};

export const openApp = (artId, page) => {
    //const url = `https://dpl.qyer.com/app/guide?act=bbsDetail&id=${artId}&auto=1`
    const url = `https://dpl.qyer.com/app/guide/applinks.html?@=bbs%2fdetail%2f%3fid%3d${artId}%26page%3d${page ? page : 1}`
    location.href = url
}

export const jsENV = (typeof window === 'undefined') ? 'node' : 'browser'

export const toLogin = () => {
    location.href = `http://m.qyer.com/passport/login?ref=${encodeURIComponent(location.href)}`
}

/**
 * 动态加载一个 css 文件，返回 promise
 */
export function cssLoader(url) {
    let doc = document;
    let link = doc.createElement("link");
    link.setAttribute("rel", "stylesheet");
    link.setAttribute("type", "text/css");
    link.setAttribute("href", url);

    let heads = doc.getElementsByTagName("head");
    if (heads.length) {
        heads[0].appendChild(link);
    } else {
        doc.documentElement.appendChild(link);
    }
}

/*
export const toPcLogin = () => {
    location.href = `http://passport.qyer.com/login?ref=${encodeURIComponent(location.href)}`
}*/
