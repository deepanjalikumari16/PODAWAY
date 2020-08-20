
/**
 * The code below uses open source software. Please visit the URL below for an overview of the licenses:
 * http://js.api.here.com/v3/3.1.16.0/HERE_NOTICE
 */

H.util.eval("function Eo(a){var b=a.ownerDocument;b=b.documentElement||b.body.parentNode||b.body;try{var c=a.getBoundingClientRect()}catch(d){c={top:0,right:0,bottom:0,left:0,height:0,width:0}}return{x:c.left+(\"number\"===typeof window.pageXOffset?window.pageXOffset:b.scrollLeft),y:c.top+(\"number\"===typeof window.pageYOffset?window.pageYOffset:b.scrollTop)}}var Fo=Function(\"return this\")();function Go(a,b,c,d,e,f,g){Go.l.constructor.call(this,a);this.pointers=b;this.changedPointers=c;this.targetPointers=d;this.currentPointer=e;this.originalEvent=g;this.target=f}u(Go,qd);t(\"H.mapevents.Event\",Go);function Ho(a,b,c,d,e,f){if(isNaN(a))throw Error(\"x needs to be a number\");if(isNaN(b))throw Error(\"y needs to be a number\");if(isNaN(c))throw Error(\"pointer must have an id\");this.viewportX=a;this.viewportY=b;this.target=null;this.id=c;this.type=d;this.dragTarget=null;this.a=this.button=sc(e)?e:-1;this.buttons=sc(f)?f:0}t(\"H.mapevents.Pointer\",Ho);\nfunction Io(a,b,c){if(isNaN(b))throw Error(\"x needs to be a number\");if(isNaN(c))throw Error(\"y needs to be a number\");a.viewportX=b;a.viewportY=c}Ho.prototype.um=function(){return this.a};Ho.prototype.getLastChangedButton=Ho.prototype.um;function Jo(a,b){a.a=b;a.buttons|=Ho.prototype.b[+b]||0}function Ko(a,b){a.a=b;a.buttons&=~(Ho.prototype.b[+b]||0)}Ho.prototype.b=[1,4,2];var Lo={NONE:-1,LEFT:0,MIDDLE:1,RIGHT:2};Ho.Button=Lo;function Mo(a){this.a=a instanceof Array?a.slice(0):[]}n=Mo.prototype;n.clear=function(){this.a.splice(0,this.a.length)};n.length=function(){return this.a.length};n.indexOf=function(a){for(var b=this.a.length;b--;)if(this.a[b].id===a)return b;return-1};function No(a,b){b=a.indexOf(b);return-1!==b?a.a[b]:null}n.remove=function(a){a=this.indexOf(a);return-1!==a?this.a.splice(a,1)[0]:null};function Oo(a,b){for(var c=a.a.length,d=[];c--;)a.a[c].type!==b&&d.push(a.a[c]);a.a=d}\nfunction Po(a,b){for(var c=a.a.length;c--;)if(a.a[c].dragTarget===b)return!0;return!1}n.push=function(a){if(a instanceof Ho)return this.a.push(a);throw Error(\"list needs a pointer\");};n.Ka=function(){return this.a};n.clone=function(){return new Mo(this.a)};function Qo(a,b,c){c=c||{};if(!(a instanceof T))throw Error(\"events: map instance required\");if(!(b instanceof Array))throw Error(\"events: map array required\");md.call(this);this.Qg=c.Qg||300;this.ij=c.ij||50;this.al=c.al||50;this.bl=c.bl||500;this.Eh=c.Eh||900;this.Dh=c.Dh||8;this.map=a;this.o=this.map.za;this.j=this.o.element;this.C=b;this.a=new Mo;this.b=new Mo;this.i={};this.c=null;this.ia=!0;this.v={};this.f={};this.m=null;this.oe=A(this.oe,this);this.G={pointerdown:this.Il,pointermove:this.Jl,\npointerup:this.Kl,pointercancel:this.Hl};Ro(this)}u(Qo,md);function Ro(a,b){var c,d=a.C.length;for(c=0;c<d;c++){var e=a.C[c];var f=e.listener;\"function\"===typeof f&&(b?(e.target||a.j).removeEventListener(e.Sa,f):(e.target||a.j).addEventListener(e.Sa,f))}}function So(a,b,c){var d;if(\"function\"===typeof a.G[b]){\"pointermove\"!==b&&(a.ia=!0);var e=0;for(d=a.b.length();e<d;e++){var f=a.b.a[e];a.j.contains(c.target)?To(a,f,a.oj.bind(a,c,b,f)):a.oj(c,b,f,null)}}a.b.clear()}n=Qo.prototype;\nn.oj=function(a,b,c,d){Uo(c.id,this.v);this.G[b].call(this,c,d,a)};function To(a,b,c){if(a.c===b)c(b.target);else{var d=a.o;var e=b.viewportX;b=b.viewportY;if(0>e||0>b||e>=d.width||b>=d.height)c(y);else{var f=a.map;f.Nd(e,b,function(g){c(g||f)})}}}\nn.Kl=function(a,b,c){var d=a.id;a.target=b;Vo(this,a,c);Wo(this,b,\"pointerup\",c,a);\"mouse\"!==a.type&&Wo(this,b,\"pointerleave\",c,a);b=this.i[a.id];var e={x:a.viewportX,y:a.viewportY},f=c.timeStamp,g=a.target,h=this.m;b&&b.target===g&&b.ke.Ya(e)<this.al&&f-b.Hi<this.bl?(Wo(this,g,\"tap\",c,a),h&&h.target===g&&f-h.Hi<this.Qg?h.ke.Ya({x:a.viewportX,y:a.viewportY})<this.ij&&(Wo(this,g,\"dbltap\",c,a),this.m=null):this.m={target:g,ke:new I(a.viewportX,a.viewportY),Hi:c.timeStamp}):this.m=null;this.i={};Uo(d,\nthis.f)};function Vo(a,b,c){b===a.c&&(Wo(a,b.dragTarget,\"dragend\",c,b),a.c=null,Uo(b.id,a.v));b.dragTarget=null}n.oe=function(a,b){var c=this;Wo(this,a.dragTarget,\"drag\",b,a);Uo(a.id,this.v);this.v[a.id]=setTimeout(function(){c.oe(a,b)},150)};function Uo(a,b){b[a]&&(b[a].timeout?clearTimeout(b[a].timeout):clearTimeout(b[a]),delete b[a])}\nfunction Xo(a,b,c){var d=b.target,e=new I(b.viewportX,b.viewportY),f=b.id;Uo(f,a.f);var g=setTimeout(function(){d&&d===b.target&&e.Ya({x:b.viewportX,y:b.viewportY})<a.Dh&&(Wo(a,d,\"longpress\",c,b),delete a.i[b.id])},a.Eh);a.f[f]={timeout:g,ke:e}}\nn.Jl=function(a,b,c){var d=a.dragTarget,e=a.id;var f=a.target;a.target=b;f!==b&&(Wo(this,f,\"pointerleave\",c,a),Wo(this,b,\"pointerenter\",c,a));d?this.c?(this.oe(a,c),this.f[e]&&this.f[e].ke.Ya({x:a.viewportX,y:a.viewportY})>this.Dh&&Uo(e,this.f)):this.ia?this.ia=!1:(this.c=a,Wo(this,d,\"dragstart\",c,a),this.oe(a,c),delete this.i[e],this.ia=!0):(!this.c||this.c&&this.c.dragTarget!==b&&this.c.dragTarget!==this.map)&&Wo(this,b,\"pointermove\",c,a)};\nn.Il=function(a,b,c){var d=!(/^(?:mouse|pen)$/.test(a.type)&&0!==c.button);if(b){a.target=b;this.i[a.id]={ke:new I(a.viewportX,a.viewportY),target:a.target,Hi:c.timeStamp};\"mouse\"!==a.type&&Wo(this,b,\"pointerenter\",c,a);var e=Wo(this,b,\"pointerdown\",c,a);!this.c&&d&&(b.draggable&&!Po(this.a,b)?a.dragTarget=b:!this.map.draggable||e.defaultPrevented||Po(this.a,this.map)||(a.dragTarget=this.map));Xo(this,a,c)}};\nn.Hl=function(a,b,c){var d=a.id;a.target=null;b?(Wo(this,b,\"pointerleave\",c,a),Wo(this,b,\"pointercancel\",c,a)):Wo(this,this.map,\"pointercancel\",c,a);Vo(this,a,c);this.i={};Uo(d,this.f)};function Wo(a,b,c,d,e){if(b&&\"function\"===typeof b.dispatchEvent){var f=Go;var g=a.a.Ka(),h=a.b.Ka();a=a.a;var k,l=a.a.length,m=[];for(k=0;k<l;k++)a.a[k].target===b&&m.push(a.a[k]);f=new f(c,g,h,m,e,b,d);e.button=/^(?:longpress|(?:dbl)?tap|pointer(?:down|up))$/.test(c)?e.a:Lo.NONE;b.dispatchEvent(f)}return f}\nn.u=function(){Ro(this,!0);this.a.clear();this.b.clear();var a=this.v,b;for(b in a)Uo(b,a);a=this.f;for(var c in a)Uo(c,a);this.c=this.i=this.m=this.map=this.b=this.a=this.C=this.N=null;md.prototype.u.call(this)};function Yo(a){this.g=A(this.g,this);Qo.call(this,a,[{Sa:\"touchstart\",listener:this.g},{Sa:\"touchmove\",listener:this.g},{Sa:\"touchend\",listener:this.g},{Sa:\"touchcancel\",listener:this.g}]);this.D={touchstart:\"pointerdown\",touchmove:\"pointermove\",touchend:\"pointerup\",touchcancel:\"pointercancel\"};this.s=(a=(a=a.m)?a.J():null)?Array.prototype.slice.call(a.querySelectorAll(\"a\"),0):[]}u(Yo,Qo);\nYo.prototype.g=function(a){var b=a.touches,c=this.a.length(),d;if(\"touchstart\"===a.type&&c>=b.length){c=this.a.clone();for(d=b.length;d--;)c.remove(b[d].identifier);for(d=c.length();d--;)this.a.remove(c.a[d].id);this.b=c;So(this,\"pointercancel\",a);this.b.clear()}if(this.D[a.type]){b=Eo(this.o.element);c=a.type;d=a.changedTouches;var e=d.length,f;this.b.clear();for(f=0;f<e;f++){var g=d[f];var h=No(this.a,g.identifier);var k=g.pageX-b.x;var l=g.pageY-b.y;if(h)if(\"touchmove\"===c){g=Math.abs(h.viewportX-\nk);var m=Math.abs(h.viewportY-l);if(1<g||1<m||1===g&&1===m)Io(h,k,l),this.b.push(h)}else\"touchend\"===c&&(this.a.remove(h.id),this.b.push(h),Ko(h,Lo.LEFT));else h=new Ho(k,l,g.identifier,\"touch\",Lo.LEFT,1),this.a.push(h),this.b.push(h)}So(this,this.D[a.type],a);-1===this.s.indexOf(a.target)&&a.preventDefault()}};Yo.prototype.u=function(){this.s=null;Qo.prototype.u.call(this)};function Zo(a){var b=$o(this);(window.PointerEvent||window.MSPointerEvent)&&b.push({Sa:\"MSHoldVisual\",listener:\"prevent\"});Qo.call(this,a,b)}u(Zo,Qo);function $o(a){var b=!!window.PointerEvent,c,d,e=[];a.g=A(a.g,a);\"MSPointerDown MSPointerMove MSPointerUp MSPointerCancel MSPointerOut MSPointerOver\".split(\" \").forEach(function(f){c=f.toLowerCase().replace(/ms/g,\"\");d=b?c:f;e.push({Sa:d,listener:a.g,target:\"MSPointerUp\"===f||\"MSPointerMove\"===f?window:null})});return e}var ap={2:\"touch\",3:\"pen\",4:\"mouse\"};\nZo.prototype.g=function(a){var b=window.PointerEvent?a.type:a.type.toLowerCase().replace(/ms/g,\"\"),c=Eo(this.j),d=No(this.a,a.pointerId),e=a.pageX-c.x;c=a.pageY-c.y;var f=ap[a.pointerType]||a.pointerType;$c&&\"rtl\"===x.getComputedStyle(this.o.element).direction&&(e-=(x.devicePixelRatio-1)*this.o.width);if(!(d||b in{pointerup:1,pointerout:1,pointercancel:1}||\"touch\"===f&&\"pointerdown\"!==b)){d={x:e,y:c};var g=a.pointerType;\"number\"===typeof g&&(g=ap[g]);d=new Ho(d.x,d.y,a.pointerId,g,a.button,a.buttons);\nthis.a.push(d)}d&&(b in{pointerup:1,pointercancel:1}?(\"touch\"===f&&this.a.remove(d.id),Ko(d,a.button)):\"pointerdown\"===b&&(\"touch\"===a.pointerType&&(Oo(this.a,\"mouse\"),Oo(this.a,\"pen\")),Jo(d,a.button)),this.b.push(d),\"pointermove\"!==b?(Io(d,e,c),So(this,\"pointerout\"===b||\"pointerover\"===b?\"pointermove\":b,a)):d.viewportX===e&&d.viewportY===c||a.target===document.documentElement||(Io(d,e,c),So(this,b,a)));this.b.clear()};function bp(a,b,c,d){bp.l.constructor.call(this,\"contextmenu\");this.items=[];this.viewportX=a;this.viewportY=b;this.target=c;this.originalEvent=d}u(bp,qd);t(\"H.mapevents.ContextMenuEvent\",bp);function cp(a){this.qh=A(this.qh,this);this.sh=A(this.sh,this);this.rh=A(this.rh,this);this.s=!1;this.g=-1;this.D=0;cp.l.constructor.call(this,a,[{Sa:\"contextmenu\",listener:this.qh},{target:a,Sa:\"longpress\",listener:this.sh},{target:a,Sa:\"dbltap\",listener:this.rh}])}u(cp,Qo);n=cp.prototype;n.sh=function(a){var b=a.currentPointer;\"touch\"===b.type&&1===a.pointers.length&&dp(this,b.viewportX,b.viewportY,a.originalEvent,a.target)};n.rh=function(a){\"touch\"===a.currentPointer.type&&(this.D=Date.now())};\nn.qh=function(a){var b=this;-1===this.g?this.g=setTimeout(function(){var c=Eo(b.j),d=a.pageX-c.x;c=a.pageY-c.y;b.g=-1;dp(b,d,c,a)},this.Qg):(clearInterval(this.g),this.g=-1);a.preventDefault()};function dp(a,b,c,d,e){var f=a.map,g=Date.now()-a.D;e?!a.s&&g>a.Eh&&(a.s=!0,e.dispatchEvent(new bp(b,c,e,d)),Be(f.J(),a.Pi,a.nj,!1,a)):f.Nd(b,c,a.wn.bind(a,b,c,d))}n.wn=function(a,b,c,d){d=d&&Ba(d.dispatchEvent)?d:this.map;dp(this,a,b,c,d)};n.Pi=[\"mousedown\",\"touchstart\",\"pointerdown\",\"wheel\"];\nn.nj=function(){this.s&&(this.s=!1,this.map.dispatchEvent(new qd(\"contextmenuclose\",this.map)))};n.u=function(){var a=this.map.J();clearInterval(this.g);a&&Ie(a,this.Pi,this.nj,!1,this);Qo.prototype.u.call(this)};function ep(a,b,c,d,e){ep.l.constructor.call(this,\"wheel\");this.delta=a;this.viewportX=b;this.viewportY=c;this.target=d;this.originalEvent=e}u(ep,qd);t(\"H.mapevents.WheelEvent\",ep);function fp(a){var b=\"onwheel\"in document;this.K=b;this.D=(b?\"d\":\"wheelD\")+\"elta\";this.g=A(this.g,this);fp.l.constructor.call(this,a,[{Sa:(b?\"\":\"mouse\")+\"wheel\",listener:this.g}]);this.s=this.map.za}u(fp,Qo);\nfp.prototype.g=function(a){if(!a.kl){var b=Eo(this.j);var c=a.pageX-b.x;b=a.pageY-b.y;var d=this.D,e=a[d+(d+\"Y\"in a?\"Y\":\"\")],f;$c&&\"rtl\"===x.getComputedStyle(this.s.element).direction&&(c-=(x.devicePixelRatio-1)*this.s.width);if(e){var g=Math.abs;var h=g(e);e=(!(f=a[d+\"X\"])||3<=h/g(f))&&(!(f=a[d+\"Z\"])||3<=h/g(f))?((0<e)-(0>e))*(this.K?1:-1):0}c=new ep(e,c,b,null,a);c.delta&&(a.stopImmediatePropagation(),a.preventDefault(),this.map.Nd(c.viewportX,c.viewportY,this.I.bind(this,c)))}};\nfp.prototype.I=function(a,b){var c=a.target=b||this.map,d,e;setTimeout(function(){c.dispatchEvent(a);a.f||(d=a.originalEvent,e=new x.WheelEvent(\"wheel\",d),e.kl=1,d.target.dispatchEvent(e))},0)};function gp(a){var b=window;this.g=A(this.g,this);Qo.call(this,a,[{Sa:\"mousedown\",listener:this.g},{Sa:\"mousemove\",listener:this.g,target:b},{Sa:\"mouseup\",listener:this.g,target:b},{Sa:\"mouseover\",listener:this.g},{Sa:\"mouseout\",listener:this.g},{Sa:\"dragstart\",listener:this.s}])}u(gp,Qo);\ngp.prototype.g=function(a){var b=a.type,c=Eo(this.j);c={x:a.pageX-c.x,y:a.pageY-c.y};var d;(d=this.a.a[0])||(d=new Ho(c.x,c.y,1,\"mouse\"),this.a.push(d));this.b.push(d);Io(d,c.x,c.y);/^mouse(?:move|over|out)$/.test(b)?So(this,\"pointermove\",a):(/^mouse(down|up)$/.test(b)&&(c=a.which-1,\"up\"===Fo.RegExp.$1?Ko(d,c):Jo(d,c)),So(this,b.replace(\"mouse\",\"pointer\"),a));this.b.clear()};gp.prototype.s=function(a){a.preventDefault()};function hp(a){var b=a.za.element.style;if(-1!==ip.indexOf(a))throw Error(\"InvalidArgument: map is already in use\");this.a=a;ip.push(a);b.msTouchAction=b.touchAction=\"none\";ad||!window.PointerEvent&&!window.MSPointerEvent?(this.c=new Yo(this.a),this.b=new gp(this.a)):this.c=new Zo(this.a);this.g=new fp(this.a);this.f=new cp(this.a);this.a.tb(this.B,this);md.call(this)}u(hp,md);t(\"H.mapevents.MapEvents\",hp);hp.prototype.c=null;hp.prototype.b=null;hp.prototype.g=null;hp.prototype.f=null;\nvar ip=[];Ec(ip);hp.prototype.B=function(){this.a=null;this.c.B();this.g.B();this.f.B();this.b&&this.b.B();ip.splice(ip.indexOf(this.a),1);md.prototype.B.call(this)};hp.prototype.dispose=hp.prototype.B;hp.prototype.Vl=function(){return this.a};hp.prototype.getAttachedMap=hp.prototype.Vl;function jp(a,b){b=void 0===b?{}:b;var c;jp.l.constructor.call(this);if(-1!==kp.indexOf(a))throw new D(jp,0,\"events are already used\");this.a=c=a.a;this.j=a;kp.push(a);c.draggable=!0;this.i=b.kinetics||{duration:600,Fd:rm};this.m=b.modifierKey||\"Alt\";this.enable(b.enabled);this.c=c.za;this.f=this.c.element;this.g=0;c.addEventListener(\"dragstart\",this.Oh,!1,this);c.addEventListener(\"drag\",this.bk,!1,this);c.addEventListener(\"dragend\",this.Nh,!0,this);c.addEventListener(\"wheel\",this.rk,!1,this);c.addEventListener(\"dbltap\",\nthis.lk,!1,this);c.addEventListener(\"pointermove\",this.ck,!1,this);Ae(this.f,\"contextmenu\",this.ak,!1,this);a.tb(this.B,this)}u(jp,md);t(\"H.mapevents.Behavior\",jp);var kp=[];Ec(kp);jp.prototype.b=0;var lp={PANNING:1,PINCH_ZOOM:2,WHEEL_ZOOM:4,DBL_TAP_ZOOM:8,FRACTIONAL_ZOOM:16,TILT:32,HEADING:64};jp.Feature=lp;var mp=lp.PANNING,np=lp.PINCH_ZOOM,op=lp.WHEEL_ZOOM,pp=lp.DBL_TAP_ZOOM,qp=lp.FRACTIONAL_ZOOM,rp=lp.TILT,sp=lp.HEADING,tp=mp|np|op|pp|qp|rp|sp;jp.DRAGGING=mp;jp.WHEELZOOM=op;\njp.DBLTAPZOOM=pp;jp.FRACTIONALZOOM=qp;function up(a,b){if(a!==+a||a%1||0>a||2147483647<a)throw new D(b,0,\"integer in range [0...0x7FFFFFFF] required\");}jp.prototype.disable=function(a){var b=this.b;a!==B?(up(a,this.disable),b^=b&a):b=0;this.c.endInteraction(!0);this.b=b;this.a.draggable=0<(b&(mp|rp|sp|np))};jp.prototype.disable=jp.prototype.disable;jp.prototype.enable=function(a){var b=this.b;a!==B?(up(a,this.enable),b|=a&tp):b=tp;this.b=b;this.a.draggable=0<(b&(mp|rp|sp|np))};\njp.prototype.enable=jp.prototype.enable;jp.prototype.isEnabled=function(a){up(a,this.isEnabled);return a===(this.b&a)};jp.prototype.isEnabled=jp.prototype.isEnabled;\nfunction vp(a,b,c){var d=\"touch\"===b.currentPointer.type,e=0,f;if(f=!d){f=a.m;var g,h=b.originalEvent;h.getModifierState?g=h.getModifierState(f):g=!!h[f.replace(/^Control$/,\"ctrl\").toLowerCase()+\"Key\"];f=g}f?e|=rp|sp:(e|=mp,d&&(b=b.pointers,2===b.length&&(e|=np|sp,c?55>zd(b[0].viewportY-b[1].viewportY)&&(e|=rp):a.wh&xl.TILT&&(e|=rp))));e&=a.b;return(e&rp?xl.TILT:0)|(e&sp?xl.HEADING:0)|(e&np?xl.ZOOM:0)|(e&mp?xl.COORD:0)}\nfunction wp(a){var b=a.pointers;a=b[0];b=b[1];a=[a.viewportX,a.viewportY];b&&a.push(b.viewportX,b.viewportY);return a}n=jp.prototype;n.wh=0;n.Oh=function(a){var b=vp(this,a,!0);if(this.wh=b){var c=this.c;a=wp(a);c.startInteraction(b,this.i);c.interaction.apply(c,a);if(this.b&op&&!(this.b&qp)&&(b=a[0],c=a[1],this.g)){a=this.a.ob();var d=(0>this.g?yd:xd)(a);a!==d&&(this.g=0,xp(this,a,d,b,c))}}};\nn.bk=function(a){var b=vp(this,a,!1);if(b!==this.wh)\"pointerout\"!==a.originalEvent.type&&\"pointerover\"!==a.originalEvent.type&&(this.Nh(a),this.Oh(a));else if(b){b=this.c;var c=wp(a);b.interaction.apply(b,c);a.originalEvent.preventDefault()}};n.Nh=function(a){vp(this,a,!1)&&this.c.endInteraction(!this.i)};\nfunction xp(a,b,c,d,e){var f=+c-+b;a=a.a.b;if(isNaN(+b))throw Error(\"start zoom needs to be a number\");if(isNaN(+c))throw Error(\"to zoom needs to be a number\");0!==f&&(a.startControl(null,d,e),a.control(0,0,6,0,0,0),a.endControl(!0,function(g){g.zoom=c}))}n.rk=function(a){if(!a.defaultPrevented&&this.b&op){var b=a.delta;var c=this.a.ob();var d=this.a;var e=d.dc().type;d=this.b&qp?c-b:(0>-b?yd:xd)(c)-b;if(e===tn.P2D||e===tn.WEBGL)xp(this,c,d,a.viewportX,a.viewportY),this.g=b;a.preventDefault()}};\nn.ck=function(){};n.lk=function(a){var b=a.currentPointer,c=this.a.ob(),d=a.currentPointer.type,e=this.a.dc().type;(e===tn.P2D||e===tn.WEBGL)&&this.b&pp&&(a=\"mouse\"===d?0===a.originalEvent.button?-1:1:0<a.pointers.length?1:-1,a=this.b&qp?c-a:(0>-a?yd:xd)(c)-a,xp(this,c,a,b.viewportX,b.viewportY))};n.ak=function(a){return this.b&pp?(a.preventDefault(),!1):!0};\nn.B=function(){var a=this.a;a&&(a.draggable=!1,a.removeEventListener(\"dragstart\",this.Oh,!1,this),a.removeEventListener(\"drag\",this.bk,!1,this),a.removeEventListener(\"dragend\",this.Nh,!0,this),a.removeEventListener(\"wheel\",this.rk,!1,this),a.removeEventListener(\"dbltap\",this.lk,!1,this),a.removeEventListener(\"pointermove\",this.ck,!1,this),this.a=null);this.f&&(this.f.style.msTouchAction=\"\",Ie(this.f,\"contextmenu\",this.ak,!1,this),this.f=null);this.i=this.c=null;kp.splice(kp.indexOf(this.j),1);md.prototype.B.call(this)};\njp.prototype.dispose=jp.prototype.B;t(\"H.mapevents.buildInfo\",function(){return Df(\"H-mapevents\",\"1.16.0\",\"5fd61b9\")});\n");