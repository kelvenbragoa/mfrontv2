import{u as b,a as y,r as u,o as k,b as v,c as i,d as r,e,F as w,v as L,h as V,f as l,w as j,g as m,t as c,R as B}from"./index-b670bd76.js";import{b as D,s as R}from"./APIConstant-43486e71.js";import"./index.esm-a7e89c92.js";import{h as n}from"./moment-a9aaa855.js";import"./lodash-7cd6c7cd.js";const S={key:0,class:"surface-0 flex justify-content-center"},E=e("p",null,"Carregando...",-1),C=[E],T={key:1,class:"surface-0 flex justify-content-center"},$={id:"home",class:"landing-wrapper overflow-hidden"},F={id:"features",class:"py-4 px-4 lg:px-8 mt-5 mx-0 lg:mx-8"},M={class:"grid justify-content-left"},N=e("div",{class:"col-12 text-left mt-8 mb-4"},[e("h2",{class:"text-900 font-normal mb-2"},"Eventos Populares"),e("span",{class:"text-600 text-2xl"},"Explore eventos, shows, teatros e muitos mais...")],-1),U={class:"grid"},A={class:"border-4 surface-border border-round m-3"},P={class:"mb-3"},q={class:"relative mx-auto"},z=["src"],G={class:"mb-2 font-medium"},H={class:"mb-3 font-medium"},I={class:"mb-3 font-bold text-2xl"},J={class:"flex justify-content-between align-items-center mb-1"},K={class:"flex justify-content-between align-items-center"},O={class:"mt-0 font-semibold text-xl"},te={__name:"index",setup(Q){b();const p=y(),d=u(!0),_=u({data:[]});u([{breakpoint:"1024px",numVisible:3,numScroll:3},{breakpoint:"768px",numVisible:2,numScroll:2},{breakpoint:"560px",numVisible:1,numScroll:1}]);const f=o=>{var s=n(),a=n(o);return s>a?"Encerrado":"A Venda"},h=o=>{var s=n(),a=n(o);return s>a?"danger":"success"},x=async(o=1)=>{V.get(`${D}/homepage?page=${o}`).then(s=>{_.value=s.data,d.value=!1}).catch(s=>{d.value=!1,p.add({severity:"error",summary:`${s}`,detail:"Message Detail",life:3e3})})};return k(()=>{x()}),(o,s)=>{const a=v("Tag"),g=v("Button");return d.value?(i(),r("div",S,C)):(i(),r("div",T,[e("div",$,[e("div",F,[e("div",M,[N,e("div",U,[(i(!0),r(w,null,L(_.value.events.data,t=>(i(),r("div",{class:"col-12 lg:col-6 xl:col-4",key:t.id},[l(m(B),{to:"/eventos/"+t.id,style:{"text-decoration":"none",color:"inherit"}},{default:j(()=>[e("div",A,[e("div",P,[e("div",q,[e("img",{src:m(R)+t.image,class:"w-full border-round hover:scale-110 transition duration-500 cursor-pointer object-cover"},null,8,z)])]),e("div",G,c(t.user.company_name),1),e("div",H,c(t.province.name),1),e("div",I,c(t.name),1),e("div",J,[l(a,{value:t.type.name,severity:"info"},null,8,["value"]),e("span",null,[l(a,{value:f(t.end_date),severity:h(t.end_date)},null,8,["value","severity"])])]),e("div",K,[e("div",O,c(m(n)(t.start_date).format("LL")),1),e("span",null,[l(g,{icon:"pi pi-eye",severity:"secondary",outlined:""})])])])]),_:2},1032,["to"])]))),128))])])])])]))}}};export{te as default};
