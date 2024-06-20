import{_ as G}from"./mpesa-18b7c6e9.js";import{u as X,r as u,a as Y,C as O,h as U,o as Z,b,c as r,d as c,e,t as o,g as s,F as ee,v as te,f as d,n as g,p as x,l as $,k as se,w as F}from"./index-b670bd76.js";import{b as I,s as ae}from"./APIConstant-43486e71.js";import{h as m}from"./moment-a9aaa855.js";import"./vue-numeric.min-8beccd22.js";import{u as oe}from"./vee-validate.esm-a565d278.js";import{c as le,a as T}from"./index.esm-a7e89c92.js";const ne={key:0,id:"features",class:"py-4 px-4 lg:px-8 mt-5 mx-0 lg:mx-8"},ie={class:"grid justify-content-left"},re={class:"col-12 text-left mt-8 mb-4"},de={class:"text-900 font-normal mb-2"},ue={class:"text-600 text-2xl"},ce={class:"col-12 md:col-12 lg:col-12 p-0 lg:pr-5 lg:pb-5 mt-4 lg:mt-0"},me={style:{padding:"2px","border-radius":"10px",background:"linear-gradient(90deg, rgba(253, 228, 165, 0.2), rgba(187, 199, 205, 0.2)), linear-gradient(180deg, rgba(253, 228, 165, 0.2), rgba(187, 199, 205, 0.2))"}},_e={class:"p-3 surface-card h-full",style:{"border-radius":"8px"}},pe=e("h2",{class:"text-900 font-normal mb-2"},"Pagamentos",-1),he={class:"grid grid-nogutter"},ve={class:"md:w-10rem relative"},fe=["src","alt"],be={class:"flex flex-column md:flex-row justify-content-between md:align-items-center flex-1 gap-4"},ge={class:"flex flex-row md:flex-column justify-content-between align-items-start gap-2"},xe={class:"text-lg font-medium text-900 mt-2"},ye={class:"text-lg font-medium text-900 mt-2"},ke={class:"text-lg font-medium text-900 mt-2"},Ne={key:0,class:"flex flex-column md:align-items-end gap-5"},Se={class:"text-xl font-semibold text-900 text-red"},Ve={key:1,class:"flex flex-column md:align-items-end gap-5"},Te={class:"text-xl font-semibold text-900"},we={class:"flex flex-row-reverse md:flex-row gap-2"},Be=e("span",{class:"pi pi-plus"},null,-1),Ce=e("span",{class:"pi pi-minus"},null,-1),Le=e("hr",null,null,-1),Me={key:0},Ee=e("h2",{class:"text-900 font-normal mb-2"},"Resumo da Encomenda",-1),qe={class:"text-900 font-normal mb-2"},Pe={class:"text-900 font-normal mb-2"},Oe={class:"card p-fluid"},Ue=e("h5",null,"Detalhes do Cliente",-1),$e={class:"field"},Fe=e("label",{for:"customerName"},"Nome",-1),Ie={id:"city_id-help",class:"p-error"},De={class:"field"},He=e("label",{for:"customerEmail"},"Email ( O seu bilhete será encaminhado para este email)",-1),Re={id:"city_id-help",class:"p-error"},Ae={class:"field"},We=e("label",{for:"customerMobile"},"Telemóvel ( WhatsApp - O seu bilhete será encaminhado para este número)",-1),je={id:"city_id-help",class:"p-error"},Ke={class:"card p-fluid"},ze=e("h5",null,"Informações do Pagamento",-1),Je=e("img",{src:G,alt:"Logo",height:"100",class:"mr-2"},null,-1),Qe={class:"field"},Ge=e("label",{for:"paymentNumber"},"Número de MPESA",-1),Xe={id:"city_id-help",class:"p-error"},Ye={class:"field"},Ze={key:0,class:"field"},et=e("label",null,"Nota: Recomendamos que registre-se na plataforma e faça a compra do seu bilhete, para manter históricos dos seus bilhetes e recuperar a qualquer momento.",-1),tt=[et],st={class:"field"},at={key:1},ot=e("h2",{class:"text-900 font-normal mb-2"},"Pagamentos",-1),lt=e("h5",{class:"text-900 font-normal mb-2"},"Nenhum Bilhete Selecionado!",-1),nt=[ot,lt],it={key:1,class:"text-center"},rt=e("p",null,"Por Favor Aguarde...",-1),bt={__name:"checkout",setup(dt){const y=X(),w=u(!0),n=u(!1);u(!1);const p=u(),h=u(),B=Y();u([]),u([]),u(0);const i=u([]),D=le({customerName:T().required().trim().label("Nome"),customerEmail:T().required().trim().label("Email"),customerMobile:T().required().trim().label("Telefone"),paymentNumber:T().required().label("Telefone")}),{defineField:v,handleSubmit:H,resetForm:ut,errors:_,setErrors:R}=oe({validationSchema:D}),[k]=v("customerName"),[N]=v("customerEmail"),[S]=v("customerMobile"),[C]=v("paymentNumber"),[V]=v("user_id"),A=l=>{switch(l){case"INSTOCK":return"success";case"LOWSTOCK":return"warning";case"OUTOFSTOCK":return"danger";default:return null}};function W(){y&&y.back()}const E=O(()=>h.value.reduce((l,a)=>l+a.quantity,0)),L=O(()=>h.value.reduce((l,a)=>l+a.quantity*a.price,0)),M=H(l=>{l.tickets=h.value,l.amount=L.value,l.tickets,n.value=!0,U.post(`${I}/checkout`,l,{headers:{"Content-Type":"multipart/form-data"}}).then(a=>{localStorage.setItem("order",JSON.stringify(a.data.order)),y.push({path:"/encomenda"}),B.add({severity:"success",summary:"Successo",detail:"A sua compra foi efetuada com sucesso",life:3e3})}).catch(a=>{n.value=!1,B.add({severity:"error",summary:`${a.response.data.message}`,detail:"Detalhe da Mensagem",life:3e3}),a.response.data.errors&&R(a.response.data.errors)}).finally(()=>{n.value=!1})}),j=()=>{U.get(`${I}/checkout/${y.currentRoute.value.params.id}`).then(l=>{p.value=l.data.events,h.value=l.data.tickets,w.value=!1}).catch(l=>{w.value=!1,B.add({severity:"error",summary:`${l}`,detail:"Message Detail",life:3e3}),W()})};return Z(()=>{i.value=JSON.parse(localStorage.getItem("user")),i.value&&(k.value=i.value.name,N.value=i.value.email,S.value=i.value.mobile,V.value=i.value.id),j()}),(l,a)=>{const q=b("Tag"),K=b("InputNumber"),f=b("InputText"),z=b("Button"),P=b("ProgressSpinner");return w.value?(r(),c("div",it,[d(P,{style:{width:"50px",height:"50px"},strokeWidth:"8",fill:"var(--surface-ground)",animationDuration:".5s","aria-label":"Custom ProgressSpinner"}),rt])):(r(),c("div",ne,[e("div",ie,[e("div",re,[e("h2",de,o(p.value.name),1),e("span",ue,o(s(m)(p.value.start_date).format("LL"))+", "+o(p.value.address)+", "+o(p.value.province.name),1)]),e("div",ce,[e("div",me,[e("div",_e,[pe,e("div",he,[(r(!0),c(ee,null,te(h.value,(t,J)=>(r(),c("div",{key:t.id,class:"col-12"},[e("div",{class:x(["flex flex-column sm:flex-row sm:align-items-center p-4 gap-3",{"border-top-1 surface-border":J!==0}])},[e("div",ve,[e("img",{class:"block xl:block border-round mx-auto border-round w-full",src:s(ae)+p.value.image,alt:t.name},null,8,fe),d(q,{value:t.inventoryStatus,severity:A(t),class:"absolute",style:{left:"4px",top:"4px"}},null,8,["value","severity"])]),e("div",be,[e("div",ge,[e("div",null,[e("div",xe,o(t.name),1),e("div",ye,"Inicio: "+o(s(m)(t.start_date).format("LL"))+" "+o(s(m)(t.start_time,"HH:mm:ss").format("HH:mm")),1),e("div",ke,"Fim: "+o(s(m)(t.end_date).format("LL"))+" "+o(s(m)(t.end_time,"HH:mm:ss").format("HH:mm")),1)])]),s(m)().isAfter(s(m)(`${t.end_date} ${t.end_time}`))||t.max_qtd<=0||s(m)().isSameOrBefore(s(m)(`${t.start_date} ${t.start_time})`))?(r(),c("div",Ne,[e("span",Se,[d(q,{value:"Bilhete Indisponível",severity:"danger"})])])):(r(),c("div",Ve,[e("span",Te,o(t.price)+" MT",1),e("div",we,[d(K,{modelValue:t.quantity,"onUpdate:modelValue":Q=>t.quantity=Q,showButtons:"",buttonLayout:"horizontal",min:0,max:5,disabled:n.value},{incrementbuttonicon:F(()=>[Be]),decrementbuttonicon:F(()=>[Ce]),_:2},1032,["modelValue","onUpdate:modelValue","disabled"])])]))])],2)]))),128))]),Le,E.value>0?(r(),c("div",Me,[Ee,e("h5",qe,"Total de Bilhetes: "+o(E.value),1),e("h5",Pe,"Preço Total: "+o(L.value.toFixed(2))+" MT",1),e("form",{onSubmit:a[5]||(a[5]=(...t)=>s(M)&&s(M)(...t))},[e("div",Oe,[Ue,e("div",$e,[Fe,d(f,{id:"customerName",modelValue:s(k),"onUpdate:modelValue":a[0]||(a[0]=t=>g(k)?k.value=t:null),type:"text",class:x({"p-invalid":s(_).customerName}),disabled:n.value||i.value},null,8,["modelValue","class","disabled"]),e("small",Ie,o(s(_).customerName),1)]),e("div",De,[He,d(f,{id:"customerEmail",modelValue:s(N),"onUpdate:modelValue":a[1]||(a[1]=t=>g(N)?N.value=t:null),type:"email",class:x({"p-invalid":s(_).customerEmail}),disabled:n.value||i.value},null,8,["modelValue","class","disabled"]),e("small",Re,o(s(_).customerEmail),1)]),e("div",Ae,[We,d(f,{id:"customerMobile",modelValue:s(S),"onUpdate:modelValue":a[2]||(a[2]=t=>g(S)?S.value=t:null),type:"number",class:x({"p-invalid":s(_).customerMobile}),disabled:n.value||i.value},null,8,["modelValue","class","disabled"]),e("small",je,o(s(_).customerMobile),1)])]),e("div",Ke,[ze,Je,e("div",Qe,[Ge,d(f,{id:"paymentNumber",modelValue:s(C),"onUpdate:modelValue":a[3]||(a[3]=t=>g(C)?C.value=t:null),type:"text",class:x({"p-invalid":s(_).paymentNumber}),disabled:n.value},null,8,["modelValue","class","disabled"]),d(f,{id:"user_id",modelValue:s(V),"onUpdate:modelValue":a[4]||(a[4]=t=>g(V)?V.value=t:null),type:"hidden"},null,8,["modelValue"]),e("small",Xe,o(s(_).paymentNumber),1)]),e("div",Ye,[e("label",null,"Valor Total a Pagar: "+o(L.value.toFixed(2))+" MT",1)]),i.value?$("",!0):(r(),c("div",Ze,tt)),e("div",st,[d(z,{label:"Submeter",class:"mr-2 mb-2",onClick:s(M),disabled:n.value},null,8,["onClick","disabled"]),n.value?(r(),se(P,{key:0,style:{width:"35px",height:"35px"},strokeWidth:"8",fill:"var(--surface-ground)",animationDuration:".5s","aria-label":"Custom ProgressSpinner"})):$("",!0)])])],32)])):(r(),c("div",at,nt))])])])])]))}}};export{bt as default};