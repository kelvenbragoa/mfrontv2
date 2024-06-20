import{g as M,d as E}from"./index.esm-a7e89c92.js";var F={exports:{}};function $(o,n){return n={exports:{}},o(n,n.exports),n.exports}var g={symbol:"$",format:"%s%v",decimal:".",thousand:",",precision:2,grouping:3,stripZeros:!1,fallback:0};function N(o){var n=arguments.length<=1||arguments[1]===void 0?g.decimal:arguments[1],l=arguments.length<=2||arguments[2]===void 0?g.fallback:arguments[2];if(Array.isArray(o))return o.map(function(i){return N(i,n,l)});if(typeof o=="number")return o;var u=new RegExp("[^0-9-(-)-"+n+"]",["g"]),a=(""+o).replace(u,"").replace(n,".").replace(/\(([-]*\d*[^)]?\d+)\)/g,"-$1").replace(/\((.*)\)/,""),s=(a.match(/-/g)||2).length%2,t=parseFloat(a.replace(/-/g,"")),e=t*(s?-1:1);return isNaN(e)?l:e}function H(o,n){return o=Math.round(Math.abs(o)),isNaN(o)?n:o}function x(o,n){n=H(n,g.precision);var l=Math.pow(10,n);return(Math.round((o+1e-8)*l)/l).toFixed(n)}var v=$(function(o){var n=Object.prototype.hasOwnProperty,l=Object.prototype.propertyIsEnumerable;function u(a){if(a==null)throw new TypeError("Object.assign cannot be called with null or undefined");return Object(a)}o.exports=Object.assign||function(a,s){for(var t,e=u(a),i,r=1;r<arguments.length;r++){t=Object(arguments[r]);for(var h in t)n.call(t,h)&&(e[h]=t[h]);if(Object.getOwnPropertySymbols){i=Object.getOwnPropertySymbols(t);for(var d=0;d<i.length;d++)l.call(t,i[d])&&(e[i[d]]=t[i[d]])}}return e}}),C=v&&typeof v=="object"&&"default"in v?v.default:v;function T(o,n){var l=o.split(n),u=l[0],a=l[1].replace(/0+$/,"");return a.length>0?u+n+a:u}function _(o){var n=arguments.length<=1||arguments[1]===void 0?{}:arguments[1];if(Array.isArray(o))return o.map(function(t){return _(t,n)});n=C({},g,n);var l=o<0?"-":"",u=parseInt(x(Math.abs(o),n.precision),10)+"",a=u.length>3?u.length%3:0,s=l+(a?u.substr(0,a)+n.thousand:"")+u.substr(a).replace(/(\d{3})(?=\d)/g,"$1"+n.thousand)+(n.precision>0?n.decimal+x(Math.abs(o),n.precision).split(".")[1]:"");return n.stripZeros?T(s,n.decimal):s}var S=$(function(o){var n=String.prototype.valueOf,l=function(e){try{return n.call(e),!0}catch{return!1}},u=Object.prototype.toString,a="[object String]",s=typeof Symbol=="function"&&typeof Symbol.toStringTag=="symbol";o.exports=function(e){return typeof e=="string"?!0:typeof e!="object"?!1:s?l(e):u.call(e)===a}}),A=S&&typeof S=="object"&&"default"in S?S.default:S;function q(o){return A(o)&&o.match("%v")?{pos:o,neg:o.replace("-","").replace("%v","-%v"),zero:o}:o}function j(o){var n=arguments.length<=1||arguments[1]===void 0?{}:arguments[1];if(Array.isArray(o))return o.map(function(a){return j(a,n)});n=C({},g,n);var l=q(n.format),u=void 0;return o>0?u=l.pos:o<0?u=l.neg:u=l.zero,u.replace("%s",n.symbol).replace("%v",_(Math.abs(o),n))}function P(o){var n=arguments.length<=1||arguments[1]===void 0?{}:arguments[1];if(!o)return[];n=C({},g,n);var l=q(n.format),u=l.pos.indexOf("%s")<l.pos.indexOf("%v"),a=0,s=o.map(function(t){if(Array.isArray(t))return P(t,n);t=N(t,n.decimal);var e=void 0;t>0?e=l.pos:t<0?e=l.neg:e=l.zero;var i=e.replace("%s",n.symbol).replace("%v",_(Math.abs(t),n));return i.length>a&&(a=i.length),i});return s.map(function(t){return A(t)&&t.length<a?u?t.replace(n.symbol,n.symbol+new Array(a-t.length+1).join(" ")):new Array(a-t.length+1).join(" ")+t:t})}const I=Object.freeze(Object.defineProperty({__proto__:null,format:j,formatColumn:P,formatMoney:j,formatNumber:_,parse:N,settings:g,toFixed:x,unformat:N},Symbol.toStringTag,{value:"Module"})),k=M(I);(function(o,n){(function(l,u){o.exports=u(k)})(typeof self<"u"?self:E,function(l){return function(u){function a(t){if(s[t])return s[t].exports;var e=s[t]={i:t,l:!1,exports:{}};return u[t].call(e.exports,e,e.exports,a),e.l=!0,e.exports}var s={};return a.m=u,a.c=s,a.d=function(t,e,i){a.o(t,e)||Object.defineProperty(t,e,{configurable:!1,enumerable:!0,get:i})},a.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return a.d(e,"a",e),e},a.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},a.p="",a(a.s=1)}([function(u,a,s){var t=s(4);s.n(t),a.a={name:"VueNumeric",props:{allowClear:{type:Boolean,default:!1,required:!1},currency:{type:String,default:"",required:!1},max:{type:Number,default:Number.MAX_SAFE_INTEGER||9007199254740991,required:!1},min:{type:Number,default:Number.MIN_SAFE_INTEGER||-9007199254740991,required:!1},minus:{type:Boolean,default:!1,required:!1},placeholder:{type:String,default:"",required:!1},emptyValue:{type:[Number,String],default:"",required:!1},precision:{type:Number,default:0,required:!1},separator:{type:String,default:",",required:!1},thousandSeparator:{default:void 0,required:!1,type:String},decimalSeparator:{default:void 0,required:!1,type:String},outputType:{required:!1,type:String,default:"Number"},value:{type:[Number,String],default:0,required:!0},readOnly:{type:Boolean,default:!1,required:!1},readOnlyClass:{type:String,default:"",required:!1},disabled:{type:Boolean,default:!1,required:!1},currencySymbolPosition:{type:String,default:"prefix",required:!1}},data:function(){return{amount:""}},computed:{amountNumber:function(){return this.unformat(this.amount)},valueNumber:function(){return this.unformat(this.value)},decimalSeparatorSymbol:function(){return this.decimalSeparator!==void 0?this.decimalSeparator:this.separator===","?".":","},thousandSeparatorSymbol:function(){return this.thousandSeparator!==void 0?this.thousandSeparator:this.separator==="."?".":this.separator==="space"?" ":","},symbolPosition:function(){return this.currency?this.currencySymbolPosition==="suffix"?"%v %s":"%s %v":"%v"}},watch:{valueNumber:function(e){this.$refs.numeric!==document.activeElement&&(this.amount=this.format(e))},readOnly:function(e,i){var r=this;i===!1&&e===!0&&this.$nextTick(function(){r.$refs.readOnly.className=r.readOnlyClass})},separator:function(){this.process(this.valueNumber),this.amount=this.format(this.valueNumber)},currency:function(){this.process(this.valueNumber),this.amount=this.format(this.valueNumber)},precision:function(){this.process(this.valueNumber),this.amount=this.format(this.valueNumber)}},mounted:function(){var e=this;(this.valueNumber||this.isDeliberatelyZero())&&(this.process(this.valueNumber),this.amount=this.format(this.valueNumber),setTimeout(function(){e.process(e.valueNumber),e.amount=e.format(e.valueNumber)},500)),this.readOnly&&(this.$refs.readOnly.className=this.readOnlyClass)},methods:{onChangeHandler:function(e){this.$emit("change",e)},onBlurHandler:function(e){this.$emit("blur",e),this.amount=this.format(this.valueNumber)},onFocusHandler:function(e){if(this.$emit("focus",e),typeof this.valueNumber=="string"&&this.valueNumber==="")return"";this.amount=Object(t.formatMoney)(this.valueNumber,{symbol:"",format:"%v",thousand:"",decimal:this.decimalSeparatorSymbol,precision:Number(this.precision)})},onInputHandler:function(){this.process(this.amountNumber)},process:function(e){typeof e=="string"&&e===""?this.$emit("input",e):(e>=this.max&&this.update(this.max),e<=this.min&&this.update(this.min),e>this.min&&e<this.max&&this.update(e),!this.minus&&e<0&&(this.min>=0?this.update(this.min):this.update(0)))},update:function(e){var i=Object(t.toFixed)(e,this.precision),r=this.outputType.toLowerCase()==="string"?i:Number(i);this.$emit("input",r)},format:function(e){return typeof e=="string"&&e===""?"":Object(t.formatMoney)(e,{symbol:this.currency,format:this.symbolPosition,precision:Number(this.precision),decimal:this.decimalSeparatorSymbol,thousand:this.thousandSeparatorSymbol})},unformat:function(e){var i=typeof e=="string"&&e===""?this.emptyValue:e;return typeof i=="string"&&i===""?"":Object(t.unformat)(i,this.decimalSeparatorSymbol)},isDeliberatelyZero:function(){return this.valueNumber===0&&this.value!==""}}}},function(u,a,s){Object.defineProperty(a,"__esModule",{value:!0});var t=s(2),e={install:function(i){i.component(t.a.name,t.a)}};t.a.install=e.install,a.default=t.a},function(u,a,s){var t=s(0),e=s(5),i=s(3),r=i(t.a,e.a,!1,null,null,null);a.a=r.exports},function(u,a){u.exports=function(s,t,e,i,r,h){var d,m=s=s||{},y=typeof s.default;y!=="object"&&y!=="function"||(d=s,m=s.default);var c=typeof m=="function"?m.options:m;t&&(c.render=t.render,c.staticRenderFns=t.staticRenderFns,c._compiled=!0),e&&(c.functional=!0),r&&(c._scopeId=r);var f;if(h?(f=function(p){p=p||this.$vnode&&this.$vnode.ssrContext||this.parent&&this.parent.$vnode&&this.parent.$vnode.ssrContext,p||typeof __VUE_SSR_CONTEXT__>"u"||(p=__VUE_SSR_CONTEXT__),i&&i.call(this,p),p&&p._registeredComponents&&p._registeredComponents.add(h)},c._ssrRegister=f):i&&(f=i),f){var b=c.functional,O=b?c.render:c.beforeCreate;b?(c._injectStyles=f,c.render=function(p,w){return f.call(w),O(p,w)}):c.beforeCreate=O?[].concat(O,f):[f]}return{esModule:d,exports:m,options:c}}},function(u,a){u.exports=l},function(u,a,s){var t=function(){var r=this,h=r.$createElement,d=r._self._c||h;return(r.allowClear?"search":"tel")!="checkbox"||r.readOnly?(r.allowClear?"search":"tel")!="radio"||r.readOnly?r.readOnly?d("span",{ref:"readOnly"},[r._v(r._s(r.amount))]):d("input",{directives:[{name:"model",rawName:"v-model",value:r.amount,expression:"amount"}],ref:"numeric",attrs:{placeholder:r.placeholder,disabled:r.disabled,type:r.allowClear?"search":"tel"},domProps:{value:r.amount},on:{blur:r.onBlurHandler,input:[function(m){m.target.composing||(r.amount=m.target.value)},r.onInputHandler],focus:r.onFocusHandler,change:r.onChangeHandler}}):d("input",{directives:[{name:"model",rawName:"v-model",value:r.amount,expression:"amount"}],ref:"numeric",attrs:{placeholder:r.placeholder,disabled:r.disabled,type:"radio"},domProps:{checked:r._q(r.amount,null)},on:{blur:r.onBlurHandler,input:r.onInputHandler,focus:r.onFocusHandler,change:[function(m){r.amount=null},r.onChangeHandler]}}):d("input",{directives:[{name:"model",rawName:"v-model",value:r.amount,expression:"amount"}],ref:"numeric",attrs:{placeholder:r.placeholder,disabled:r.disabled,type:"checkbox"},domProps:{checked:Array.isArray(r.amount)?r._i(r.amount,null)>-1:r.amount},on:{blur:r.onBlurHandler,input:r.onInputHandler,focus:r.onFocusHandler,change:[function(m){var y=r.amount,c=m.target,f=!!c.checked;if(Array.isArray(y)){var b=r._i(y,null);c.checked?b<0&&(r.amount=y.concat([null])):b>-1&&(r.amount=y.slice(0,b).concat(y.slice(b+1)))}else r.amount=f},r.onChangeHandler]}})},e=[],i={render:t,staticRenderFns:e};a.a=i}])})})(F);
