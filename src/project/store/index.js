export default {
    state: {
        picPreview: false,
        replyInfo: {
            isReply: false,
            pid: null,
            replyWho: '楼主'
        },
        topBar: {
            haveOther: true,
            picStyle: true
        },
        editInfo: {
            pid: null
        },
        fixedBar: false,
        showMask: false,
        opeUnFold: false,
        getRec: false,
        renderData: null,
        home: {
            past_try: {}
        },
        recommend: [],
        listWrap: {
            list: [],
            state: false
        },
        userInfo: {},
        together: null,
        counter: {},
        needToGet: {},
    },
    actions: {},
    mutations: {
        SET_VALUE: (state, options) => {
            let {page, attr, data} = options;
            if (attr) {
                state[page][attr] = data
            } else {
                state[page] = data
            }
            if (page === 'listWrap') {
                state[page].state = !state[page].state;
            }
        },
        SET_CON_VALUE: (state, options) => {
            const {data, markArray} = options;
            if (data && data.msg) {
                markArray.forEach(key => {
                    state.listWrap.list.forEach(item => {
                        if (item.id == key) {
                            item.loadError = true;
                        }
                    })
                });
            } else {
                for (let i in data) {
                    state.listWrap.list.forEach(item => {
                        if (item.id === i) {
                            item.loadError = false;
                            item.content = data[i].content;
                        }
                    })
                }
            }
            state.listWrap.state = !state.listWrap.state;
        }
    }
}
