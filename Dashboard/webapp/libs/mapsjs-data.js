/**
 * The code below uses open source software. Please visit the URL below for an overview of the licenses:
 * http://js.api.here.com/v3/3.1.16.0/HERE_NOTICE
 */

H.util.eval(
	"function hs(a,b,c,d,e){e&1&&is(a,a,b,c,d,0);e&2&&is(a,a,b,c,d,1);e&4&&is(a,a,b,c,d,2);e&8&&is(a,a,b,c,d,3)}\nfunction is(a,b,c,d,e,f){var g=(c+1)*(c+1),h,k=4*d,l=c+1,m,q=[{r:0,Pl:0,yl:0,zg:0,next:null}];var p=1;var r=[\"r\",\"g\",\"b\",\"a\"][f];var v=2*c+1;for(var w,z;p<v;p++)q[p]={r:0,Pl:0,yl:0,zg:0,next:null},q[p-1].next=q[p];q[2*c].next=q[0];var J=4*(d-1);for(h=0;h<e;h++){var G=h*k;var V=a[G+f];var S=V*l*(c+2)/2;v=V*l;for(p=0;p<=c;p++)q[p][r]=V;var ra=0;for(p=1;p<=c;p++){var da=p<d?G+4*p:G+J;da=a[da+f];S+=da*(l-p);ra+=da;q[c+p][r]=da}da=q[0];w=q[l];p=G;z=4*l;var Zb=G+J;for(V=0;V<d;V++){b[p+f]=S/g;S-=v;var qb=\nV+l<d?p+z:Zb;qb=a[qb+f];ra+=qb;S+=ra;v-=da[r];v+=w[r];ra-=w[r];da[r]=qb;da=da.next;w=w.next;p+=4;if(!S)for(;(m=4*(V+l))<k&&0===a[G+f+m];)V++,p+=4}}G=(e-1)*k;for(V=0;V<d;V++){a=4*V;h=b[a+f];S=h*l*(c+2)/2;v=h*l;for(p=0;p<=c;p++)q[p][r]=h;ra=0;for(p=1;p<=c;p++)da=p<e?a+p*k:a+G,da=b[da+f],S+=da*(c-p+1),ra+=da,q[c+p][r]=da;da=q[0];w=q[l];p=a;Zb=l*k;J=a+G;for(h=0;h<e;h++)if(b[p+f]=S/g,S-=v,qb=h+l<e?p+Zb:J,qb=b[qb+f],ra+=qb,S+=ra,v-=da[r],v+=w[r],ra-=w[r],da[r]=qb,da=da.next,w=w.next,p+=k,!S)for(;(m=h+l)<\ne&&0===b[m*k+f+a];)h++,p+=k}};function js(a,b,c){this.f=b=a>>b;this.j=Math.log(b)*Math.LOG2E;this.i=a=document.createElement(\"CANVAS\");this.a=a.getContext(\"2d\");this.b=a.width=a.height=3*b;var d=document.createElement(\"canvas\");a=c.a;var e=c.b;b=[];var f;d.width=256;d.height=1;d=d.getContext(\"2d\");for(g in e)e.hasOwnProperty(g)&&b.push({stop:parseFloat(g),value:e[g]});e=b.length;b.sort(this.m);0<b[0].stop&&b.unshift({stop:0,value:b[0].value});1>b[e-1].stop&&b.push({stop:1,value:b[e-1].value});e=b.length;var g=d.createLinearGradient(0,\n0,256,0);for(f=0;f<e;f++){if(!a&&k){var h=k.stop+(b[f].stop-k.stop)/2;g.addColorStop(h,k.value);g.addColorStop(h,b[f].value)}g.addColorStop(b[f].stop,b[f].value);var k=b[f]}d.fillStyle=g;d.fillRect(0,0,256,1);this.c=d.getImageData(0,0,256,1).data;this.g=c.a}js.prototype.m=function(a,b){return a.stop-b.stop};function ks(a,b){this.canvas=a;this.size=b};function ls(a,b,c){this.a=a=Xd(a,0,30);this.Na=b;this.i=c;this.m=[];this.b=[];do this.b[a]=[],this.m[a]=new ms;while(a--);b===ns?(this.o=os,this.j=ps):(this.o=qs,this.j=rs);this.c=1/0;this.f=-1/0}var ss=Math.log(.5);function ps(a){return this.g?Math.round((a-this.c)/this.g*255):127}function rs(a){return void 0===this.v?127:Math.round(255*Math.pow(a,this.v))}\nls.prototype.Gb=function(a){var b,c;var d=a.value;void 0===d&&(d=1);d>this.f&&(this.f=d,this.g=this.f-this.c);d<this.c&&(this.c=d,this.g=this.f-this.c);var e=li.Kb(a).scale(1073741823).floor();d=this.a;var f=e.x>>30-d;e=e.y>>30-d;for(c=this.o;-1<d;){this.b[d][e]||(this.b[d][e]=[]);(b=this.b[d][e][f])||(b=this.b[d][e][f]=new c);b.Gb(a,d);var g=this.m[d];g.f>b.b&&(g.f=b.b);g.a<b.b&&(g.a=b.b);g.c>b.a&&(g.c=b.a);g.b<b.a&&(g.b=b.a);d--;f>>=1;e>>=1}};\nfunction ts(a,b,c,d,e){var f=1<<b,g,h;d=Wd(d,f);f=0<=c&&c<f&&(g=a.b[b])&&(h=g[c])&&(f=h[d])||null;!f&&e&&0<=b&&(f=ts(a,b-1,c>>1,d>>1,e));return f}function us(a,b,c,d,e,f){for(var g,h=[];c<=d;c++)for(g=e;g<=f;g++)h.push(ts(a,b,c,g,!1));return h}function vs(a,b){var c=0,d=0,e=ts(a,0,0,0,!1),f;if(!0===b.c)return b.f;b.z===a.a?b.f=b.a:(ws(a,b,function(g){var h=xs(a,g),k=4-h.length;if(g.z!==a.a){for(f=0;f<h.length;f++)c+=h[f].a,d++;c+=k*e.a;d+=k}}),b.f=c/d);b.c=!0;return b.f}\nfunction ws(a,b,c){b=[b];for(var d,e;0<b.length;)e=b.shift(),d=xs(a,e),c(e),b.push.apply(b,d)}function xs(a,b){var c=[],d,e,f;for(e=0;1>=e;e++)for(f=0;1>=f;f++)(d=ts(a,b.z+1,2*b.x+e,2*b.y+f,!1))&&c.push(d);return c}ls.prototype.clear=function(){ls.call(this,this.a,this.Na,this.i)};function qs(){this.a=this.b=this.g=0}qs.prototype.Gb=function(a,b){this.g++;this.b+=a.value||1;this.a=this.b/Math.pow(2,2*(30-b))};function os(){this.a=this.b=this.g=0;this.c=!1}\nos.prototype.Gb=function(a){a=a.value;this.b+=void 0!==a?a:1;this.a=this.b/++this.g;this.c=!1};function ms(){this.f=this.c=1/0;this.a=this.b=-1/0};function ys(a,b){var c,d=0;if(!Ca(a)||Sa(a))throw new D(ys,0,a);for(c in a){var e=+c;d++;if(!(Bc(e)&&0<=e&&1>=e&&yc(a[c])))throw new D(ys,0,a);}if(2>d)throw new D(ys,0,\"Specify at least 2 stops\");this.b=a;this.a=!!b}t(\"H.data.heatmap.Colors\",ys);var zs=new ys({0:\"#008\",\"0.2\":\"#0b0\",\"0.5\":\"#ff0\",\"0.7\":\"#f00\"},!0);ys.DEFAULT=zs;function As(a){var b=a||{},c=+b.sampleDepth;a=+b.coarseness;var d=b.colors,e={min:b.min,max:b.max},f=b.tileSize,g=+b.dataMax;b.tileSize&&(e.tileSize=f);Q.call(this,e);Zj(this,b.opacity);this.Na=\"value\"===b.type?ns:Bs;this.sampleDepth_=Bc(c)?Xd(Math.round(c),1,8):4;this.C=!!b.assumeValues;b=this.max;this.D=Bc(g)?Xd(Math.round(g),this.min,b+this.sampleDepth_):b;a=Bc(a)?Xd(Math.round(a),0,3):1;if(d&&!C(d,ys))throw new D(As,0,\"colors\");this.a=new ls(b+this.sampleDepth_,this.Na,this.D);this.I=new js(this.tileSize,\na,d||zs);this.s=A(this.s,this);this.b=A(this.b,this);this.K=new Ck(20,this.s)}u(As,Q);t(\"H.data.heatmap.Provider\",As);As.prototype.lc=function(a){Zj(this,a)};As.prototype.setOpacity=As.prototype.lc;As.prototype.Uc=function(){return this.i};As.prototype.getOpacity=As.prototype.Uc;As.prototype.Qe=cf;As.prototype.providesRasters=As.prototype.Qe;\nAs.prototype.O=function(a,b,c,d,e){var f=this.C,g,h;if(ts(this.a,0,0,0,!1)){if(!f){var k=us(this.a,c,b-1,b+1,a-1,a+1);for(g=k.length;g--&&!f;)if(null!==k[g]){f=!0;break}}f&&(h=this.K.push([a,b,c,d,e],this.b))}f||d(null);return h};As.prototype.requestInternal=As.prototype.O;\nfunction Cs(a,b,c,d){var e=document.createElement(\"canvas\"),f=a.tileSize,g=e.getContext(\"2d\");e.width=e.height=f;var h=a.I;var k=a.a,l=a.C,m=a.Na;var q=h.f;var p=h.a,r,v,w=m===Bs?2:1,z=w;a=Math.min(a.sampleDepth_+w,h.j);w=h.b;var J=k.a;if(l&&m===ns){for(v=-1;1>=v;v++)for(l=-1;1>=l;l++){var G=(G=ts(k,d,c+v,b+l,!0))?k.j(vs(k,G)):128;p.fillStyle=\"rgba(\"+G+\",128,0,1)\";p.fillRect((l+1)*q,(v+1)*q,q,q)}l=q-Math.floor(q/10);v=3;G=p.getImageData(0,0,w,w);hs(G.data,l,w,w,v);p.putImageData(G,0,0)}else p.fillStyle=\nl?\"#080\":\"#000\",p.fillRect(0,0,w,w);for(;z<=a&&d+z<=J;z++){l=q>>z;v=q-l;var V=m===Bs?127+Math.floor(128/(1<<a-z)):255;G=(1<<z)+2;var S=1<<z;var ra=b<<z;var da=c<<z;S=us(k,d+z,da-1,da+S,ra-1,ra+S);for(ra=S.length;ra--;){da=ra%G;var Zb=ra/G<<0;if(r=S[ra])r=k.j(r.a),p.fillStyle=\"rgba(\"+r+\",\"+V+\",0,1)\",p.fillRect(da*l+v,Zb*l+v,l,l)}G=p;V=l;S=v;ra=q+2*l;l=q+2*l;da=da=3;Zb=p.getImageData(S,v,ra,l);hs(Zb.data,V,ra,l,da);G.putImageData(Zb,S,v)}b=p.getImageData(0,0,w,w);c=h.c;d=h.g;k=b.data;a=0;for(w=k.length;a<\nw;a+=4)m=k[a],z=k[a+1],4===c.length&&(m=0),k[a]=c[4*m],k[a+1]=c[4*m+1],k[a+2]=c[4*m+2],k[a+3]=c[4*m+3]*(d?z/255:10>z?0:1);p.putImageData(b,0,0);h=new ks(h.i,q);q=h.size;g.drawImage(h.canvas,q,q,q,q,0,0,f,f);return e}As.prototype.s=function(a,b){a.done(Cs(this,b[0],b[1],b[2]))};As.prototype.b=function(a,b,c){var d=a.data;a=d[3];d=d[4];c?d():a(b)};\nAs.prototype.bj=function(a,b){var c;if(!xc(a))throw new D(this.bj,0,a);if(c=a.length){for(;c--;)this.a.Gb(a[c]);a=this.a;var d;c=a.m;var e=a.a,f=0;if(a.Na===Bs){var g=c[a.a].a;for(d=a.a;0<=d;d--)if(c[d].a===g)f=d;else break;g=c[0].a;for(d=0;d<=f;d++)if(g===c[d].a)e=d;else break;f>a.i&&(f=a.i);g=Math.round(e+(f-e)/2);a.v=ss/Math.log(c[g].b)}this.reload(!!b)}};As.prototype.addData=As.prototype.bj;As.prototype.clear=function(){this.a.clear();this.reload(!0)};As.prototype.clear=As.prototype.clear;var Bs=0,ns=1;function Ds(){}t(\"H.data.utils.Dom\",Ds);Ds.prototype.Hd=function(a){return!!a&&/^\\s*(1|true)\\s*$/i.test(this.La(a))};Ds.prototype.getBoolean=Ds.prototype.Hd;Ds.prototype.La=function(a){var b;try{if(a.nodeType===Node.ATTRIBUTE_NODE)return a.value;var c=\"\";var d=0;var e=a.childNodes;for(b=e.length;d<b;d++)e[d].nodeType!==Node.COMMENT_NODE&&(c+=e[d].nodeValue.replace(/^\\s+|\\s+$/g,\"\"))}catch(f){}return c||\"\"};Ds.prototype.getString=Ds.prototype.La;\nDs.prototype.Gf=function(a){return parseFloat(this.La(a))||0};Ds.prototype.getFloat=Ds.prototype.Gf;Ds.prototype.vk=function(a){var b=a.split(/\\s+/),c=b.length,d=!(b&&1==c),e=d?1:3,f=[],g;d||(b=a.split(\",\"),c=b.length);for(g=0;g<c;g+=e)if(a=this.ai(d?b[g]:g+3>b.length?null:b.slice(g,g+3)))f.push(a);else return[];return f};Ds.prototype.parseCoords=Ds.prototype.vk;\nDs.prototype.ai=function(a){if(!a)return null;var b=a instanceof Array&&0<a.length&&4>a.length?a:a.split(\",\");a=parseFloat(b[0]);var c=parseFloat(b[1]);b=parseFloat(b[2]);return isNaN(c)||isNaN(a)?null:new Wf(c,a,isNaN(b)?void 0:b)};Ds.prototype.parseCoord=Ds.prototype.ai;Ds.prototype.Ff=function(a){a=this.La(a);return/^[0-9a-fA-F]{8}$/.test(a)?\"#\"+a.substr(6,2)+a.substr(4,2)+a.substr(2,2)+a.substr(0,2):\"#000000ff\"};Ds.prototype.getColor=Ds.prototype.Ff;function Es(){this.a={4:function(a){return[\"#\",a.charAt(1),a.charAt(1),a.charAt(2),a.charAt(2),a.charAt(3),a.charAt(3),\"ff\"].join(\"\")},5:function(a){return[\"#\",a.charAt(1),a.charAt(1),a.charAt(2),a.charAt(2),a.charAt(3),a.charAt(3),a.charAt(4),a.charAt(4)].join(\"\")},7:function(a){return a+\"ff\"},9:function(a){return a}};this.b={4:function(a){return[Fs(a.charAt(1)),Fs(a.charAt(2)),Fs(a.charAt(3)),255]},5:function(a){return[Fs(a.charAt(1)),Fs(a.charAt(2)),Fs(a.charAt(3)),Fs(a.charAt(4))]},7:function(a){a=\nparseInt(a.substring(1),16);return[a>>16&255,a>>8&255,a&255,255]},9:function(a){a=parseInt(a.substring(1),16);return[a>>24&255,a>>16&255,a>>8&255,a&255]}}}t(\"H.data.utils.ColorHelper\",Es);function Fs(a){a=parseInt(a,16);return(a<<4)+a}function Gs(a){return 16>a?\"0\"+Math.round(a).toString(16):Math.round(a).toString(16)}\nfunction Hs(a,b,c){if(!/^(#|rgb).*/.test(b))return[0,0,0,255];c||(c=\"\",\"#\"===b.charAt(0)?c=a.a[b.length]?b:\"\":\"rgb\"===b.substr(0,3)&&(b=b.match(/\\d+(\\.\\d+)?/g),c=b.length,c=2<c&&5>c?[\"#\",Gs(+b[0]),Gs(+b[1]),Gs(+b[2]),3<c?Gs(255*+b[3]):\"ff\"].join(\"\"):\"\"),b=c);a=a.b[b.length](b);a[3]=Math.round(a[3]/255*100)/100;return a}\nEs.prototype.fl=function(a,b){var c=\"\";if(!/^(#|rgb).*/.test(a)){c=\"\";var d;for(d=0;6>d;d++)c+=\"ABCDEF0123456789\".charAt(Math.floor(16*Math.random()));return c+\"ff\"}a=Hs(this,a,b);for(b=0;4>b;b++)3>b?d=Math.floor(Math.random()*(a[b]+1)):d=255*a[b],c+=Gs(d);return c};Es.prototype.toRandomRGBA=Es.prototype.fl;function Is(a){a=a.attributes;for(var b,c=a.length;c--;)switch(b=a[c],b.name){case \"x\":this.x=parseFloat(b.value);break;case \"y\":this.y=parseFloat(b.value);break;case \"xunits\":this.Vc=\"fraction\"===Ds.prototype.La(b);break;case \"yunits\":this.zc=\"fraction\"===Ds.prototype.La(b)}}t(\"H.data.kml.HotSpot\",Is);function Js(a){var b=a.childNodes,c=new Ds;for(a=b.length;a--;){var d=b[a];switch(d.nodeName){case \"href\":this.href=c.La(d)}}}t(\"H.data.kml.Icon\",Js);function Ks(a){var b;if(a){a=a.childNodes;var c=a.length;for(b=new Ds;c--;){var d=a[c];switch(d.nodeName){case \"scale\":this.scale=b.Gf(d);break;case \"Icon\":this.icon=d=new Js(d);break;case \"hotSpot\":this.Lj=d=new Is(d)}}}}t(\"H.data.kml.IconStyle\",Ks);function Ls(a){a=a.childNodes;for(var b,c=a.length,d=new Ds,e=new Es;c--;)switch(b=a[c],b.nodeName){case \"color\":this.color=d.Ff(b);break;case \"colorMode\":this.a=d.La(b)}\"random\"===this.a&&(this.color=\"#\"+e.fl(this.color,!1))}t(\"H.data.kml.ColorStyle\",Ls);function Ms(a){var b=a.childNodes,c=b.length,d=new Ds;this.outline=this.fill=!0;for(this.uf=new Ls(a);c--;)switch(a=b[c],a.nodeName){case \"fill\":this.fill=d.Hd(a);break;case \"outline\":this.outline=d.Hd(a)}}t(\"H.data.kml.PolyStyle\",Ms);function Ns(a){var b=a.childNodes,c=b.length,d=new Ds;for(this.uf=new Ls(a);c--;)a=b[c],\"width\"===a.nodeName&&(this.width=d.Gf(a))}t(\"H.data.kml.LineStyle\",Ns);function Os(a){a=a.childNodes;for(var b,c=a.length,d=new Ds;c--;)switch(b=a[c],b.nodeName){case \"bgColor\":this.bgColor=d.Ff(b);break;case \"textColor\":this.textColor=d.Ff(b);break;case \"text\":this.text=d.La(b);break;case \"displayMode\":this.displayMode=d.La(b)}}t(\"H.data.kml.BalloonStyle\",Os);function Ps(a){var b=a.childNodes,c=b.length;for(this.id=a.getAttribute(\"id\");c--;)switch(a=b[c],a.nodeName){case \"IconStyle\":this.Nj=a=new Ks(a);break;case \"LineStyle\":this.Vd=a=new Ns(a);break;case \"PolyStyle\":this.xk=a=new Ms(a);break;case \"BalloonStyle\":this.pf=a=new Os(a)}}t(\"H.data.kml.Style\",Ps);function Qs(a,b){a=a.childNodes;var c=a.length,d=new Ds;for(this.b=b;c--;)switch(b=a[c],b.nodeName){case \"key\":this.key=d.La(b);break;case \"styleUrl\":this.a=d.La(b)}}t(\"H.data.kml.Pair\",Qs);Qs.prototype.wa=function(){if(this.a){var a=\"highlight\"===this.key?!0:!1;a=this.b.ph(this.a.substr(1),a)}return a};Qs.prototype.getStyle=Qs.prototype.wa;function Rs(a,b){var c=a.childNodes,d=c.length;this.b=b;this.id=a.getAttribute(\"id\");for(this.a=[];d--;)a=c[d],\"Pair\"===a.nodeName&&(a=new Qs(a,this.b),this.a.push(a))}t(\"H.data.kml.StyleMap\",Rs);Rs.prototype.wa=function(a){var b=null;a=a?\"highlight\":\"normal\";for(var c=this.a.length;c--;)this.a[c].key===a&&(b=this.a[c].wa());return b};Rs.prototype.getStyle=Rs.prototype.wa;function Ss(){this.a={}}t(\"H.data.kml.StyleContainer\",Ss);Ss.prototype.Eg=function(a){a&&a.id&&(this.a[\"style_\"+a.id]=a)};Ss.prototype.addStyle=Ss.prototype.Eg;Ss.prototype.ph=function(a,b){a=this.a[\"style_\"+a];a instanceof Rs&&(a=a.wa(b));return a};Ss.prototype.getStyleById=Ss.prototype.ph;function Ts(a,b){var c=a&&a.childNodes||[],d=new Ds;if(!a||!b)throw Error(\"Node or stylesContainer is not defined\");this.visibility=!0;this.Sn=a;for(a=c.length;a--;){var e=c[a];switch(e.nodeName){case \"name\":this.name=d.La(e);break;case \"description\":this.description=d.La(e);break;case \"visibility\":this.visibility=d.Hd(e);break;case \"open\":this.open=d.Hd(e);break;case \"styleUrl\":if(this.a=d.La(e))e=this.a.substr(1),this.Nl=b.ph(e,!1);break;case \"Style\":this.Wj=e=new Ps(e)}}}\nt(\"H.data.kml.Feature\",Ts);function Us(a){a=a.childNodes;for(var b,c=a.length,d=null,e=new Ds;c--;)b=a[c],\"coordinates\"===b.nodeName&&(d=e.La(b));this.a=null;d&&(this.a=e.ai(d)||null)}t(\"H.data.kml.Point\",Us);function Vs(a){a=a.childNodes;for(var b,c=a.length,d=new Ds;c--;)if(b=a[c],\"coordinates\"===b.nodeName){b=d.La(b);var e=[],f=new Ds;try{e=f.vk(b)}catch(g){e=[]}this.a=2>e.length?[]:e}}t(\"H.data.kml.Line\",Vs);function Ws(a){for(var b=new L,c=a.a?a.a.length:0;c--;)b.pd(a.a[c]);return b};function Xs(){}Xs.prototype.f=0;Xs.prototype.b=0;function Ys(a){var b=a.childNodes,c=b.length;this.a=new L;for(this.c=[];c--;){var d=b[c];var e=d.nodeName;if(\"outerBoundaryIs\"===e||\"innerBoundaryIs\"===e){var f=d.childNodes;for(d=f.length;d--;){var g=f[d];if(\"LinearRing\"===g.nodeName){var h=new Vs(g);if(\"outerBoundaryIs\"===e){this.a=Ws(h);var k=void 0,l=a,m=h.a;h=new Ds;var q=l.querySelector(\"altitudeMode\");if(q&&q.parentNode===l&&!/^\\s*clampTo/.test(h.La(q))&&m){q=m.length;for(var p=0;p<q&&0!==k;p++){var r=m[p].alt;r?k?r!==k&&(k=0):k=r:k=0}(m=l.querySelector(\"*|altitudeOffset\"))&&\nm.parentNode===g&&\"http://www.google.com/kml/ext/2.2\"===m.namespaceURI&&(g=h.Gf(m))&&(k+=g);k&&(k=ud(Nh,k),(g=l.querySelector(\"extrude\"))&&g.parentNode===l&&h.Hd(g)?this.b=k:this.f=k)}}else this.c.push(Ws(h))}}}}}u(Ys,Xs);t(\"H.data.kml.Polygon\",Ys);function Zs(a,b){var c=document.createElement(\"CANVAS\");c.width=1;c.height=1;this.i=a;this.c={};this.f={};this.g=new uj(c);this.b=b||\"\"}Zs.prototype.create=function(a){this.a=new Ts(a,this.i);return $s(this,a,null)};\nfunction $s(a,b,c){b=b.childNodes;for(var d=b.length,e,f={},g;d--;){var h=b[d];switch(h.nodeName){case \"Point\":e=new Us(h);g=at(a,\"Marker\");e=new xn(e.a,g);g.bi&&Be(g.bi,\"statechange\",A(a.j,a,g.bi,e,g),!1);break;case \"LineString\":e=new Vs(h);g=at(a,\"Polyline\");e=new nh(Ws(e),g);break;case \"LinearRing\":e=new Vs(h);g=at(a,\"Polyline\");e=new nh(Ws(e),g);break;case \"Polygon\":e=new Ys(h);g=at(a,\"Polygon\");g.elevation=e.f;g.extrusion=e.b;e=new Mh(new O(e.a,e.c),g);break;case \"MultiGeometry\":e=new P,e=$s(a,\nh,e)}e&&(a.a.name&&(f.name=a.a.name),a.a.description&&(f.description=a.a.description),g&&g.pf&&(f.balloonStyle=g.pf),f.kmlNode=a.a.Sn,e.setData(f),c&&c.ca(e))}c&&(e=c);return e}Zs.prototype.j=function(a,b,c){var d=c.anchor,e=c.scale;c=e+\"_\"+d.x+d.y+d.Vc+d.zc+\"_\"+c.href;var f={};if(1===a.getState()){var g=this.c[c];if(!g){var h=d.x;var k=d.y;if(g=a.yb())g={w:g.w*e,h:g.h*e},f.size=g;h=d.Vc&&g?g.w*h:h*e;k=d.zc&&g?g.h*(1-k):!d.zc&&g?g.h-k*e:k*e;f.anchor={x:h,y:k};g=new uj(a.Sc(),f);this.c[c]=g}b.Hc(g)}delete this.f[c]};\nfunction at(a,b){var c=a.a,d={visibility:c.visibility};var e=new Es;var f=1;var g={x:0,y:0,Vc:!1,zc:!1};var h=bt(a,c.Nl);c.Wj&&(h=bt(a,c.Wj,h));switch(b){case \"Marker\":if(h&&h.Nj){e=h.Nj;e.scale&&(f=e.scale);if(e.Lj){var k=e.Lj;g={x:k.x,y:k.y,Vc:k.Vc,zc:k.zc}}e.icon&&e.icon.href?(b=e.icon.href,ct.test(b)||(b=a.b+b),e=f+\"_\"+g.x+g.y+g.Vc+g.zc+\"_\"+b,k=a.c[e]||a.f[e],k||(k=new uj(b),a.f[e]=k),0===k.getState()?(d.icon=a.g,d.bi=k,d.href=b,d.anchor=g,d.scale=f):1===k.getState()&&(d.icon=k)):1!==f&&(k||(g=\n{x:14,y:4,Vc:!1,zc:!1}),a={w:28*f,h:36*f},f={size:new Zh(a.w,a.h),anchor:new I(g.Vc?a.w*g.x:g.x*f,g.zc?a.h*(1-g.y):a.h-g.y*f),hitArea:new $h(3,[0*f,16*f,0*f,7*f,8*f,0*f,18*f,0*f,26*f,7*f,26*f,16*f,18*f,34*f,8*f,34*f])},d.icon=new uj('<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"28px\" height=\"36px\"><path d=\"M 19 31 C 19 32.7 16.3 34 13 34 C 9.7 34 7 32.7 7 31 C 7 29.3 9.7 28 13 28 C 16.3 28 19 29.3 19 31 Z\" fill=\"#000\" fill-opacity=\".2\"/><path d=\"M 13 0 C 9.5 0 6.3 1.3 3.8 3.8 C 1.4 7.8 0 9.4 0 12.8 C 0 16.3 1.4 19.5 3.8 21.9 L 13 31 L 22.2 21.9 C 24.6 19.5 25.9 16.3 25.9 12.8 C 25.9 9.4 24.6 6.1 22.1 3.8 C 19.7 1.3 16.5 0 13 0 Z\" fill=\"#fff\"/><path d=\"M 13 2.2 C 6 2.2 2.3 7.2 2.1 12.8 C 2.1 16.1 3.1 18.4 5.2 20.5 L 13 28.2 L 20.8 20.5 C 22.9 18.4 23.8 16.2 23.8 12.8 C 23.6 7.07 20 2.2 13 2.2 Z\" fill=\"#18d\"/></svg>',\nf))}break;case \"Polyline\":d.style={};h&&h.Vd&&(f=h.Vd,d.style.strokeColor=\"rgba(\"+Hs(e,f.uf.color,!0)+\")\",0<=f.width&&(d.style.lineWidth=f.width));break;case \"Polygon\":d.style={},h&&(h.Vd&&(f=h.Vd,d.style.strokeColor=\"rgba(\"+Hs(e,f.uf.color,!0)+\")\",0<=f.width&&(d.style.lineWidth=f.width)),h.xk&&(f=h.xk,d.style.fillColor=f.fill?\"rgba(\"+Hs(e,f.uf.color,!0)+\")\":\"rgba(0,0,0,0)\",f.outline||(d.style.lineWidth=0)))}d.pf=h.pf;return d}\nfunction bt(a,b,c){c=c||{};for(var d in b)b.hasOwnProperty(d)&&(c[d]=\"object\"===typeof b[d]?bt(a,b[d],c[d]):b[d]);return c}var ct=/^[^:\\/]+:/;function dt(a){tc(this,dt);this.url=a;this.b=[];this.a=y;this.c=A(this.c,this);F.call(this)}u(dt,F);t(\"H.data.AbstractReader\",dt);var et={ERROR:-1,LOADING:0,VISIT:1,READY:2};dt.State=et;dt.prototype.f=et.READY;dt.prototype.j={sl:\"statechange\"};dt.prototype.xb=function(){if(!this.a){this.a=new N;var a=this.a.fc();a.cc(this.b)}return new pl(this.a)};dt.prototype.getLayer=dt.prototype.xb;dt.prototype.Hm=function(){return this.b.concat([])};dt.prototype.getParsedObjects=dt.prototype.Hm;\ndt.prototype.S=function(){return this.url};dt.prototype.getUrl=dt.prototype.S;dt.prototype.ho=function(a){if(this.f===et.LOADING||this.f===et.VISIT)throw Error(\"InvalidState: state \"+this.f);this.b=[];this.a=y;this.url=a;return this};dt.prototype.setUrl=dt.prototype.ho;dt.prototype.getState=function(){return this.f};dt.prototype.getState=dt.prototype.getState;dt.prototype.R=function(a,b,c){this.f=a;this.dispatchEvent(new ft(b||this,this.j.sl,a,c||\"\"))};\ndt.prototype.parse=function(){var a=this;sc(this.url)?(this.R(et.LOADING),(new qf(\"text/plain\",this.url)).then(function(b){try{a.c(b)}catch(c){a.R(et.ERROR,y,c.message)}},function(){a.R(et.ERROR,y,\"Error loading file\")})):a.R(et.ERROR,y,\"File url was not set\")};dt.prototype.parse=dt.prototype.parse;function ft(a,b,c,d){ft.l.constructor.call(this,b,a);this.state=c;this.message=d}u(ft,qd);function gt(a){var b=a?a.lastIndexOf(\"/\"):B;this.g=[];dt.call(this,a);0<=b&&(this.i=a.substr(0,b)+\"/\")}u(gt,dt);t(\"H.data.kml.Reader\",gt);\ngt.prototype.c=function(a){var b,c=null;if(a&&\"\"!=a.trim()){try{var d=(new DOMParser).parseFromString(a,\"text/xml\")}catch(h){this.R(et.ERROR,void 0,\"Error parsing KML document\");return}if(d.getElementsByTagName(\"parsererror\").length)this.R(et.ERROR,void 0,\"Error parsing KML document\");else if((a=d.childNodes&&\"kml\"===d.childNodes[0].nodeName?d.childNodes[0]:void 0)&&(b=ht(a.childNodes,\"Document\")[0]),b=b||a){d=new Ss;for(var e=ht(b.childNodes,\"Style\"),f=ht(b.childNodes,\"StyleMap\"),g=e.length;g--;)a=\nnew Ps(e[g]),d.Eg(a);for(g=f.length;g--;)a=new Rs(f[g],d),d.Eg(a);this.o=d;this.m=new Zs(this.o,this.i);a=b.childNodes;for(b=a.length;b--;)if(e=a[b],d=c,\"Placemark\"===e.nodeName?(e=this.m.create(e))&&it(this,e,d):\"Folder\"===e.nodeName&&(e={group:new P,node:e},it(this,e.group,d),this.g.push(e)),!b&&(d=this.g.shift()))a=d.node.childNodes,c=d.group,b=a.length;this.R(et.READY)}else this.R(et.ERROR,void 0,\"Invalid KML document\")}else this.R(et.ERROR,void 0,\"Unable to create objects from the empty data\")};\nfunction it(a,b,c){c?c.ca(b):(a.a&&a.a.fc().ca(b),a.b.push(b),a.R(et.VISIT,b))}function ht(a,b){for(var c=a.length,d,e=[];c--;)d=a[c],d.nodeName===b&&e.push(d);return e};function jt(a,b){this.b=a;this.a=b}\njt.prototype.create=function(a,b){var c=a.coordinates;switch(a.type){case \"Point\":var d=new xn(kt(c));break;case \"LineString\":d=new nh(lt(c));break;case \"Polygon\":d=new Mh(mt(c));break;case \"MultiPoint\":var e=0;var f=c.length;d=[];if(this.a){for(;e<f;e++)d.push(kt(c[e]));c=new xn(new Yh(d))}else{for(;e<f;e++)d.push(new xn(kt(c[e])));c=new P;c.cc(d)}d=c;f=\"multiPoint\";break;case \"MultiLineString\":e=0;f=c.length;d=[];if(this.a){for(;e<f;e++)d.push(lt(c[e]));c=new nh(new mh(d))}else{for(;e<f;e++)d.push(new nh(lt(c[e])));\nc=new P;c.cc(d)}d=c;f=\"multiLineString\";break;case \"MultiPolygon\":d=[];e=0;f=c.length;if(this.a){for(;e<f;e++)d.push(mt(c[e]));c=new Mh(new Kh(d))}else{for(;e<f;e++)d.push(new Mh(mt(c[e])));c=new P;c.cc(d)}d=c;f=\"multiPolygon\";break;case \"GeometryCollection\":c=d=new P;e=a.geometries;f=0;for(var g=e.length;f<g;f++)this.create(e[f],c);f=\"geometryCollection\"}d&&(c=d,e=a.properties,a=a.id,g={},e&&(this.a?g=e:g.properties=e),f&&!this.a&&(g[f]=!0),a&&c.zi(a),c.setData(g),this.b(d));b&&d&&b.ca(d);return d};\njt.prototype.create=jt.prototype.create;function kt(a){return new Wf(a[1],a[0])}function mt(a){for(var b=lt(a[0]),c=[],d,e=1,f=a.length;e<f;e++)d=lt(a[e]),c.push(d);return new O(b,c)}function lt(a){for(var b=0,c=a.length,d=new L;b<c;b++)d.pd(kt(a[b]));return d};function nt(a,b){b=b||{};this.i=b.style||this.Dd;(this.g=!!b.disableLegacyMode)||window.console.warn(\"H.data.geojson.Reader: Legacy parser is enabled in GeoJSON Reader. Features like Multi-Geometries, Polygon interiors and GeoJSON feature properties might not work as expected. To maximise compatibility with the remote services it is recommended to set the `disableLegacyMode` flag to true.\");dt.call(this,a)}u(nt,dt);t(\"H.data.geojson.Reader\",nt);\nnt.prototype.c=function(a){var b,c;try{var d=\"string\"===typeof a?JSON.parse(a):a;if(\"object\"===typeof d){var e=new jt(this.i,this.g);switch(d.type){case \"FeatureCollection\":if(b=d.features){var f=new P;ot(this,f);for(c=0;c<b.length;c++){var g=pt(b[c]);(g=e.create(g))&&f.ca(g)}}break;case \"Feature\":g=pt(d);(g=e.create(g))&&ot(this,g);break;default:(g=e.create(d))&&ot(this,g)}this.R(et.READY)}else this.R(et.ERROR,void 0,\"Invalid syntax\")}catch(h){this.R(et.ERROR,void 0,\"Parse error. \"+h.message)}};\nnt.prototype.Rn=function(a){this.R(et.LOADING);this.c(a)};nt.prototype.parseData=nt.prototype.Rn;nt.prototype.Dd=function(){};function pt(a){var b={};if(a.geometry){var c=a.geometry;b.type=c.type;b.properties=a.properties;c.coordinates&&(b.coordinates=c.coordinates);c.geometries&&(b.geometries=c.geometries);a.id&&(b.id=a.id)}return b}function ot(a,b){a.a&&a.a.fc().ca(b);a.b.push(b);a.R(et.VISIT,b)};t(\"H.data.buildInfo\",function(){return Df(\"H-data\",\"1.16.0\",\"7c1ba10\")});\n"
);