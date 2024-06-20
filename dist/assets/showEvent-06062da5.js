import{u as V,r as o,a as D,K as S,o as C,b as h,c as u,d as g,e,t as s,g as i,j as l,f as r,k as P,w as p,l as R,h as q,R as E,F as U,v as A}from"./index-b670bd76.js";import{b as N,s as T}from"./APIConstant-43486e71.js";import{h as n}from"./moment-a9aaa855.js";const j={key:0,id:"features",class:"py-4 px-4 lg:px-8 mt-5 mx-0 lg:mx-8"},F={class:"grid justify-content-left"},$={class:"col-12 text-left mt-8 mb-4"},I={class:"text-900 font-normal mb-2"},M={class:"text-600 text-2xl"},K={class:"col-12 md:col-12 lg:col-4 p-0 lg:pr-5 lg:pb-5 mt-4 lg:mt-0"},O={style:{padding:"2px","border-radius":"10px",background:"linear-gradient(90deg, rgba(253, 228, 165, 0.2), rgba(187, 199, 205, 0.2)), linear-gradient(180deg, rgba(253, 228, 165, 0.2), rgba(187, 199, 205, 0.2))"}},Q={class:"p-3 surface-card h-full",style:{"border-radius":"8px"}},W=e("h5",{class:"mb-2 text-900"},"Informações",-1),z={class:"text-600"},G=e("i",{class:"pi pi-fw pi-clock text-2xl"},null,-1),H={class:"text-600"},J=e("i",{class:"pi pi-fw pi-tags text-2xl"},null,-1),X={class:"text-600"},Y=e("i",{class:"pi pi-fw pi-map-marker text-2xl"},null,-1),Z={class:"col-12 md:col-12 lg:col-8 p-0 lg:pr-5 lg:pb-5 mt-4 lg:mt-0"},ee={style:{padding:"2px","border-radius":"10px",background:"linear-gradient(90deg, rgba(253, 228, 165, 0.2), rgba(187, 199, 205, 0.2)), linear-gradient(180deg, rgba(253, 228, 165, 0.2), rgba(187, 199, 205, 0.2))"}},te={class:"p-3 surface-card h-full",style:{"border-radius":"8px"}},se={class:"text-600"},ae=["src"],oe={class:"text-900 font-normal mb-2"},le={class:"text-600"},ne=e("i",{class:"pi pi-fw pi-thumbs-up-fill"},null,-1),re=e("p",{class:"mt-4"},[e("strong",null,"Informações")],-1),ie={class:"text-600"},ce=e("i",{class:"pi pi-fw pi-map-marker"},null,-1),de={class:"text-600"},ue=e("i",{class:"pi pi-fw pi-at"},null,-1),pe={class:"text-600"},_e=e("i",{class:"pi pi-fw pi-mobile"},null,-1),me=e("hr",null,null,-1),he=e("p",{class:"mt-4"},[e("strong",null,"Descrição")],-1),ge={class:"text-600"},ve=e("hr",null,null,-1),fe=e("p",{class:"mt-4"},[e("strong",null,"LineUps")],-1),be=e("hr",null,null,-1),xe=e("p",{class:"mt-4"},[e("strong",null,"Dúvidas")],-1),ke=e("p",{class:"line-height-3 m-0"},"Em caso de cancelamento do evento o promotor irá informar em relação a proxima data.",-1),ye=e("p",{class:"line-height-3 m-0"},"A aquisição dos ingressos para eventos só serão aceites se forem adiquiridos a partir da plataforma.",-1),we=e("p",{class:"line-height-3 m-0"},"Após a aquisição do ingresso irá receber o mesmo em forma de QrCode, baste que apresente na portaria.",-1),Le={key:1,class:"text-center"},Be=e("p",null,"Por Favor Aguarde...",-1),Pe={__name:"showEvent",setup(Ve){const f=V(),v=o(!0);o(!1),o(!1);const t=o(),b=o(),x=D();o([]),o([]),S(),o([{breakpoint:"1024px",numVisible:3,numScroll:3},{breakpoint:"768px",numVisible:2,numScroll:2},{breakpoint:"560px",numVisible:1,numScroll:1}]);const k=a=>{var _=n(),c=n(a);return _>c?"Encerrado":"A Venda"},y=a=>{var _=n(),c=n(a);return _>c?"danger":"success"},w=()=>{q.get(`${N}/eventos/${f.currentRoute.value.params.id}`).then(a=>{t.value=a.data.events,b.value=a.data.event_recomended,v.value=!1}).catch(a=>{v.value=!1,x.add({severity:"error",summary:`${a}`,detail:"Message Detail",life:3e3}),goBackUsingBack()})};return C(()=>{w()}),(a,_)=>{const c=h("Tag"),L=h("Button"),m=h("Panel"),B=h("ProgressSpinner");return v.value?(u(),g("div",Le,[r(B,{style:{width:"50px",height:"50px"},strokeWidth:"8",fill:"var(--surface-ground)",animationDuration:".5s","aria-label":"Custom ProgressSpinner"}),Be])):(u(),g("div",j,[e("div",F,[e("div",$,[e("h2",I,s(t.value.name),1),e("span",M,s(i(n)(t.value.start_date).format("LL"))+", "+s(t.value.address)+", "+s(t.value.province.name),1)]),e("div",K,[e("div",O,[e("div",Q,[W,e("p",null,[e("span",z,[G,l(" "+s(i(n)(t.value.start_date).format("LL")),1)])]),e("p",null,[e("span",H,[J,l(" "+s(t.value.tickets.length)+" Bilhetes disponíveis",1)])]),e("p",null,[e("span",X,[Y,l(" "+s(t.value.city.name)+", "+s(t.value.province.name),1)])]),e("p",null,[r(c,{value:k(t.value.end_date),severity:y(t.value.end_date),style:{right:"6px",top:"5px"}},null,8,["value","severity"])]),i(n)()<i(n)(t.value.end_date)?(u(),P(i(E),{key:0,to:"/checkout/"+t.value.id+"/evento"},{default:p(()=>[r(L,{label:"Comprar",class:"p-button-rounded border-none font-light text-white line-height-2 bg-blue-500"})]),_:1},8,["to"])):R("",!0)])])]),e("div",Z,[e("div",ee,[e("div",te,[e("span",se,s(t.value.city.name)+", "+s(t.value.province.name)+" "+s(t.value.address)+".",1),e("img",{src:i(T)+t.value.image,class:"w-full border-round hover:scale-110 transition duration-500 cursor-pointer object-cover"},null,8,ae),e("h2",oe,s(t.value.name),1),e("p",null,[e("span",le,[e("strong",null,s(t.value.like.length),1),ne,l(" | "+s(t.value.tickets.length)+" Bilhetes ",1)])]),re,e("p",null,[e("span",ie,[ce,l(" "+s(t.value.city.name)+", "+s(t.value.province.name),1)])]),e("p",null,[e("span",de,[ue,l(s(t.value.user.email),1)])]),e("p",null,[e("span",pe,[_e,l(s(t.value.user.mobile),1)])]),me,he,e("p",null,[e("span",ge,s(t.value.description),1)]),ve,fe,r(m,{header:t.value.lineups.length+" LineUp",toggleable:!0,collapsed:!0,class:"mb-1"},{default:p(()=>[(u(!0),g(U,null,A(t.value.lineups,d=>(u(),g("p",{class:"line-height-3 m-0",key:d.id},[e("strong",null,s(d.name),1),l(" : "+s(d.description)+" - "+s(d.start_time)+" - "+s(d.end_time),1)]))),128))]),_:1},8,["header"]),be,xe,r(m,{header:"Em caso de cancelamento de evento?",toggleable:!0,collapsed:!0,class:"mb-1"},{default:p(()=>[ke]),_:1}),r(m,{header:"Os ingressos não adiquiridos na plataforma mticket?",toggleable:!0,collapsed:!0,class:"mb-1"},{default:p(()=>[ye]),_:1}),r(m,{header:"Como é feito o scan",toggleable:!0,collapsed:!0,class:"mb-1"},{default:p(()=>[we]),_:1})])])])])]))}}};export{Pe as default};