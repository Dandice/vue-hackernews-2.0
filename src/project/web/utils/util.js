import ajax from "../../utils/ajax";

export const jsENV = (typeof window === 'undefined') ? 'node' : 'browser'

export const toAppointPoi = (pid, jumpId, thisVue) => {
    const getWrapEle = document.getElementById(`item-post-${pid}`);
    const getInnerEle = document.getElementById(jumpId);
    let targetTop;
    if (getInnerEle) {
        targetTop = getInnerEle.offsetTop > 620 ? getInnerEle.offsetTop - 80 : getInnerEle.offsetTop - 10;
    } else if (getWrapEle) {
        targetTop = getWrapEle.offsetTop > 620 ? getWrapEle.offsetTop - 80 : getWrapEle.offsetTop - 10;
    }

    const gotoAppoint = () => {
        document.body.scrollTop = targetTop;
        document.documentElement.scrollTop = targetTop;
    };

    if (getWrapEle || getInnerEle) {
        if (typeof pid === 'string' && pid.indexOf('hodometer') > -1) {
            gotoAppoint();
        } else {
            const list = thisVue.$store.state.project.listWrap.list;
            for (let i = 0; i < list.length; i++) {
                if (parseInt(list[i].id) === pid) {
                    if (!list[i].content) {
                        let tempPidArray = [pid];
                        const {floorIdArray} = thisVue.$store.state.project;
                        let oriItem = document.getElementById(`item-post-${pid}`);
                        let oriTop = oriItem && oriItem.getBoundingClientRect().top;
                        for (let i = floorIdArray.length - 1; i >= 0; i--) {
                            let temp = document.getElementById(`item-post-${floorIdArray[i]}`);
                            let top = temp && temp.getBoundingClientRect().top;
                            if (top - oriTop > 0 && top - oriTop < 800) {
                                tempPidArray.push(floorIdArray[i]);
                                floorIdArray.splice(i, 1);
                            } else if (top - oriTop < 0) {
                                break;
                            }
                        }
                        for (let i = 0; i < list.length; i++) {
                            let nIndex = tempPidArray.indexOf(list[i]);
                            if (nIndex > -1) {
                                if (i === 0 && list[i].content) {
                                    tempPidArray = [];
                                    gotoAppoint();
                                    break;
                                }

                                if (list[i].content) {
                                    tempPidArray.splice(nIndex, 1)
                                }
                            }
                        }

                        if (tempPidArray.length) {
                            thisVue.$store.commit('SET_VALUE', {
                                page: 'needToGet', data: {pid: tempPidArray, anchor: jumpId}
                            });
                        } else {
                            gotoAppoint();
                        }
                    } else {
                        gotoAppoint();
                    }
                }
            }
        }
    } else {
        //不在当前页面跳转

        const cpSpi = location.href.split('?')[0].split('-')
        if (typeof pid === 'string' && pid.indexOf('hodometer') > -1) {
            location.href = `${cpSpi[0]}-${cpSpi[1]}-1.html#post-hodometer-1`
        } else {
            ajax({
                url: '/qcross/bbs/post.php',
                data: {
                    action: 'getPostPage',
                    tid: window.BBS.TID,
                    pid
                }
            }).then(res => {
                if (!res.error_code) {
                    const page = res.data.page;
                    location.href = `${cpSpi[0]}-${cpSpi[1]}-${page}.html#${jumpId}`
                }
            });
        }
    }
}