//多个内容的情况（），多个方法
/*
 * sildeDel v0.2.0
*/
(function(win) {
  win.Swidel = function(params) {
    var opts = {
        mainCell: params.mainCell || '#touchMain',
        slideCell: params.slideCell || '.del-cell',
        delFn: params.delFn || undefined,
      },
      $g = function(id) {
        if (id[0] == '.') {
          return document.querySelectorAll(id);
        } else {
          return document.getElementById(id.replace('#', ''));
        };
      },
      $gp = function(el, attribute) {
        var $child = el;
        var $parent = '';
        function lp() {
          $parent = $child.parentNode;
          if ($parent.tagName = 'HTML') return $parent = undefined;
          $child = $parent;
          if ($parent.classList.contains(attribute.replace('.', ''))) {
            return $parent;
          }else {
            lp();
          };
        };
        lp();
        return $parent;
      },
      $c = function(el) {
        return document.createElement(el);
      },
      $ad = function(el, child) {
        return el.appendChild(child);
      },
      $wrap = $g(opts.mainCell),
      $slide = $g(opts.slideCell);
    if (!$wrap || !$slide) return;

    var hasTouch = 'ontouchstart' in window,
      touchStart = hasTouch ? 'touchstart' : 'mousedown',
      touchMove = hasTouch ? 'touchmove' : 'mousemove',
      touchEnd = hasTouch ? 'touchend' : 'mouseup',
      startX = 0,
      startY = 0,
      moveX = 0,
      moveY = 0,
      scrollY,
      translateDx,
      translateFx,
      $someOne = '',
      $del = $c('a'),
      $style = $c('style'),
      position = $slide[0].style.position,
      slideL = $g(opts.slideCell).length,
      slideH = $slide[0].offsetHeight,
      style = '.slide-del{position:absolute;top:0;right:' + -slideH + 'px;height:' + slideH + 'px;width:' + slideH + 'px;line-height:' + slideH + 'px;text-align:center;color:#fff;background:#ff0000;font-size:14px;text-decoration:none;cursor:pointer;-webkit-tap-highlight-color:transparent;z-index:3;display:block}';
    $style.innerHTML = style;
    $del.className = 'slide-del';
    $del.innerHTML = '删除';
    $ad($wrap, $style);
    $wrap.style.overflow = 'hidden';

    var translate = function(move, speed, el) {
      if (!el) el = $someOne;
      element = el.style;
      element.webkitTransitionDuration = element.MozTransitionDuration = element.msTransitionDuration = element.OTransitionDuration = element.transitionDuration = speed + 'ms';
      element.webkitTransform = element.MozTransform = element.msTransform = element.OTransform = element.transform = 'translate(' + move + 'px,0) translateZ(0)';
    };

    var doPlay = function(sl) {
      if (translateFx == -slideH && sl <= slideH / 3 * 2) {
        translate(0, 200);
      } else if (translateFx == -slideH && sl > slideH / 3 * 2) {
        translate(-slideH, 200);
      } else if (translateFx == 0 && sl >= slideH / 3) {
        translate(-slideH, 200);
      } else if (translateFx == 0 && sl < slideH / 3) {
        translate(0, 200);
      }
    };

    var tEnd = function(e) {
      $wrap.removeEventListener(touchMove, tMove, false);
      $wrap.removeEventListener(touchEnd, tEnd, false);
      var Dx = $someOne.style.webkitTransform || $someOne.style.transform || $someOne.style.MozTransform || $someOne.style.msTransform || $someOne.style.OTransform || 'translate(0px,0) translateZ(0)',
        Fx = parseInt(Dx.substring(10, Dx.indexOf('px')));
      doPlay(Math.abs(Fx));
    };

    var tMove = function(e) {
      if (hasTouch) {
        if (e.touches.length > 1 || e.scale && e.scale !== 1) return //多点或缩放
      };
      var touch = hasTouch ? e.touches[0] : e;
      moveX = touch.pageX - startX;
      moveY = touch.pageY - startY;
      if (typeof scrollY == 'undefined') {
        scrollY = !!(scrollY || Math.abs(moveX) < Math.abs(moveY))
      }
      if (!scrollY) {
        e.preventDefault();
        if ($someOne.childNodes) {}
        //console.log(translateFx, moveX)
        if (translateFx == 0) {
          if (moveX <= -slideH) {
            moveX = -slideH;
          } else if (moveX > 0)(
            moveX = 0
          );
        } else if (translateFx = -slideH) {
          if (moveX > slideH) {
            moveX = slideH;
          } else if (moveX < 0)(
            moveX = 0
          );
        }
        translate(translateFx + moveX, 0);
      };
    };


    var tStart = function(e) {
      moveX = 0;
      scrollY = undefined;
      var touch = hasTouch ? e.touches[0] : e;
      startX = touch.pageX;
      startY = touch.pageY;
      $someOne = $gp(e.target, opts.slideCell);
      translateDx = $someOne.style.webkitTransform || $someOne.style.transform || $someOne.style.MozTransform || $someOne.style.msTransform || $someOne.style.OTransform || 'translate(0px,0) translateZ(0)',
      translateFx = parseInt(translateDx.substring(10, translateDx.indexOf('px')));
      if (translateFx != -slideH) {
        var list = $g(opts.slideCell);
        for (var i = 0; i < list.length; i++) {
          var Ddx = list[i].style.webkitTransform || list[i].style.transform || list[i].style.MozTransform || list[i].style.msTransform || list[i].style.OTransform || 'translate(0px,0) translateZ(0)';
          var Ffx = parseInt(Ddx.substring(10, Ddx.indexOf('px')));
          if (Ffx == -slideH) {
            translate(0, 200, list[i])
          };
        };
        var hasChild = false;
        var childs = $someOne.childNodes;
        for (var k = 0; k < childs.length; k++) {
          if (childs[k].classList && childs[k].classList.contains('slide-del')) hasChild = true;
        };
        if (!hasChild) {
          var $cdel = $del.cloneNode(true);
          $cdel.addEventListener(touchStart, function(e) {
            e.stopPropagation();
          }, false);
          $cdel.onclick = function() {
            opts.delFn(this);
          };
          $ad($someOne, $cdel);
        };
      };
      $wrap.addEventListener(touchMove, tMove, false);
      $wrap.addEventListener(touchEnd, tEnd, false);
    };

    $wrap.addEventListener(touchStart, tStart, false);


  };
})(window);
