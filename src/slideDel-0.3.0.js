;(function(win){
  /**
   * 元素选择器
   */
  var $g = function(string) {
    if (string[0] == '.') {
      return document.querySelectorAll(string);
    }else {
      return document.getElementById(string.replace('#', ''));
    };
  },
  /**
   * 返回指定元素的符合要求的父级
   * 类似于closest()
   * attribut{
   *   class: .abc,
   *   id: #abc,
   *   tag: li,
   * }
   */
  $gp = function(el, attribute) {
    var type = 't';
    if(attribute[0] == '.') type = 'c';
    if(attribute[0] == '#') type = 'i';
    var $child = el;
    var $parent = '';
    function lp() {
      $parent = $child.parentNode;
      if ($parent.tagName == 'HTML') return $parent = undefined;
      $child = $parent;
      if (type == 'c' && $parent.classList.contains(attribute.replace('.', ''))) {
        return $parent;
      }else if(type == 'i' && $parent.id == attribute.replace('#', '')){
        return $parent;
      }else if(type == 't' && $parent.tagName == attribute){
        return $parent;
      }else {
        lp();
      };
    };
    lp();
    return $parent;
  },
  /**
   * 返回指定元素的最终样式
   */
  $gs = function(obj, attribute){
    return obj.currentStyle?obj.currentStyle[attribute]:document.defaultView.getComputedStyle(obj,false)[attribute];
  },
  /**
   * 创建dom元素
   */
  $c = function(el) {
    return document.createElement(el);
  },
  /**
   * 向dom添加元素
   */
  $ad = function(el, child) {
    return el.appendChild(child);
  },
  /**
   * 判断是否支持触控
   */
  hasTouch = 'ontouchstart' in window,
  touchStart = hasTouch ? 'touchstart' : 'mousedown',
  touchMove = hasTouch ? 'touchmove' : 'mousemove',
  touchEnd = hasTouch ? 'touchend' : 'mouseup',
  /**
   * 初始化样式
   */
  $style = $c('style'),
  style = '.swidel-wrap{display:inline-block;white-space:nowrap;font-size:0;line-height:0;position:absolute;top:0}.swidel-wrap a{vertical-align:middle;text-align:center;font-size:14px;text-decoration:none;cursor:pointer;-webkit-tap-highlight-color:transparent;display:inline-block}',
  $head = document.getElementsByTagName('head')[0];
  $style.innerHTML = style;
  $ad($head, $style);
  /**
   * 本体
   */
  win.Swidel = function(elememt, params){
    var sd = this;
    sd.el = elememt;
    sd.$e = $g(elememt);
    if(!sd.$e) return;
    sd.init(params);
  };
  /**
   * 初始化方法
   */
  Swidel.prototype.init = function(params){
    var sd = this;
    /**
     * 参数&初始值
     */
    sd.os = { //opts
      slideItem: params && params.slideItem || '.swidel-item',
      slideCell: params && params.slideCell || 'swidel-cell',
      slideText: params && params.slideText || '删除',
      slideWidth: params && params.slideWidth || null,
      slideFun: params && params.slideFun || undefined,
    };
    /**
     * 初始化赋值
     */
    sd.sx = 0; //startX
    sd.sy = 0; //startY
    sd.mx = 0; //moveX
    sd.my = 0; //moveY
    sd.vy = undefined; //scrollY
    sd.dx = 0; //translateDx
    sd.fx = 0; //translateFx
    sd.sh = 0; //slideHeight
    sd.sw = 0; //slideWidth
    sd.it = null; //slideItem
    sd.sa = [];
    sd.sl = typeof sd.os.slideText == 'string' ? 1 : sd.os.slideText.length //slideChildLength
    /**
     * 赋值宽度
     * 如果有的话
     */
    if (sd.os.slideWidth && typeof sd.os.slideWidth == 'number') {
      sd.sa.push(sd.os.slideWidth);
      sd.sw = sd.os.slideWidth;
    }else if(sd.os.slideWidth){
      for (var i = 0; i < sd.os.slideWidth.length; i++) {
        sd.sw += sd.os.slideWidth[i] || 0;
        if(sd.os.slideWidth[i]){
          sd.sa.push(sd.os.slideWidth[i]);
        };
      };
    };
    /**
     * 创建右边的标签
     */
    sd.$d = $c('div');
    sd.$d.className = 'swidel-wrap';
    for (var i = 0; i < sd.sl; i++) {
      var $a = $c('a');
      $a.className = 'swidel-slide' + i;
      if (sd.sl == 1) {
        $a.innerHTML = sd.os.slideText;
      }else{
        $a.innerHTML = sd.os.slideText[i];
      };
      $ad(sd.$d, $a);
    };

    var translate = function(move, speed, el) {
      if (!el) var el = sd.it;
      element = el.style;
      element.webkitTransitionDuration = element.MozTransitionDuration = element.msTransitionDuration = element.OTransitionDuration = element.transitionDuration = speed + 'ms';
      element.webkitTransform = element.MozTransform = element.msTransform = element.OTransform = element.transform = 'translate(' + move + 'px,0) translateZ(0)';
    };

    var doPlay = function(sl) {
      if (sd.fx == -sd.sw && sl <= sd.sw / 3 * 2) {
        sd.it.setAttribute('swidel', 'c');
        translate(0, 200);
      } else if (sd.fx == -sd.sw && sl > sd.sw / 3 * 2) {
        sd.it.setAttribute('swidel', 'o');
        translate(-sd.sw, 200);
      } else if (sd.fx == 0 && sl >= sd.sw / 3) {
        sd.it.setAttribute('swidel', 'o');
        translate(-sd.sw, 200);
      } else if (sd.fx == 0 && sl < sd.sw / 3) {
        sd.it.setAttribute('swidel', 'c');
        translate(0, 200);
      }
    };

    var tEnd = function(e) {
      sd.$e.removeEventListener(touchMove, tMove, false);
      sd.$e.removeEventListener(touchEnd, tEnd, false);
      var Dx = sd.it.style.webkitTransform || sd.it.style.transform || sd.it.style.MozTransform || sd.it.style.msTransform || sd.it.style.OTransform || 'translate(0px,0) translateZ(0)',
        Fx = parseInt(Dx.substring(10, Dx.indexOf('px')));
      doPlay(Math.abs(Fx));
    };

    var tMove = function(e) {
      if (hasTouch) {
        if (e.touches.length > 1 || e.scale && e.scale !== 1) return //多点或缩放
      };
      var touch = hasTouch ? e.touches[0] : e;
      sd.mx = touch.pageX - sd.sx;
      sd.my = touch.pageY - sd.sy;
      if (typeof sd.vy == 'undefined') {
        sd.vy = !!(sd.vy || Math.abs(sd.mx) < Math.abs(sd.my))
      }
      if (!sd.vy) {
        e.preventDefault();
        //if (sd.it.childNodes) {}
        //console.log(sd.fx, sd.mx)
        if (sd.fx == 0) {
          if (sd.mx <= -sd.sw) {
            sd.mx = -sd.sw;
          } else if (sd.mx > 0)(
            sd.mx = 0
          );
        } else if (sd.fx = -sd.sw) {
          if (sd.mx > sd.sw) {
            sd.mx = sd.sw;
          } else if (sd.mx < 0)(
            sd.mx = 0
          );
        }
        translate(sd.fx + sd.mx, 0);
      };
    };


    var tStart = function(e) {
      var touch = hasTouch ? e.touches[0] : e,
        rdx = null,
        rfx = null;
      if(e.target.classList.contains(sd.os.slideItem.replace('.', ''))){
        sd.it = e.target;
      }else{
        sd.it = $gp(e.target, sd.os.slideItem);
      };
      if (!sd.it) return;
      sd.mx = 0;
      sd.vy = undefined;
      sd.sx = touch.pageX;
      sd.sy = touch.pageY;
      sd.sh = sd.it.offsetHeight;
      if(!sd.sa.length) sd.sw = sd.sh * sd.sl;
      sd.dx = sd.it.style.webkitTransform || sd.it.style.transform || sd.it.style.MozTransform || sd.it.style.msTransform || sd.it.style.OTransform || 'translate(0px,0) translateZ(0)';
      sd.fx = parseInt(sd.dx.substring(10, sd.dx.indexOf('px')));
      if (sd.fx != -sd.sw) {
        var list = document.querySelector('[swidel=o]');
        if (list) {
          list.setAttribute('swidel', 'c');
          translate(0, 200, list);
        };
        if (!sd.it.getAttribute('swidel')) {
          if ($gs(sd.it, 'position') == 'static') sd.it.style.position = 'relative';
          var $d = sd.$d.cloneNode(true);
          var childNs = $d.childNodes;
          var nowWidth = null;
          for (var i = 0; i < sd.sl; i++) {
            nowWidth = sd.sa[i] || sd.sh;
            childNs[i].style.cssText = 'line-height:'+ sd.sh +'px;height:'+ sd.sh +'px;width:'+ nowWidth +'px';
            (function(){
              var j = i;
              childNs[j].onclick = function(){
                if (sd.sl == 1) {
                  sd.os.slideFun.call(childNs[j]);
                }else{
                  if(typeof sd.os.slideFun[j] == 'function'){
                    sd.os.slideFun[j].call(childNs[j]);
                  }else{
                    console.error('slideText中第'+ (j + 1) +'个按钮在slideFun中没有对应的方法哦！');
                  };
                };
              };
            })();
          };
          $d.addEventListener(touchStart, function(e) {
            e.stopPropagation();
          }, false);
          $d.style.cssText = 'right:'+ -sd.sw +'px';
          $ad(sd.it, $d);
          sd.it.setAttribute('swidel', 'c');
        };
      };
      sd.$e.addEventListener(touchMove, tMove, false);
      sd.$e.addEventListener(touchEnd, tEnd, false);
    };

    sd.$e.addEventListener(touchStart, tStart, false);

    sd.$e.style.cssText = sd.$e.style.cssText + 'overflow:hidden';
    if($gs(sd.$e, 'position') == 'static') sd.$e.style.cssText = sd.$e.style.cssText + 'position:relative';

  };
})(window);