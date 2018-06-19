<template>
    <ul class="qui-pager" v-show="pageCount > 1" :class="[skin == 2 ? 'qui-pager-skin2' : '']">
        <template v-if="currentPage != 1">
            <li class="qui-pager-item" @click="selectPage(currentPage-1)">
                <a :href="getHref(currentPage-1)">
                    <template>
                        {{preTxt}}
                    </template>
                </a>
            </li>
            <li class="qui-pager-item" @click="selectPage(1)" v-show="currentPage>3&&pageCount >5"
                v-if="isHasFirtLast">
                <a :href="getHref(1)">1...</a>
            </li>
        </template>
        <li class="qui-pager-item"
            v-if="skin == 1 && p>=startPage && p<=(startPage+maxPager)"
            v-for="(p,index) in pageCount"
            :class="{'qui-pager-item-active': p==currentPage}"
            @click="selectPage(p)"
        >
            <a :href="getHref(p)">{{p}}</a>
        </li>

        <li class="qui-pager-item"
            v-if="skin == 2"
            v-for="(p,index) in pageVisible"
            :class="{'qui-pager-item-active':p==currentPage}"
            @click="selectPage(p)"
        >
            <a :href="getHref(String(p).replace('...', ''))">{{p}}</a>
        </li>

        <template v-if="currentPage<pageCount">
            <li class="qui-pager-item"
                v-if="isHasFirtLast"
                v-show="pageCount-currentPage>2 &&pageCount>5"
                @click="selectPage(pageCount)">
                <a :href="getHref(pageCount)">...{{pageCount}}</a>
            </li>
            <li class="qui-pager-item" @click="selectPage(currentPage+1)">
                <a :href="getHref(currentPage+1)">
                    <template>
                        {{nextTxt}}
                    </template>
                </a>
            </li>
        </template>
    </ul>
</template>
<script>
    export default {
        props: {
            total: {
                type: Number
            },
            currentPage: {
                type: Number
            },
            pageSize: {
                type: Number
            },
            maxPager: {
                type: Number,
                default: 10
            },
            tpl: {
                type: String,
                default: 'javascript:;'
            },
            isHasFirtLast: {
                type: Boolean,
                default: true
            },
            preTxt: {
                type: String,
                default: '«'
            },
            nextTxt: {
                type: String,
                default: '»'
            },
            skin: {
                type: Number,
                default: 1
            }
        },

        computed: {
            pageCount() {
                if (this.total % this.pageSize) {
                    return Math.floor(this.total / this.pageSize) + 1
                } else {
                    return this.total / this.pageSize
                }
            },
            startPage() {
                var p = this.currentPage - ((this.maxPager / 2) | 0)
                p = Math.max(p, 1)
                return Math.min(p, this.pageCount - this.maxPager)
            },
            pageVisible() {
                // 根据当前页和总页数，计算需要显示的页面范围
                if (this.pageCount <= this.maxPager) {
                    return Array.apply(Array, Array(this.pageCount)).map((v, k) => k + 1)
                }
                if (this.currentPage <= this.maxPager - 2) {
                    return this.getRightArr(0, this.maxPager).concat('...' + this.pageCount)
                }
                if (this.currentPage <= this.pageCount && this.currentPage >= Math.floor(this.pageCount - ((this.maxPager - 1) / 2))) {
                    return ['1...'].concat(this.getLeftArr(this.pageCount + 1, this.maxPager))
                }
                if (this.currentPage > 0 && this.currentPage <= this.pageCount) {
                    let numLeft = Math.floor((this.maxPager - 1) / 2)
                    let numRight = this.maxPager - numLeft - 1
                    return ['1...'].concat(this.getLeftArr(this.currentPage, numLeft)).concat(this.currentPage).concat(this.getRightArr(this.currentPage, numRight)).concat('...' + this.pageCount)
                }
            }
        },
        methods: {
            selectPage(pageNUmber) {
                if (typeof pageNUmber === 'string') {
                    pageNUmber = Number(pageNUmber.replace('...', ''))
                }
                if (pageNUmber !== this.currentPage) {
                    this.$emit('change', pageNUmber)
                }
            },
            getHref(pageNUmber) {
                return this.tpl.replace(/{pageNumber}/gi, pageNUmber)
            },
            /*
              以middle为基准，返回小于基准的num位连续数组，不包括middle
              @return [middle - num, middle - num + 1 ...middle -1]
            */
            getLeftArr(middle, num) {
                let arr = []
                for (var i = num; i > 0; i--) {
                    arr.push(middle - i)
                }
                return arr
            },
            /*
              以middle为基准，返回大于基准的num位连续数组，不包括middle
              @return [middle+1, middle+2, ...middle+num]
             */
            getRightArr(middle, num) {
                let arr = []
                for (var i = 1; i <= num; i++) {
                    arr.push(middle + i)
                }
                return arr
            }
        }
    }
</script>
<style lang="stylus">
    .qui-pager {
        margin: 0;
        padding: 0;
        display: inline-block;
        vertical-align: middle;
        margin-left: 10px;
        .qui-pager-item {
            display: inline-block;
            padding: 0 6px;
            vertical-align: middle;
            font-size: 14px;
            line-height: 24px;
            margin-left: 3px;
            a {
                color: rgb(99, 99, 99);
                text-decoration: none;
                cursor: pointer;
            }
            &:hover {
                background: rgb(224, 241, 225);
                border-radius: 3px;
                text-decoration: none;
                a {
                    color: rgb(50, 50, 50);
                }
            }
            &.qui-pager-item-active {
                background: rgb(94, 166, 124);
                border-radius: 3px;
                font-weight: 700;
                a {
                    color: rgb(255, 255, 255);
                }
            }
        }
    }

    .qui-pager-skin2 {
        .qui-pager-item {
            padding: 12px;
            border-radius: 0;
            font-size: 10px;
            line-height: 10px;
            margin-left: 0;
            a {
                color: #28B76C;
            }
            &:hover {
                background: #ECF9F2;
                a {
                    color: #28B76C;
                }
            }
            &.qui-pager-item-active {
                background: #28B76C;
                border-radius: 0;
                a {
                    color: rgb(255, 255, 255);
                }
            }
        }
    }
</style>
