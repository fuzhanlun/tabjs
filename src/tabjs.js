/*
 * Tabjs (v1.0.0)
 * Copyright: 2019
 * Author: fuzhanlun
 * License: MIT
 */
'use strict';

(function(exports) {
	function F(parm) {
		const CLICK = (typeof window.ontouchend == 'undefined')? 'click' : 'touchend';
		var tab = null, //Tab容器对象
			head = null, //Tab标题组
			page = null, //Tab内容组
			sign = [], //Tab标记集合
			curid = 0, //保存索引值
			incre = 0, //自增ID值
			exp1 = new RegExp('[^<]+'), //提取标题内容
			exp2 = new RegExp('<script>([\\s\\S]+?)</script>', 'ig'); //提取模板脚本内容

		//默认设置
		var option = {
			'tid': '', //Tab容器id
			'offIcon': '×', //关闭按钮字符
			'showTitle': true, //标题显示状态
			'beforeAct': function() {} //页面激活前触发
		};

		if (typeof parm == 'string') option.tid = parm;
		if (typeof parm == 'object') {
			//覆盖默认设置
			for (var k in parm) {
				if (typeof option[k] != 'undefined') option[k] = parm[k];
			}
		}

		tab = document.getElementById(option.tid);
		if (tab == null) return false;
		if (tab.innerHTML == '') {
			tab.innerHTML = '<ul class="tabjs-title"></ul><div class="tabjs-content"></div>';
		}
		head = tab.getElementsByTagName('UL')[0];
		page = tab.getElementsByTagName('DIV')[0];

		// 进行初始化
		if (option.showTitle == false) head.style.display = 'none';
		for (var i = 0; i < head.childNodes.length; i++) {
			if (head.childNodes[i].nodeType != 1) continue;
			//渲染标题部分
			if (head.childNodes[i].getAttribute('tabjs-canoff') == 'yes') {
				head.childNodes[i].innerHTML += '<i class="tabjs-title-close">'+option.offIcon+'</i>';
			}
			//渲染主体部分
			if (head.childNodes[i].className == 'tabjs-title-active') {
				page.childNodes[i].className = 'tabjs-content-show';
			} else {
				page.childNodes[i].className = 'tabjs-content-hide';
			}
			//保存标题内容
			sign.push(exp1.exec(head.childNodes[i].innerHTML)[0]);
		}
	
		// 查找Tab 返回索引值
		function seek(val) {
			for (var i = 0; i < sign.length; i++) {
				if (sign[i] == val) return i;
			}
			return -1;
		}
	
		// 查找同级节点 返回索引值
		function index(el) {
			var pre = el.previousSibling;
			var result = 0;
	
			if (pre != null) {
				if (pre.nodeType == 1) curid++;
				return index(pre);
			}
			result = curid;
			curid = 0; //重置索引ID
			return result;
		}
	
		// 发送ajax请求
		function ajax(opt) {
			var data = null;
			var xhr = window.XMLHttpRequest ? new window.XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
	
			if (typeof opt.url == 'undefined') return;
			//设置默认值
			if (typeof opt.type == 'undefined') opt.type = 'get';
			if (typeof opt.data == 'undefined') opt.data = '';
			if (typeof opt.async == 'undefined') opt.async = true;
			if (typeof opt.success == 'undefined') opt.success = function(){};
	
			//解析data成字符串
			if (typeof opt.data == 'object') {
				var arr = [];
				for (var k in opt.data) arr.push(k+'='+encodeURIComponent(data[k]));
				data = arr.join('&');
			}
	
			//处理GET请求
			if (opt.type.toLowerCase() == 'get') {
				xhr.open('GET', data? opt.url+'&'+data: opt.url, opt.async);
				data = null;
			}
	
			//处理POST请求
			if (opt.type.toLowerCase() == 'post') {
				xhr.open('POST', opt.url, opt.async);
				if (typeof opt.data == 'string' || typeof opt.data == 'number') data = opt.data;
			}

			//监听请求状态
			xhr.onreadystatechange = function() {
				if (xhr.readyState == 4) {
					opt.success(xhr.responseText, xhr.status);
					xhr = null;
				}
			};

			xhr.send(data);
		};

		// 绑定事件
		function attach(obj, type, fn) {
			if (typeof obj == 'string') obj = document.getElementById(obj);

			if (obj.attachEvent) obj.attachEvent('on' + type, fn); //兼容IE浏览器
			else obj.addEventListener(type, fn, false);
		}

		// 激活Tab
		function act(index) {
			var id = parseInt(index);

			option.beforeAct(id, sign[id]);
			for (var i = 0, j = 0; i < head.childNodes.length; i++) {
				if (head.childNodes[i].nodeType != 1) continue;
				if (j++ == id) {
					//显示激活的页面
					head.childNodes[i].className = 'tabjs-title-active';
					page.childNodes[i].className = 'tabjs-content-show';
					continue;
				}
				if (head.childNodes[i].className == 'tabjs-title-active') {
					//隐藏非活动页面
					head.childNodes[i].className = 'tabjs-title-normal';
					page.childNodes[i].className = 'tabjs-content-hide';
				}
			}
		}
	
		// 添加Tab页面
		function add(src, title, content, off) {
			var result = null;
			var id = seek(title);
	
			if (id == -1) {
				var el = document.createElement('li');
				id = sign.push(title) - 1; //变成索引值
				//添加Tab标题
				el.className = 'tabjs-title-normal';
				el.innerHTML = off? title+'<i class="tabjs-title-close">'+option.offIcon+'</i>': title;
				head.appendChild(el);
	
				content = content.replace(/__/g, incre++); //替换__ 防止ID重复
				result = exp2.exec(content); //保存匹配结果
	
				//添加Tab内容
				el = document.createElement('div');
				el.className = 'tabjs-content-hide';
				el.innerHTML = content.replace(exp2, ''); //去掉script标签
				page.appendChild(el);
	
				//处理script脚本 自动调用main函数
				if (result) (new Function('$title', '$href', result[1] + ';main();'))(title, src);
			}
			return id;
		}
	
		// 删除Tab页面
		function del(index) {
			var id = parseInt(index);
	
			for (var i = 0, j = 0; i < head.childNodes.length; i++) {
				if (head.childNodes[i].nodeType != 1) continue;
				if (j++ == id) {
					//删除Tab标题和内容
					head.removeChild(head.childNodes[i]);
					page.removeChild(page.childNodes[i]);
					sign.splice(index, 1);
					break;
				}
			}
			act(0); //激活第一个Tab页面
		};
	
		// 打开Tab页面
		function open(src, title, off) {
			var index = seek(title);
			//找到Tab页面并激活
			if (index != -1) return act(index);
			//默认可以关闭Tab
			if (typeof off == 'undefined') off = true;

			if (/^#tpl:(\S+)$/.test(src)) {
				var el = document.getElementById(RegExp.$1);
				//使用textarea 作为模板标签
				if (el != null) return act(add(src, title, el.value, off));
			}
	
			if (/^#url:(\S+)$/.test(src)) {
				var height = page.offsetHeight;
				var html = '<iframe src="'+ RegExp.$1 +'" class="tabjs-content-iframe" width="100%" height="'+ height +'"></iframe>';
				return act(add(src, title, html, off));
			}
	
			if (/^#get:(\S+)$/.test(src)) {
				ajax({
					'url': RegExp.$1,
					'type': 'get',
					'success': function(html, status) {
						if (status == 200 || status == 304) {
							return act(add(src, title, html, off));
						} else {
							return;
						}
					}
				});
			}
		}

		// Tab标题点击
		function titleClick(event) {
			var e = event || window.event;
			var o = e.srcElement? e.srcElement: e.target;
	
			if (o.nodeName == 'LI' && o.className == 'tabjs-title-normal') act(index(o));
			if (o.nodeName == 'I' && o.className == 'tabjs-title-close') del(index(o.parentNode));
			e.preventDefault();
		}

		function bind(el) {
			if (typeof el == 'object') {
				attach(el, CLICK, function(event) {
					var e = event || window.event;
					var o = e.srcElement? e.srcElement: e.target;

					if (o.parentNode.nodeName == 'A') o = o.parentNode;
					if (o.nodeName == 'A' && o.getAttribute('tabjs-open') == option.el) {
						var off = o.getAttribute('tabjs-canoff') == 'yes'? true: false;
						
						open(o.getAttribute('href'), o.getAttribute('title') || o.innerHTML, off);
						e.preventDefault();
					}
				});
			} else {
				var nodes = document.getElementsByTagName('A');

				for (var i = 0; i < nodes.length; i++) {
					if (nodes[i].getAttribute('tabjs-open') == option.tid) {
						attach(nodes[i], CLICK, function(event){
							var e = event || window.event;
							var o = e.srcElement? e.srcElement: e.target;
							if (o.parentNode.nodeName == 'A') o = o.parentNode;
							var off = o.getAttribute('tabjs-canoff') == 'yes'? true: false;

							open(o.getAttribute('href'), o.getAttribute('title') || o.innerHTML, off);
							e.preventDefault();
						});
					}
				}
			}
		}

		// 绑定Tab标题点击事件
		attach(head, CLICK, titleClick);

		this.open = open;
		this.bind = bind;
		
		F.obj[option.tid] = this;
	}

	// 定义静态变量和方法
	F.obj = {};

	F.find = function(tid) {
		return F.obj[tid];
	};

	// 导出对象
	exports.Tabjs = F;
})(window);