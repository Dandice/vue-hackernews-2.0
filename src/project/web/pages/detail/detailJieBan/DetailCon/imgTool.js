export const imgTool = {
    linkDestination: {
        url: "/qcross/pictrip/detail.php?action=editPhotoPlace",
        successMSG: "关联目的地成功",
        errorMSG: "关联目的地失败",
        dom: '<a class="item _link" href="javascript:void(0)">关联目的地</a><span class="separate"></span>'
    },
    setCoverphoto: {
        url: "/qcross/bbs/thread.php?action=editAdminCover",
        successMSG: "设置封图成功",
        errorMSG: "设置封图失败",
        dom: '<a class="item _set" href="javascript:void(0)">设为封图</a><span class="separate"></span>'
    },
    likePhoto: {
        url: "/qcross/pictrip/detail.php?action=like",
        successMSG: "喜欢成功",
        errorMSG: "喜欢失败",
        dom: '<a class="item like _like" href="javascript:void(0)" data-bn-ipg="bbs-thread-pic-like">&nbsp;</a><span class="separate"></span>'
    },
    //查看大图，其中的id是图片的id
    seeLarge: {
        dom: '<a class="item seeLarge _see" target="_blank" data-bn-ipg="bbs-thread-pic-raw">&nbsp;</a><span class="separate"></span>'
    }
}