import{u as W,r as c,a as j,h as F,o as z,b as U,c as w,d as I,e,f as o,w as A,g as t,n as r,p as m,t as u,k as G,l as O,j as J,s as _}from"./index-b670bd76.js";import{b as R}from"./APIConstant-43486e71.js";import{u as K}from"./vee-validate.esm-a565d278.js";import{c as X,a as n}from"./index.esm-a7e89c92.js";import"./moment-a9aaa855.js";const Y={key:0,className:"card"},Z={class:"col-12"},ee={class:"card-w-title"},te=e("i",{class:"pi pi-angle-left"},null,-1),se=e("h5",null,"Editar Ticket",-1),ae=e("small",{class:"p-error"},"Os campos marcados * sao considerados campos obrigatorios.",-1),le={class:"col-12 md:col-12"},oe={class:"card p-fluid"},ie=e("h5",null,"Formulário Criação de Bilhetes",-1),de=e("h5",null,"Informação Geral",-1),re={class:"field"},ne=e("label",{for:"name"},"Nome",-1),ue={id:"name-help",class:"p-error"},ce={class:"field"},me=e("label",{for:"price"},"Preço",-1),_e={id:"price-help",class:"p-error"},pe={class:"field"},ve=e("label",{for:"description"},"Descrição",-1),he={id:"description-help",class:"p-error"},fe={class:"field"},be=e("label",{for:"max_qtd"},"Quantidade Máxima",-1),Ve={id:"max_qtd-help",class:"p-error"},ge={class:"formgrid grid"},xe={class:"field col"},ke=e("label",{for:"start_date"},"Data de Inicio",-1),ye={id:"start_date-help",class:"p-error"},qe={class:"field col"},Be=e("label",{for:"start_time"},"Horas de Inicio",-1),De={id:"start_time-help",class:"p-error"},Ce={class:"formgrid grid"},Se={class:"field col"},Ue=e("label",{for:"end_date"},"Data de Termino",-1),we={id:"end_date-help",class:"p-error"},$e={class:"field col"},Ne=e("label",{for:"end_time"},"Horas de Termino",-1),Pe={id:"end_time-help",class:"p-error"},Ee={key:1,class:"text-center"},Fe=e("p",null,"Por Favor Aguarde...",-1),Qe={__name:"EditBilhetes",setup(Ie){const v=W(),D=c(!1),h=c(!1),i=c();c([]),c([]),c([]),c([]);const C=j();function $(){v&&v.back()}const T=X({name:n().required().trim().label("Nome"),price:n().required().trim().label("Preco"),description:n().required().trim().label("Descricao"),max_qtd:n().required().label("Quantidade"),event_id:n().required().label("Evento"),start_date:n().required().label("Data"),start_time:n().required().label("Horas"),end_date:n().required().label("Data"),end_time:n().required().label("Horas")}),{defineField:d,handleSubmit:H,resetForm:M,errors:l,setErrors:L}=K({validationSchema:T}),[f]=d("name"),[b]=d("event_id"),[V]=d("description"),[g]=d("max_qtd"),[x]=d("start_date"),[k]=d("start_time"),[y]=d("end_date"),[q]=d("end_time"),[B]=d("price"),S=H(p=>{h.value=!0,F.put(`${R}/promotor-tickets/${v.currentRoute.value.params.idbilhetes}`,p).then(s=>{M(),v.back(),C.add({severity:"success",summary:"Successo",detail:"Bilhete alterado com sucesso",life:3e3})}).catch(s=>{h.value=!1,C.add({severity:"error",summary:`${s.response.data.message}`,detail:"Detalhe da Mensagem",life:3e3}),s.response.data.errors&&L(s.response.data.errors)}).finally(()=>{h.value=!1})}),Q=()=>{F.get(`${R}/promotor-tickets/${v.currentRoute.value.params.idbilhetes}/edit`).then(p=>{i.value=p.data.ticket,f.value=i.value.name,b.value=i.value.event_id,k.value=i.value.start_time,q.value=i.value.end_time,x.value=i.value.start_date,y.value=i.value.end_date,g.value=i.value.max_qtd,B.value=i.value.price,V.value=i.value.description,D.value=!1}).catch(p=>{D.value=!1,C.add({severity:"error",summary:`${p}`,detail:"Message Detail",life:3e3}),$()})};return z(()=>{Q()}),(p,s)=>{const N=U("Button"),P=U("Calendar"),E=U("ProgressSpinner");return D.value?(w(),I("div",Ee,[o(E,{style:{width:"50px",height:"50px"},strokeWidth:"8",fill:"var(--surface-ground)",animationDuration:".5s","aria-label":"Custom ProgressSpinner"}),Fe])):(w(),I("div",Y,[e("div",Z,[e("div",ee,[o(N,{label:"Voltar",class:"mr-2 mb-2",onClick:$},{default:A(()=>[te,J(" Voltar")]),_:1}),se]),ae,e("form",{onSubmit:s[9]||(s[9]=(...a)=>t(S)&&t(S)(...a))},[e("div",le,[e("div",oe,[ie,de,e("div",re,[ne,o(t(_),{modelValue:t(f),"onUpdate:modelValue":s[0]||(s[0]=a=>r(f)?f.value=a:null),id:"name",type:"text",class:m({"p-invalid":t(l).name})},null,8,["modelValue","class"]),e("small",ue,u(t(l).name),1)]),e("div",ce,[me,o(t(_),{modelValue:t(B),"onUpdate:modelValue":s[1]||(s[1]=a=>r(B)?B.value=a:null),id:"price",type:"number",class:m({"p-invalid":t(l).price})},null,8,["modelValue","class"]),e("small",_e,u(t(l).price),1)]),e("div",pe,[ve,o(t(_),{modelValue:t(V),"onUpdate:modelValue":s[2]||(s[2]=a=>r(V)?V.value=a:null),id:"description",type:"text",class:m({"p-invalid":t(l).description})},null,8,["modelValue","class"]),e("small",he,u(t(l).description),1)]),e("div",fe,[be,o(t(_),{modelValue:t(g),"onUpdate:modelValue":s[3]||(s[3]=a=>r(g)?g.value=a:null),id:"max_qtd",type:"number",class:m({"p-invalid":t(l).max_qtd})},null,8,["modelValue","class"]),o(t(_),{modelValue:t(b),"onUpdate:modelValue":s[4]||(s[4]=a=>r(b)?b.value=a:null),id:"event_id",type:"hidden",class:m({"p-invalid":t(l).event_id})},null,8,["modelValue","class"]),e("small",Ve,u(t(l).max_qtd),1)]),e("div",ge,[e("div",xe,[ke,o(P,{showIcon:!0,showButtonBar:!0,modelValue:t(x),"onUpdate:modelValue":s[5]||(s[5]=a=>r(x)?x.value=a:null)},null,8,["modelValue"]),e("small",ye,u(t(l).start_date),1)]),e("div",qe,[Be,o(t(_),{modelValue:t(k),"onUpdate:modelValue":s[6]||(s[6]=a=>r(k)?k.value=a:null),id:"start_time",type:"time",class:m({"p-invalid":t(l).start_time})},null,8,["modelValue","class"]),e("small",De,u(t(l).start_time),1)])]),e("div",Ce,[e("div",Se,[Ue,o(P,{showIcon:!0,showButtonBar:!0,modelValue:t(y),"onUpdate:modelValue":s[7]||(s[7]=a=>r(y)?y.value=a:null)},null,8,["modelValue"]),e("small",we,u(t(l).end_date),1)]),e("div",$e,[Ne,o(t(_),{modelValue:t(q),"onUpdate:modelValue":s[8]||(s[8]=a=>r(q)?q.value=a:null),id:"end_time",type:"time",class:m({"p-invalid":t(l).end_time})},null,8,["modelValue","class"]),e("small",Pe,u(t(l).end_time),1)])])]),o(N,{label:"Submeter",class:"mr-2 mb-2",onClick:t(S),disabled:h.value},null,8,["onClick","disabled"]),h.value?(w(),G(E,{key:0,style:{width:"35px",height:"35px"},strokeWidth:"8",fill:"var(--surface-ground)",animationDuration:".5s","aria-label":"Custom ProgressSpinner"})):O("",!0)])],32)])]))}}};export{Qe as default};
