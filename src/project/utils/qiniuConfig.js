import ajax from './ajax'
let old_key_dict = {},
    info_by_file = function (file) {
        let info = old_key_dict[file.id] || {}
        return info
    }

export default {
    qiniu: (_this, btnId, uptoken, apiUrl, callback) => {
        let uploader = Qiniu.uploader({
            runtimes: 'html5,flash,html4',
            browse_button: btnId,
            uptoken: uptoken,
            unique_names: false,
            domain: '//pic.qyer.com',
            max_file_size: '5mb',
            flash_swf_url: './Moxie.swf',
            filters: {
                mime_types: [{title: 'Image files', extensions: 'jpg,gif,png,jpeg'}]
            },
            max_retries: 3, // 上传失败最大重试次数
            x_vars: {
                photo_id: function (up, file) {
                    return info_by_file(file)['id']
                },
                credit_jy: function (up, file) {
                    return (info_by_file(file)['credit'] || {}).credit_jy || 0
                },
                credit_qb: function (up, file) {
                    return (info_by_file(file)['credit'] || {}).credit_qb || 0
                },
                style: function (up, file) {
                    return ''
                }
            },
            chunk_size: '4mb',
            auto_start: false,
            init: {
                'BeforeUpload': function (up, file) {
                },
                'FilesAdded': function (up, files) {
                    ajax({
                        url: apiUrl,
                        method: 'GET',
                        data: {
                            action: 'getUploadPhotoId',
                            count: files.length,
                            album_id: 0
                        }
                    }).then(msg => {
                        if (msg.result === 'ok') {
                            const da = msg.data
                            for (let i = files.length; i--;) {
                                old_key_dict[files[i].id] = da[i]
                                files[i].key = da[i].key
                                files[i].photo_id = da[i].id
                            }
                            up.start()
                        }
                    })
                },
                'UploadProgress': function (up, file) {
                },
                'FileUploaded': function (up, file, info) {
                    const msg = JSON.parse(info)
                    if (msg.result === 'ok') {
                        callback(msg.data.photo.url, msg.data.photo.id)
                    }
                },
                'Error': function (up, err, errTip) {
                },
                'UploadComplete': function () {
                },
                'Key': function (up, file) {
                    return file.key
                }
            }
        })
    }
}
