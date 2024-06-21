import{u as V,a as B,r as x,o as C,b as p,c as b,d as f,f as t,w as o,e,t as i,g as a,F as P,h as T,j as c,R as _}from"./index-13ef8100.js";import{b as q}from"./APIConstant-069209c7.js";import"./index.esm-7b5acfa1.js";import"./moment-a9aaa855.js";import"./lodash-ca50940c.js";const L=e("i",{class:"pi pi-angle-left"},null,-1),M={key:0,class:"grid"},N={class:"col-12 lg:col-6 xl:col-3"},F={class:"card mb-0"},Q={class:"flex justify-content-between mb-3"},S=e("span",{class:"block text-500 font-medium mb-3"},"Bilhetes",-1),E={class:"text-900 font-medium text-xl"},U=e("div",{class:"flex align-items-center justify-content-center bg-blue-100 border-round",style:{width:"2.5rem",height:"2.5rem"}},[e("i",{class:"pi pi-shopping-cart text-blue-500 text-xl"})],-1),$=e("i",{class:"pi pi-eye text-blue-500 text-xl"},null,-1),I={class:"col-12 lg:col-6 xl:col-3"},A={class:"card mb-0"},W={class:"flex justify-content-between mb-3"},z=e("span",{class:"block text-500 font-medium mb-3"},"Pacotes",-1),G={class:"text-900 font-medium text-xl"},H=e("div",{class:"flex align-items-center justify-content-center bg-orange-100 border-round",style:{width:"2.5rem",height:"2.5rem"}},[e("i",{class:"pi pi-map-marker text-orange-500 text-xl"})],-1),J=e("i",{class:"pi pi-eye text-blue-500 text-xl"},null,-1),K={class:"col-12 lg:col-6 xl:col-3"},O={class:"card mb-0"},X={class:"flex justify-content-between mb-3"},Y=e("span",{class:"block text-500 font-medium mb-3"},"Convites",-1),Z={class:"text-900 font-medium text-xl"},ee=e("div",{class:"flex align-items-center justify-content-center bg-cyan-100 border-round",style:{width:"2.5rem",height:"2.5rem"}},[e("i",{class:"pi pi-inbox text-cyan-500 text-xl"})],-1),te=e("i",{class:"pi pi-eye text-blue-500 text-xl"},null,-1),se={class:"col-12 lg:col-6 xl:col-3"},oe={class:"card mb-0"},le={class:"flex justify-content-between mb-3"},ie=e("span",{class:"block text-500 font-medium mb-3"},"LineUps",-1),ae={class:"text-900 font-medium text-xl"},de=e("div",{class:"flex align-items-center justify-content-center bg-purple-100 border-round",style:{width:"2.5rem",height:"2.5rem"}},[e("i",{class:"pi pi-comment text-purple-500 text-xl"})],-1),ce=e("i",{class:"pi pi-eye text-blue-500 text-xl"},null,-1),re={class:"col-12 lg:col-6 xl:col-3"},ne={class:"card mb-0"},ue={class:"flex justify-content-between mb-3"},_e=e("span",{class:"block text-500 font-medium mb-3"},"Bares",-1),he={class:"text-900 font-medium text-xl"},me=e("div",{class:"flex align-items-center justify-content-center bg-purple-100 border-round",style:{width:"2.5rem",height:"2.5rem"}},[e("i",{class:"pi pi-comment text-purple-500 text-xl"})],-1),pe=e("i",{class:"pi pi-eye text-blue-500 text-xl"},null,-1),ve={class:"col-12 lg:col-6 xl:col-3"},xe={class:"card mb-0"},be={class:"flex justify-content-between mb-3"},fe=e("span",{class:"block text-500 font-medium mb-3"},"Produtos",-1),ye={class:"text-900 font-medium text-xl"},ge=e("div",{class:"flex align-items-center justify-content-center bg-purple-100 border-round",style:{width:"2.5rem",height:"2.5rem"}},[e("i",{class:"pi pi-comment text-purple-500 text-xl"})],-1),we=e("i",{class:"pi pi-eye text-blue-500 text-xl"},null,-1),ke={class:"col-12 lg:col-6 xl:col-3"},je={class:"card mb-0"},De={class:"flex justify-content-between mb-3"},Re=e("span",{class:"block text-500 font-medium mb-3"},"Protocolos",-1),Ve={class:"text-900 font-medium text-xl"},Be=e("div",{class:"flex align-items-center justify-content-center bg-purple-100 border-round",style:{width:"2.5rem",height:"2.5rem"}},[e("i",{class:"pi pi-comment text-purple-500 text-xl"})],-1),Ce=e("i",{class:"pi pi-eye text-blue-500 text-xl"},null,-1),Pe={class:"col-12 lg:col-6 xl:col-3"},Te={class:"card mb-0"},qe={class:"flex justify-content-between mb-3"},Le=e("span",{class:"block text-500 font-medium mb-3"},"Controladores de Produtos",-1),Me={class:"text-900 font-medium text-xl"},Ne=e("div",{class:"flex align-items-center justify-content-center bg-purple-100 border-round",style:{width:"2.5rem",height:"2.5rem"}},[e("i",{class:"pi pi-comment text-purple-500 text-xl"})],-1),Fe=e("i",{class:"pi pi-eye text-blue-500 text-xl"},null,-1),Qe={class:"col-12 xl:col-12"},Se={class:"card"},Ee=e("h5",null,"Produtos",-1),Ue={class:"col-12 xl:col-12"},$e={class:"card"},Ie=e("h5",null,"Bilhetes do Evento",-1),Ae={class:"col-12 xl:col-12"},We={class:"card"},ze=e("h5",null,"Convites do Evento",-1),Ge={class:"col-12 xl:col-12"},He={class:"card"},Je=e("h5",null,"Bares",-1),Ke={key:1,class:"text-center"},Oe=e("p",null,"Por Favor Aguarde...",-1),ot={__name:"Dashboard",setup(Xe){const r=V(),g=B(),v=x(!0),w=x(null),d=x({data:[]});function y(){r&&r.back()}const k=async(j=1)=>{T.get(`${q}/promotor-dashboard/${r.currentRoute.value.params.id}`,{params:{query:w.value}}).then(h=>{d.value=h.data,v.value=!1}).catch(h=>{v.value=!1,g.add({severity:"error",summary:`${h}`,detail:"Message Detail",life:3e3}),y()})};return C(()=>{k()}),(j,h)=>{const D=p("Button"),l=p("Column"),m=p("DataTable"),R=p("ProgressSpinner");return b(),f(P,null,[t(D,{label:"Voltar",class:"mr-2 mb-2",onClick:y},{default:o(()=>[L,c(" Voltar")]),_:1}),v.value?(b(),f("div",Ke,[t(R,{style:{width:"50px",height:"50px"},strokeWidth:"8",fill:"var(--surface-ground)",animationDuration:".5s","aria-label":"Custom ProgressSpinner"}),Oe])):(b(),f("div",M,[e("div",N,[e("div",F,[e("div",Q,[e("div",null,[S,e("div",E,i(d.value.tickets),1)]),U]),t(a(_),{to:"/promotor/eventos/"+a(r).currentRoute.value.params.id},{default:o(()=>[$]),_:1},8,["to"])])]),e("div",I,[e("div",A,[e("div",W,[e("div",null,[z,e("div",G,i(d.value.packages),1)]),H]),t(a(_),{to:"/promotor/eventos/"+a(r).currentRoute.value.params.id},{default:o(()=>[J]),_:1},8,["to"])])]),e("div",K,[e("div",O,[e("div",X,[e("div",null,[Y,e("div",Z,i(d.value.invites),1)]),ee]),t(a(_),{to:"/promotor/eventos/"+a(r).currentRoute.value.params.id},{default:o(()=>[te]),_:1},8,["to"])])]),e("div",se,[e("div",oe,[e("div",le,[e("div",null,[ie,e("div",ae,i(d.value.lineups),1)]),de]),t(a(_),{to:"/promotor/eventos/"+a(r).currentRoute.value.params.id},{default:o(()=>[ce]),_:1},8,["to"])])]),e("div",re,[e("div",ne,[e("div",ue,[e("div",null,[_e,e("div",he,i(d.value.bars),1)]),me]),t(a(_),{to:"/promotor/eventos/"+a(r).currentRoute.value.params.id},{default:o(()=>[pe]),_:1},8,["to"])])]),e("div",ve,[e("div",xe,[e("div",be,[e("div",null,[fe,e("div",ye,i(d.value.products),1)]),ge]),t(a(_),{to:"/promotor/eventos/"+a(r).currentRoute.value.params.id},{default:o(()=>[we]),_:1},8,["to"])])]),e("div",ke,[e("div",je,[e("div",De,[e("div",null,[Re,e("div",Ve,i(d.value.protocols),1)]),Be]),t(a(_),{to:"/promotor/eventos/"+a(r).currentRoute.value.params.id},{default:o(()=>[Ce]),_:1},8,["to"])])]),e("div",Pe,[e("div",Te,[e("div",qe,[e("div",null,[Le,e("div",Me,i(d.value.barmans),1)]),Ne]),t(a(_),{to:"/promotor/eventos/"+a(r).currentRoute.value.params.id},{default:o(()=>[Fe]),_:1},8,["to"])])]),e("div",Qe,[e("div",Se,[Ee,t(m,{value:d.value.event.products,rows:1,responsiveLayout:"scroll"},{default:o(()=>[t(l,{field:"name",header:"Nome",sortable:!0,style:{width:"35%"}}),t(l,{field:"price",header:"Bar",sortable:!0,style:{width:"35%"}},{body:o(s=>[c(i(s.data.barstore.name),1)]),_:1}),t(l,{field:"price",header:"Stock Inicial",sortable:!0,style:{width:"35%"}},{body:o(s=>[c(i(s.data.qtd+s.data.sells.reduce((n,u)=>n+u.qtd,0)),1)]),_:1}),t(l,{field:"price",header:"Quantidade",sortable:!0,style:{width:"35%"}},{body:o(s=>[c(i(s.data.qtd),1)]),_:1}),t(l,{field:"price",header:"Preço Venda",sortable:!0,style:{width:"35%"}},{body:o(s=>[c(i(s.data.sell_price)+" MT ",1)]),_:1}),t(l,{field:"price",header:"Preço Compra",sortable:!0,style:{width:"35%"}},{body:o(s=>[c(i(s.data.buy_price)+" MT ",1)]),_:1}),t(l,{field:"price",header:"Qtd Vendas",sortable:!0,style:{width:"35%"}},{body:o(s=>[c(i(s.data.sells.reduce((n,u)=>n+u.qtd,0)),1)]),_:1}),t(l,{field:"price",header:"Valor de Vendas",sortable:!0,style:{width:"35%"}},{body:o(s=>[c(i(s.data.sells.reduce((n,u)=>n+u.qtd,0)*s.data.sell_price)+"MT ",1)]),_:1})]),_:1},8,["value"])])]),e("div",Ue,[e("div",$e,[Ie,t(m,{value:d.value.event.tickets,rows:1,responsiveLayout:"scroll"},{default:o(()=>[t(l,{field:"name",header:"Nome",sortable:!0,style:{width:"35%"}}),t(l,{field:"max_qtd",header:"Quantidade Máxima",sortable:!0,style:{width:"35%"}}),t(l,{field:"price",header:"Preço",sortable:!0,style:{width:"35%"}},{body:o(s=>[c(i(s.data.price)+" MT ",1)]),_:1}),t(l,{field:"start_date",header:"Data Inicio",sortable:!0,style:{width:"35%"}}),t(l,{field:"end_date",header:"Data Fim",sortable:!0,style:{width:"35%"}}),t(l,{field:"description",header:"Descrição",sortable:!0,style:{width:"35%"}}),t(l,{field:"sells",header:"Vendas",sortable:!0,style:{width:"35%"}},{body:o(s=>[c(i(s.data.sells.length),1)]),_:1})]),_:1},8,["value"])])]),e("div",Ae,[e("div",We,[ze,t(m,{value:d.value.event.invites,rows:1,responsiveLayout:"scroll"},{default:o(()=>[t(l,{field:"name",header:"Nome",sortable:!0,style:{width:"35%"}}),t(l,{field:"description",header:"Descrição",sortable:!0,style:{width:"35%"}}),t(l,{field:"customers",header:"Nº",sortable:!0,style:{width:"35%"}},{body:o(s=>[c(i(s.data.customers.length),1)]),_:1})]),_:1},8,["value"])])]),e("div",Ge,[e("div",He,[Je,t(m,{value:d.value.event.barstores,rows:1,responsiveLayout:"scroll"},{default:o(()=>[t(l,{field:"name",header:"Nome",sortable:!0,style:{width:"35%"}}),t(l,{field:"price",header:"Qtd Vendas",sortable:!0,style:{width:"35%"}},{body:o(s=>[c(i(s.data.sells.reduce((n,u)=>n+u.qtd,0)),1)]),_:1}),t(l,{field:"price",header:"Valor Vendas",sortable:!0,style:{width:"35%"}},{body:o(s=>[c(i(s.data.sells.reduce((n,u)=>n+parseFloat(u.total),0))+" MT ",1)]),_:1})]),_:1},8,["value"])])])]))],64)}}};export{ot as default};