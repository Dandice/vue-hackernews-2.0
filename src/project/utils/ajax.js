function send(url, options) {
    return new Promise((resolve, reject) => {
        const {body, headers, type, method, data} = options
        let xhr
        if (window.XMLHttpRequest) {
            xhr = new window.XMLHttpRequest()
        } else if (window.ActiveXObject) {
            xhr = new window.ActiveXObject('Microsoft.XMLHTTP')
        }
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
                    let data = xhr.responseText
                    if (type == 'json') {
                        let json
                        try {
                            json = JSON.parse(data)
                        } catch (e) {
                            console.error('JSON decode error', url)
                            reject(data)
                        }
                        resolve(json)
                    } else {
                        reject(data)
                    }
                } else {
                    if (url.indexOf('/content') > -1) {
                        let data = {error_code: 110, data: {msg: 'error'}}
                        resolve(data);
                    } else {
                        let error = xhr.responseText
                        reject(error)
                    }

                }
            }
        }
        xhr.open(method, url, true)
        for (let name in headers) {
            if (headers.hasOwnProperty(name)) {
                xhr.setRequestHeader(name, headers[name])
            }
        }
        xhr.send(body)
    })
}

const params = (params, encode) => {
    if (!params) return ''
    let temp = []
    for (let key in params) {
        if (params.hasOwnProperty(key)) {
            temp.push(key + '=' + (encode ? encodeURIComponent(params[key]) : params[key]))
        }
    }
    return temp.join('&')
}
const errorHandle = (p, useErcode) => {
    return p.then(json => {
        if (useErcode) {
            return json
        } else if (json.error_code == 0) {
            return json.data
        } else {
            throw json
        }
    })
}

const selfFetch = (options) => {
    const {method = 'GET', data, type = 'json', encode = true, useErcode = true} = options
    let {url} = options
    let headers = {
        'Accept': '*/*',
        'X-Requested-With': 'XMLHttpRequest'
    }
    switch (method) {
        case 'GET':
            if (url[url.length - 1] == '?') {
                url = url + params(data, encode)
            } else {
                url = url + '?' + params(data, encode)
            }
            break
        case 'POST':
            headers = {
                ...headers,
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            }
            break
        default:
    }
    const ops = {
        method,
        headers,
        type,
        data
    }
    if (method !== 'GET') {
        ops.body = params(data, encode)
    }
    return errorHandle(send(url, ops), useErcode)
}

export default selfFetch
