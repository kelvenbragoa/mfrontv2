import{u as T,r as t,a as I,h as D,o as L,b as $,c as x,d as N,e,f as i,w as M,g as o,s as b,v as f,t as B,k as W,l as j,j as z,x as h}from"./index-4c06444b.js";import{b as E}from"./APIConstant-7cd3c3b1.js";import{u as A}from"./vee-validate.esm-153206bd.js";import{c as G,a as g}from"./index.esm-7b5acfa1.js";import"./moment-a9aaa855.js";const O={key:0,className:"card"},H={class:"col-12"},J={class:"card-w-title"},K=e("i",{class:"pi pi-angle-left"},null,-1),Q=e("h5",null,"Editar Protocolo",-1),X=e("small",{class:"p-error"},"Os campos marcados * sao considerados campos obrigatorios.",-1),Y={class:"col-12 md:col-12"},Z={class:"card p-fluid"},ee=e("h5",null,"Formulário Edição de Protocolos",-1),oe=e("h5",null,"Informação Geral",-1),se={class:"field"},ae=e("label",{for:"name"},"Nome",-1),le={id:"name-help",class:"p-error"},te={class:"field"},ie=e("label",{for:"mobile"},"Telefone",-1),re={id:"mobile-help",class:"p-error"},ne={class:"field"},de=e("label",{for:"bi"},"BI",-1),ce={id:"bi-help",class:"p-error"},ue={key:1,class:"text-center"},me=e("p",null,"Por Favor Aguarde...",-1),ge={__name:"EditProtocolo",setup(pe){const n=T(),V=t(!1),d=t(!1),c=t();t([]),t([]),t([]),t([]);const y=I();function S(){n&&n.back()}const U=G({name:g().required().trim().label("Nome"),bi:g().required().trim().label("BI"),mobile:g().required().trim().label("Telefeone"),event_id:g().required().label("Evento")}),{defineField:u,handleSubmit:w,resetForm:F,errors:l,setErrors:R}=A({validationSchema:U}),[m]=u("name"),[p]=u("event_id"),[v]=u("bi"),[_]=u("mobile"),k=w(r=>{d.value=!0,D.put(`${E}/promotor-protocolo/${n.currentRoute.value.params.idprotocolo}`,r).then(s=>{F(),n.back(),y.add({severity:"success",summary:"Successo",detail:"Protocolo alterado com sucesso",life:3e3})}).catch(s=>{d.value=!1,y.add({severity:"error",summary:`${s.response.data.message}`,detail:"Detalhe da Mensagem",life:3e3}),s.response.data.errors&&R(s.response.data.errors)}).finally(()=>{d.value=!1})}),q=()=>{D.get(`${E}/promotor-protocolo/${n.currentRoute.value.params.idprotocolo}/edit`).then(r=>{c.value=r.data.protocolo,m.value=c.value.name,v.value=c.value.bi,_.value=c.value.mobile,p.value=c.value.event_id,V.value=!1}).catch(r=>{V.value=!1,y.add({severity:"error",summary:`${r}`,detail:"Message Detail",life:3e3}),S()})};return L(()=>{q()}),(r,s)=>{const C=$("Button"),P=$("ProgressSpinner");return V.value?(x(),N("div",ue,[i(P,{style:{width:"50px",height:"50px"},strokeWidth:"8",fill:"var(--surface-ground)",animationDuration:".5s","aria-label":"Custom ProgressSpinner"}),me])):(x(),N("div",O,[e("div",H,[e("div",J,[i(C,{label:"Voltar",class:"mr-2 mb-2",onClick:S},{default:M(()=>[K,z(" Voltar")]),_:1}),Q]),X,e("form",{onSubmit:s[4]||(s[4]=(...a)=>o(k)&&o(k)(...a))},[e("div",Y,[e("div",Z,[ee,oe,e("div",se,[ae,i(o(h),{modelValue:o(m),"onUpdate:modelValue":s[0]||(s[0]=a=>b(m)?m.value=a:null),id:"name",type:"text",class:f({"p-invalid":o(l).name})},null,8,["modelValue","class"]),i(o(h),{modelValue:o(p),"onUpdate:modelValue":s[1]||(s[1]=a=>b(p)?p.value=a:null),id:"event_id",type:"hidden",class:f({"p-invalid":o(l).event_id})},null,8,["modelValue","class"]),e("small",le,B(o(l).name),1)]),e("div",te,[ie,i(o(h),{modelValue:o(_),"onUpdate:modelValue":s[2]||(s[2]=a=>b(_)?_.value=a:null),id:"mobile",type:"text",class:f({"p-invalid":o(l).mobile})},null,8,["modelValue","class"]),e("small",re,B(o(l).mobile),1)]),e("div",ne,[de,i(o(h),{modelValue:o(v),"onUpdate:modelValue":s[3]||(s[3]=a=>b(v)?v.value=a:null),id:"bi",type:"text",class:f({"p-invalid":o(l).bi})},null,8,["modelValue","class"]),e("small",ce,B(o(l).bi),1)])]),i(C,{label:"Submeter",class:"mr-2 mb-2",onClick:o(k),disabled:d.value},null,8,["onClick","disabled"]),d.value?(x(),W(P,{key:0,style:{width:"35px",height:"35px"},strokeWidth:"8",fill:"var(--surface-ground)",animationDuration:".5s","aria-label":"Custom ProgressSpinner"})):j("",!0)])],32)])]))}}};export{ge as default};