## 原生js + 面向委托设计思想编写的分页插件

### 演示：
![image](https://github.com/lizhongzhen11/pagination/blob/master/GIF.gif)

### 说明

样式参考自 **iview**，代码命名参考自苏宁内部分页插件。<br>
由于项目组技术栈略微老旧，采用的是 jq + fis3 + nginx 开发部署，刚去公司暂时没活不能闲着，想锻炼自己，同时也是由于前两天看了《你不知道的javascript》，知道了 **面向委托** 设计思路，觉得很有趣，便自己琢磨开发了下。<br>

### 用法
1. 引入 **pagination.js** 和 **pagination.css**
2. 取到需要插入分页的父元素
3. 然后(js里面有注释)：
```js
pagination.init(
    container, // 需要插入分页的 父节点
    {
        count: 48, // 结果总数，必须要给，否则分页无效
        currentPage: 1, // 当前页，默认是第一页（可选）
        pageSizeTypes: [10, 20, 30, 40, 50], // “每页多少条”select框的可选项，默认是这5个（可选）
        callBack: null // 回调函数，默认跳转方法写在这里面（可选）
    })
```