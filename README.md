## Tabjs是什么
Tabjs是用于快速构建tab功能的JS组件，与其他tab组件不同的是Tabjs可以将页面HTML片段、远程HTML片段及其他页面动态渲染到tab容器中。Tabjs不依赖第三方库，体积小、速度快，不仅易于上手、更易于与前端框架结合。Tabjs追求功能上的极致，提供了最为简单的页面样式，开发者需要自行覆盖CSS样式创建个性化的tab效果。

## Tabjs引入
- tabjs.js 文件
- tabjs.css 文件

``` css
<link rel="stylesheet" type="text/css" href="tabjs/tabjs.css">
```
``` javascript
<script type="text/javascript" src="tabjs/tabjs.js"></script>
```

## Tabjs教程
[实例教程](https://fuzhanlun.github.io/tabjs/docs/)

## Tabjs初始化
``` javascript
var tabjs = new Tabjs({......})
```

### 配置参数

|参数|说明|属性|
|--|--|--|
|tid|tab容器id|必选|
|offIcon|关闭按钮字符，默认为×|可选|
|showTitle|是否显示tab标签，默认为true|可选|
|beforeAct|激活前运行方法|可选|

## Tabjs方法

|方法|说明|属性|
|--|--|--|
|open(src, title, off)|src:请求地址 title:选项卡标题 off:true或false,选项卡能否关闭|实例方法|
|bind(el)|el:需要绑定的超链接对象，为空的话则绑定页面所有超链接对象。|实例方法|
|find(tid)|tid:tab容器id|静态方法|