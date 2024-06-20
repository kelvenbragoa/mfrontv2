import{u as U,r as s,a as z,h as D,o as I,b as p,c as k,d as B,e,f as t,w as o,j as c,t as _,g as S,F as Q,R as w,m as W}from"./index-b670bd76.js";import{b as P}from"./APIConstant-43486e71.js";import{u as G}from"./vee-validate.esm-a565d278.js";import{c as H,a as b}from"./index.esm-a7e89c92.js";import"./moment-a9aaa855.js";const J={key:0,className:"card"},K={class:"col-12"},O={class:"card-w-title"},X=e("i",{class:"pi pi-angle-left"},null,-1),Y=e("p",null,"Detalhes do Bar",-1),Z=e("strong",null,"Nome: ",-1),ee=e("strong",null,"Produtos: ",-1),te=e("hr",null,null,-1),ae=e("i",{class:"pi pi-plus"},null,-1),se={class:"flex flex-wrap align-items-center justify-content-between gap-2"},oe=e("span",{class:"text-xl text-900 font-bold"},"Productos",-1),le=e("i",{class:"pi pi-file-edit"},null,-1),re=e("i",{class:"pi pi-eye"},null,-1),ie=["onClick"],ne=e("i",{class:"pi pi-trash"},null,-1),de=[ne],ce={key:1,class:"text-center"},ue=e("p",null,"Por Favor Aguarde...",-1),me=e("div",{class:"flex align-items-center justify-content-center"},[e("i",{class:"pi pi-exclamation-triangle mr-3",style:{"font-size":"2rem"}}),e("span",null,"Tem certeza que deseja proceder?")],-1),xe={__name:"ShowBar",setup(pe){const f=U(),g=s(!0),y=s(!1),i=s(),u=z(),n=s([]);s([]),s([]),s([]),s([]);const x=s(0),C=s(!1);s(!1);function $(){f&&f.back()}const q=H({name:b().required().label("Name"),address:b().required().label("Address"),city:b().required().label("City"),province_id:b().required().label("Province")}),{defineField:v,handleSubmit:F,resetForm:M,errors:_e,setErrors:V}=G({validationSchema:q});v("name"),v("address"),v("city"),v("province_id"),F(a=>{console.log("Submitted with",a),y.value=!0,D.post(`${P}/drivers`,a).then(l=>{M(),f.push({path:"/drivers"}),u.add({severity:"success",summary:"Successo",detail:"Registro criada com sucesso",life:3e3})}).catch(l=>{y.value=!1,u.add({severity:"error",summary:`${l.response.data.message}`,detail:"Detalhe da Mensagem",life:3e3}),l.response.data.errors&&V(l.response.data.errors)}).finally(()=>{y.value=!1})});const h=s(!1),N=()=>{h.value=!1},T=a=>{h.value=!0,x.value=a},j=()=>{C.value=!0,D.delete(`${P}/promotor-products/${x.value}`).then(()=>{n.value=n.value.filter(a=>a.id!==x.value),N(),u.add({severity:"success",summary:"Sucesso",detail:"Message Detail",life:3e3})}).catch(a=>{u.add({severity:"error",summary:`${a}`,detail:"Message Detail",life:3e3}),C.value=!1}).finally(()=>{C.value=!1})},R=()=>{D.get(`${P}/promotor-bar/${f.currentRoute.value.params.idbar}`).then(a=>{i.value=a.data.bar,n.value=a.data.products,g.value=!1}).catch(a=>{g.value=!1,u.add({severity:"error",summary:`${a}`,detail:"Message Detail",life:3e3}),$()})};return I(()=>{R()}),(a,l)=>{const m=p("Button"),d=p("Column"),L=p("DataTable"),A=p("ProgressSpinner"),E=p("Dialog");return k(),B(Q,null,[g.value?(k(),B("div",ce,[t(A,{style:{width:"50px",height:"50px"},strokeWidth:"8",fill:"var(--surface-ground)",animationDuration:".5s","aria-label":"Custom ProgressSpinner"}),ue])):(k(),B("div",J,[e("div",K,[e("div",O,[t(m,{label:"Voltar",class:"mr-2 mb-2",onClick:$},{default:o(()=>[X,c(" Voltar")]),_:1})]),Y,e("p",null,[Z,c(_(i.value.name),1)]),e("p",null,[ee,c(_(i.value.products.length),1)]),te,t(S(w),{to:"/promotor/eventos/"+i.value.event_id+"/produtos/create"},{default:o(()=>[t(m,{label:"Criar Novo Registro",class:"mr-2 mb-2"},{default:o(()=>[ae,c(" Criar Produto ")]),_:1})]),_:1},8,["to"]),e("p",null,"Esta tabela de Produtos contem "+_(n.value.length)+" Registros.",1),t(L,{value:n.value,tableStyle:"min-width: 50rem"},{header:o(()=>[e("div",se,[oe,t(m,{icon:"pi pi-refresh",rounded:"",raised:"",onClick:R})])]),footer:o(()=>[c(" No total são "+_(n.value.length)+" Bares. ",1)]),default:o(()=>[t(d,{field:"name",header:"#"},{body:o(r=>[c(_(r.index+1),1)]),_:1}),t(d,{field:"name",sortable:"",header:"Nome"}),t(d,{field:"buy_price",sortable:"",header:"Compra"}),t(d,{field:"sell_price",sortable:"",header:"Venda"}),t(d,{field:"qtd",sortable:"",header:"Qtd"}),t(d,{header:"Ações"},{body:o(r=>[t(S(w),{to:"/promotor/eventos/"+i.value.event_id+"/produtos/"+r.data.id+"/edit",class:"mr-2"},{default:o(()=>[le]),_:2},1032,["to"]),t(S(w),{to:"/promotor/eventos/"+i.value.event_id+"/produtos/"+r.data.id,class:"mr-2"},{default:o(()=>[re]),_:2},1032,["to"]),e("a",{href:"#",onClick:W(fe=>T(r.data.id),["prevent"]),class:"mr-2"},de,8,ie)]),_:1})]),_:1},8,["value"])])])),t(E,{header:"Confirmação",visible:h.value,"onUpdate:visible":l[0]||(l[0]=r=>h.value=r),style:{width:"350px"},modal:!0},{footer:o(()=>[t(m,{label:"Não",icon:"pi pi-times",onClick:N,class:"p-button-text"}),t(m,{label:"Sim",icon:"pi pi-check",onClick:j,class:"p-button-text",autofocus:""})]),default:o(()=>[me]),_:1},8,["visible"])],64)}}};export{xe as default};
