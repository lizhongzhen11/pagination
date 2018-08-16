/**
 * @author lizz
 * @description 采用 面向委托 设计模式来编写，思想学自《你不知道的javascript》
 *              样式主要借鉴于 iview
 *              代码借鉴于 苏宁前端组所用的分页插件，不过该插件是用jq写的，采用原型继承思想
 *              我参照着用js+面向委托思想来试着写
 * 
 * @constant 注意：需要同时在页面上引入 pagination.css
 * 
 * @description 用法：pagination.init(
 *                      container, // 需要插入分页的 父节点
 *                     {
 *                          count: 48, // 结果总数，必须要给，否则分页无效
 *                          currentPage: 1, // 当前页，默认是第一页（可选）
 *                          pageSizeTypes: [10, 20, 30, 40, 50], // “每页多少条”select框的可选项，默认是这5个（可选）
 *                          callBack: null // 回调函数，默认跳转方法写在这里面（可选）
 *                      })
 */
;
(function (global) {
    /**
     * @description 默认配置
     */
    let defaults = {
        pageSize: 10, // 每页10条
        currentPage: 1, // 当前页码
        prev: '上一页',
        next: '下一页',
        ellipse: '...',
        pageSizeTypes: [10, 20, 30, 40, 50], // 可供选择的每页多少条
        pageTotal: 10, // 总页数，总页数 = Math.ceil(count/pageSize)
        callBack: null
    }
    
    /**
     * @description 用来设置分页功能，不想直接用 原型继承 方式
     * 你不知道的javascript里面讲了一种面向委托设计模式，
     * 这里试试 
     * 
     * @description 分页方法主体
     * @param {*} el Dom元素
     * @param {*} options 分页配置，用来覆盖默认配置
     */
    let methods = {
        /**
         * @description 初始化
         */
        init: function (el, options) {
            if (!el) {
                console.error('请传入需要插入分页的节点！')
                return
            }
            if (options && !checkObject(options)) {
                console.error('请传入分页配置对象！')
                return
            }
            this.pluginName = 'pagination'
            this.el = el
            this.options = options ? cover(options) : defaults
            this.render()
            this.bindEvent()
        },
        /**
         * @description 渲染方法
         */
        render: function () {
            let html = '<ul class="pagination-ul" id="pagination-ul">'
            let pageSizeOpts = ''
            let everyPage = ''
            if (hasProperty(this.options, 'count')) {
                html += `<li class="pagination-count-li">共 <span class="pagination-count">${this.options.count}</span> 条结果</li>`
                this.options.pageTotal = Math.ceil(this.options.count / this.options.pageSize)
            }
            for (let i = 0; i < this.options.pageTotal; i++) {
                if (this.options.currentPage === i + 1) {
                    everyPage += `<li class="pagination-ul-active">${i + 1}</li>`
                    continue
                }
                everyPage += `<li>${i + 1}</li>`
            }
            for (let i = 0; i < this.options.pageSizeTypes.length; i++) {
                // 比如当前 10页/每条，下拉框对应的 10 处于选中状态
                if (this.options.pageSize === this.options.pageSizeTypes[i]) {
                    pageSizeOpts += `<div class="pagination-select-div-selected">${this.options.pageSizeTypes[i]}</div>`
                    continue
                }
                
                pageSizeOpts += `<div>${this.options.pageSizeTypes[i]}</div>`
            }
            html += `<li class="pagination-prev">${this.options.prev}</li>${everyPage}`
            html += `<li class="pagination-prev">${this.options.next}</li>
                    <li class="pagination-pageSize">
                        <div>
                            <span>${this.options.pageSize}条/页</span>
                            <i class="icon iconfont icon-jiantouarrow483 pagination-icon"></i>
                        </div>
                        <div class="pagination-select pagination-hide pagination-hide-opacity">
                            ${pageSizeOpts}
                        </div>
                    </li>
                    </ul>`
            this.el.innerHTML = html
        },
        /**
         * @description 改变分页每页显示条数
         */
        changePageSize: function (e) {
            this.options.pageSize = Number(e.innerHTML)
            // 切换页码需要重新渲染，因为样式改变了，这点不大好，如果用vue来写的话就很爽了，但其实vue内部也做了一些处理
            // 代码量未必少
            this.render()
            // 切换每页条数后可能出现当前页码小于页码总数情况
            if (this.options.currentPage > this.options.pageTotal) {
                this.options.currentPage = this.options.pageTotal
                this.render()
            }
            this.bindEvent()
        },
        /**
         * @description 事件绑定
         *              包含 点击分页样式改变
         */
        bindEvent: function () {
            let paginationUl = document.getElementById('pagination-ul')
            let me = this
            me.disableButton(paginationUl.children)
            // 分页点击切换改变样式以及跳转
            paginationUl.addEventListener('click', function (e) {
                // console.log(e)
                // 避免点击总体的ul
                if (e.target.nodeName === 'UL') {
                    return
                }
                // 避免点击li内部的sapn,i
                // 排除第一个li即 共n条结果
                if ((e.target.nodeName === 'SPAN' && !e.target.nextElementSibling) || (e.target.nodeName === 'LI' && e.target.parentNode.children[0] === e.target)) {
                    return
                }
                // 点击切换select框时发生的样式改变
                if ((e.target.nodeName === 'SPAN'&& e.target.nextElementSibling) || e.target.nodeName === 'I' || 
                    (e.target === e.target.parentNode.children[0] && e.target.nodeName === 'DIV' && e.target.parentNode.classList.contains('pagination-pageSize'))) {
                    let paginationSelect = document.getElementsByClassName('pagination-select')[0]
                    let icon = document.getElementsByClassName('icon-jiantouarrow483')[0]
                    if (paginationSelect.classList.contains('pagination-hide')) {
                        icon.classList.add('pagination-icon-rotate')
                        paginationSelect.classList.remove('pagination-hide')
                        paginationSelect.classList.remove('pagination-animation-fadeout')
                        paginationSelect.classList.add('pagination-animation-fadein')
                    } else {
                        icon.classList.remove('pagination-icon-rotate')
                        paginationSelect.classList.remove('pagination-animation-fadein')
                        paginationSelect.classList.add('pagination-animation-fadeout')
                        setTimeout(() => {
                            paginationSelect.classList.add('pagination-hide')
                        }, 400);
                    }
                    return
                }
                // 内容为 ... 的 li, 点击时不用改样式
                if (e.target.innerHTML === '...') {
                    return
                }
                if (e.target.innerHTML === '上一页' || e.target.innerHTML === '下一页') {
                    me.changeCurrent(e.target)
                    return
                }
                // 切换每页条数
                if (e.target.classList.contains('pagination-select')) {
                    return
                }
                // 点击具体页码的跳转
                e.target.nodeName === 'DIV' ? me.jump() : me.jump(Number(e.target.innerHTML))
                let el = e.target.parentNode.children
                me.disableButton(el)
                me.changeActive(e.target)
            })
        },
        /**
         * @description 改变分页每个页码的是否被点击的样式
         * @param {*} e 当前被点击的节点
         */
        changeActive: function (e) {
            e.classList.add('pagination-ul-active')
            // 被选中节点如果改变了，那么先前的被选中节点取消选中状态和样式
            let brothers =  sibling(e)
            for (let i = 0; i < brothers.length; i++) {
                if (brothers[i].classList.contains('pagination-ul-active')) {
                    brothers[i].classList.remove('pagination-ul-active')
                }
            }
            // 这边是当点击 select 下拉框里面的 div(类似于option)时触发的pageSize改变
            // pageSize改变，那么pageTotal也会改变
            if (e.parentNode.classList.contains('pagination-select')) {
                this.changePageSize(e)
            }
        },
        /**
         * @description 分页跳转方法
         */
        jump: function (page) {
            this.options.currentPage = page || this.options.currentPage
            this.options.callBack && this.options.callBack(this.options.currentPage, this.options.pageSize, this.options.pageTotal)
        },
        /**
         * @description 设置 上一页 和 下一页 是否禁用
         * @param {*} el ul 下的所有 li
         */
        disableButton: function(el) {
            // 当前页既不是第一页也不是最后一页，那么上下页按妞不需要禁用
            if (this.options.currentPage !== 1 && this.options.currentPage !== this.options.pageTotal) {
                if (el[1].disabled) {
                    el[1].disabled = false
                    el[1].classList.remove('pagination-li-disabled')
                    return
                }
                if (el[el.length - 2].disabled) {
                    el[el.length - 2].disabled = false
                    el[el.length - 2].classList.remove('pagination-li-disabled')
                }
                return
            }
            // 当前页既是第一页也是最后一页，上/下页按妞禁用
            if (this.options.currentPage === 1 && this.options.currentPage === this.options.pageTotal) {
                el[1].disabled = true
                el[1].classList.add('pagination-li-disabled')
                el[el.length - 2].disabled = true
                el[el.length - 2].classList.add('pagination-li-disabled')
                return
            }
            // 到达第一页时禁用上一页按妞
            if (this.options.currentPage === 1) {
                el[1].disabled = true
                el[1].classList.add('pagination-li-disabled')
                if (el[el.length - 2].disabled) {
                    el[el.length - 2].disabled = false
                    el[el.length - 2].classList.remove('pagination-li-disabled')
                    return
                }
            }
            // 到达最后一页时禁用下一页按妞
            if (this.options.currentPage === this.options.pageTotal) {
                el[el.length - 2].disabled = true
                el[el.length - 2].classList.add('pagination-li-disabled')
                if (el[1].disabled) {
                    el[1].disabled = false
                    el[1].classList.remove('pagination-li-disabled')
                    return
                }
            }
        },
        /**
         * @description 点击上一页/下一页切换页码
         * @param {*} el 上一页或下一页节点
         */
        changeCurrent: function (el) {
            el.innerHTML === '上一页' && this.options.currentPage !== 1 ? this.options.currentPage -= 1 : ''
            el.innerHTML === '下一页' && this.options.currentPage !== this.options.pageTotal ? this.options.currentPage += 1 : ''
            this.jump()
            this.disableButton(el.parentNode.children)
            // 因为el是上一页/下一页节点，但是changeActive(e)需要的是当前被点击的节点
            this.changeActive(el.parentNode.children[this.options.currentPage + 1])
        },
    }
    /**
     * @description 分页主体；正常通过pagination.init()等方法进行调用
     */
    let pagination = Object.create(methods)

    /**
     *@description 用于检测是否是对象
     *
     */
    function checkObject (opts) {
        return Object.prototype.toString.call(opts) === '[object Object]'
    }
    /**
     * @description 该方法用来将传入的配置与默认配置进行合并
     *
     * @param {*} opts 传入的配置
     * @returns 用户需要的分页配置
     */
    function cover(opts) {
        let coverOpts = defaults
        for (let i in opts) {
            if (coverOpts.hasOwnProperty(i)) {
                coverOpts[i] = opts[i]
            }
        }
        if (hasProperty(opts, 'count')) {
            coverOpts.count = opts.count
        }
        return coverOpts
    }

    /**
     * @description 判断对象上有没有该属性，不向上查找原型链
     *
     * @param {*} obj
     * @param {*} property
     */
    function hasProperty(obj, property) {
        return obj.hasOwnProperty(property)
    }

    /**
     * jq sibling 方法源码
     * @param {*} elem 当前节点 
     */
    function sibling(elem) {
        let r = []
        let n = elem.parentNode.firstChild
        for (; n; n = n.nextSibling) {
            if (n.nodeType === 1 && n !== elem) {
                r.push(n)
            }
        }
        return r
    }
    global.pagination = pagination
})(window)
