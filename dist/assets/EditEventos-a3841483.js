import{u as ue,r as p,a as _e,h as Z,o as me,b as z,c as A,d as ee,e as l,f as s,w as pe,g as e,s as n,v as r,t as u,k as ve,l as he,j as be,x as m,y as v}from"./index-4c06444b.js";import{b as le,s as fe}from"./APIConstant-7cd3c3b1.js";import{u as ge}from"./vee-validate.esm-153206bd.js";import{c as ye,a as c}from"./index.esm-7b5acfa1.js";const Ve={key:0,className:"card"},Ue={class:"col-12"},we={class:"card-w-title"},xe=l("i",{class:"pi pi-angle-left"},null,-1),ke=l("h5",null,"Editar Eventos",-1),Pe=l("small",{class:"p-error"},"Os campos marcados * sao considerados campos obrigatorios.",-1),Se={class:"col-12 md:col-12"},qe={class:"card p-fluid"},Ce=l("h5",null,"Formulário Criação de Eventos",-1),De=l("h5",null,"Informação Geral",-1),Ee={class:"field"},Le=l("label",{for:"name"},"Nome",-1),Fe={id:"name-help",class:"p-error"},Te={class:"formgrid grid"},Be={class:"field col"},$e=l("label",{for:"province_id"},"Provincia",-1),Re={id:"province_id-help",class:"p-error"},Ie={class:"field col"},Ne=l("label",{for:"city_id"},"Cidade",-1),ze={id:"city_id-help",class:"p-error"},Me={class:"field"},We=l("label",{for:"description"},"Descrição do Evento",-1),He={id:"description-help",class:"p-error"},je={class:"formgrid grid"},Ae={class:"field col"},Ge=l("label",{for:"main_category_id"},"Categoria Principal",-1),Oe={id:"main_category_id-help",class:"p-error"},Ye={class:"field col"},Je=l("label",{for:"second_category_id"},"Categoria Secundário",-1),Ke={id:"second_category_id-help",class:"p-error"},Qe={class:"field col"},Xe=l("label",{for:"type_event_id"},"Tipo de Eventos",-1),Ze={id:"type_event_id-help",class:"p-error"},el=l("h5",null,"Localização e Data do Evento",-1),ll={class:"field"},ol=l("label",{for:"address"},"Endereço",-1),al={id:"address-help",class:"p-error"},tl={class:"formgrid grid"},sl={class:"field col"},il=l("label",{for:"start_date"},"Data de Inicio",-1),dl={id:"start_date-help",class:"p-error"},nl={class:"field col"},rl=l("label",{for:"start_time"},"Horas de Inicio",-1),cl={id:"start_time-help",class:"p-error"},ul={class:"formgrid grid"},_l={class:"field col"},ml=l("label",{for:"end_date"},"Data de Termino",-1),pl={id:"end_date-help",class:"p-error"},vl={class:"field col"},hl=l("label",{for:"end_time"},"Horas de Termino",-1),bl={id:"end_time-help",class:"p-error"},fl=l("h5",null,"Contactos para Informações",-1),gl={class:"field"},yl=l("label",{for:"email"},"Email",-1),Vl={id:"email-help",class:"p-error"},Ul={class:"field"},wl=l("label",{for:"phone"},"Telefone",-1),xl={id:"phone-help",class:"p-error"},kl={class:"field"},Pl=l("label",{for:"website"},"Website",-1),Sl={id:"website-help",class:"p-error"},ql=l("h5",null,"Redes Sociais",-1),Cl={class:"field"},Dl=l("label",{for:"instagram"},"Instagram",-1),El={id:"instagram-help",class:"p-error"},Ll={class:"field"},Fl=l("label",{for:"facebook"},"Facebook",-1),Tl={id:"facebook-help",class:"p-error"},Bl={class:"field"},$l=l("label",{for:"twitter"},"Twitter",-1),Rl={id:"twitter-help",class:"p-error"},Il={class:"field"},Nl=l("label",{for:"youtube"},"Video Youtube Promocional",-1),zl={id:"youtube-help",class:"p-error"},Ml={class:"field"},Wl=l("label",{for:"youtube"},"Estado",-1),Hl={class:"col-12 lg:col-6 xl:col-6"},jl=["src"],Al=l("h5",null,"Imagem Capa",-1),Gl={class:"field"},Ol=l("label",{for:"image"},"Imagem",-1),Yl={key:1,class:"text-center"},Jl=l("p",null,"Por Favor Aguarde...",-1),lo={__name:"EditEventos",setup(Kl){const h=ue(),M=p(!0),b=p(!1),G=p([]),O=p([]),Y=p([]),J=p([]),W=p([]),i=p([]),H=_e();function K(){h&&h.back()}const oe=ye({name:c().required().trim().label("Nome"),province_id:c().required().trim().label("Provincia"),city_id:c().required().trim().label("Cidade"),status_id:c().required().trim().label("Status"),description:c().required().label("Descricao"),main_category_id:c().required().label("CategoriaPrincipal"),second_category_id:c().required().label("CategoriaSec"),type_event_id:c().required().label("Province"),address:c().required().label("Province"),start_date:c().required().label("Province"),start_time:c().required().label("Province"),end_date:c().required().label("Province"),end_time:c().required().label("Province"),email:c().required().label("Province"),phone:c().required().label("Province"),website:c().required().label("Province"),instagram:c().required().label("Province"),facebook:c().required().label("Province"),twitter:c().required().label("Province"),youtube:c().required().label("Province")}),{defineField:d,handleSubmit:ae,resetForm:te,errors:t,setErrors:se}=ge({validationSchema:oe}),[f]=d("name"),[g]=d("province_id"),[y]=d("city_id"),[V]=d("status_id"),[U]=d("description"),[w]=d("main_category_id"),[x]=d("second_category_id"),[k]=d("type_event_id"),[P]=d("address"),[S]=d("start_date"),[q]=d("start_time"),[C]=d("end_date"),[D]=d("end_time"),[E]=d("email"),[L]=d("phone"),[F]=d("website"),[T]=d("instagram"),[B]=d("facebook"),[$]=d("twitter"),[R]=d("youtube"),[I]=d("_method"),N=p(),ie=p(),de=_=>{N.value=_.files[0],console.log(N.value)},j=ae(_=>{N.value!=null&&(_.image=N.value),console.log(_),b.value=!0,Z.post(`${le}/promotor-eventos/${h.currentRoute.value.params.id}`,_,{headers:{"Content-Type":"multipart/form-data"}}).then(o=>{te(),h.push({path:"/admin/eventos"}),H.add({severity:"success",summary:"Successo",detail:"Registro editado com sucesso",life:3e3})}).catch(o=>{b.value=!1,H.add({severity:"error",summary:`${o.response.data.message}`,detail:"Detalhe da Mensagem",life:3e3}),o.response.data.errors&&se(o.response.data.errors)}).finally(()=>{b.value=!1})}),ne=()=>{Z.get(`${le}/promotor-eventos/${h.currentRoute.value.params.id}/edit`).then(_=>{i.value=_.data.event,G.value=_.data.province,O.value=_.data.city,W.value=_.data.category,Y.value=_.data.status,J.value=_.data.typeevent,f.value=i.value.name,g.value=i.value.province_id,y.value=i.value.city_id,V.value=i.value.status_id,U.value=i.value.description,w.value=i.value.main_category_id,x.value=i.value.second_category_id,k.value=i.value.type_event_id,P.value=i.value.address,S.value=i.value.start_date,q.value=i.value.start_time,C.value=i.value.end_date,D.value=i.value.end_time,E.value=i.value.email,L.value=i.value.phone,F.value=i.value.website,T.value=i.value.instagram,B.value=i.value.facebook,$.value=i.value.twitter,R.value=i.value.youtube,ie.value=i.value.image,I.value="put",M.value=!1}).catch(_=>{M.value=!1,H.add({severity:"error",summary:`${_}`,detail:"Message Detail",life:3e3}),K()})};return me(()=>{ne()}),(_,o)=>{const Q=z("Button"),re=z("Textarea"),ce=z("FileUpload"),X=z("ProgressSpinner");return M.value?(A(),ee("div",Yl,[s(X,{style:{width:"50px",height:"50px"},strokeWidth:"8",fill:"var(--surface-ground)",animationDuration:".5s","aria-label":"Custom ProgressSpinner"}),Jl])):(A(),ee("div",Ve,[l("div",Ue,[l("div",we,[s(Q,{label:"Voltar",class:"mr-2 mb-2",onClick:K},{default:pe(()=>[xe,be(" Voltar")]),_:1}),ke]),Pe,l("form",{onSubmit:o[21]||(o[21]=(...a)=>e(j)&&e(j)(...a))},[l("div",Se,[l("div",qe,[Ce,De,l("div",Ee,[Le,s(e(m),{modelValue:e(f),"onUpdate:modelValue":o[0]||(o[0]=a=>n(f)?f.value=a:null),id:"name",type:"text",class:r({"p-invalid":e(t).name})},null,8,["modelValue","class"]),l("small",Fe,u(e(t).name),1)]),l("div",Te,[l("div",Be,[$e,s(e(v),{modelValue:e(g),"onUpdate:modelValue":o[1]||(o[1]=a=>n(g)?g.value=a:null),options:G.value,optionLabel:"name",optionValue:"id",placeholder:"Selecionar",class:r({"p-invalid":e(t).province_id})},null,8,["modelValue","options","class"]),l("small",Re,u(e(t).province_id),1)]),l("div",Ie,[Ne,s(e(v),{modelValue:e(y),"onUpdate:modelValue":o[2]||(o[2]=a=>n(y)?y.value=a:null),options:O.value,optionLabel:"name",optionValue:"id",placeholder:"Selecionar",class:r({"p-invalid":e(t).city_id})},null,8,["modelValue","options","class"]),l("small",ze,u(e(t).city_id),1)])]),l("div",Me,[We,s(re,{rows:"5",modelValue:e(U),"onUpdate:modelValue":o[3]||(o[3]=a=>n(U)?U.value=a:null),id:"description",type:"text",class:r({"p-invalid":e(t).description})},null,8,["modelValue","class"]),l("small",He,u(e(t).description),1)]),l("div",je,[l("div",Ae,[Ge,s(e(v),{modelValue:e(w),"onUpdate:modelValue":o[4]||(o[4]=a=>n(w)?w.value=a:null),options:W.value,optionLabel:"name",optionValue:"id",placeholder:"Selecionar",class:r({"p-invalid":e(t).main_category_id})},null,8,["modelValue","options","class"]),l("small",Oe,u(e(t).main_category_id),1)]),l("div",Ye,[Je,s(e(v),{modelValue:e(x),"onUpdate:modelValue":o[5]||(o[5]=a=>n(x)?x.value=a:null),options:W.value,optionLabel:"name",optionValue:"id",placeholder:"Selecionar",class:r({"p-invalid":e(t).second_category_id})},null,8,["modelValue","options","class"]),l("small",Ke,u(e(t).second_category_id),1)]),l("div",Qe,[Xe,s(e(v),{modelValue:e(k),"onUpdate:modelValue":o[6]||(o[6]=a=>n(k)?k.value=a:null),options:J.value,optionLabel:"name",optionValue:"id",placeholder:"Selecionar",class:r({"p-invalid":e(t).type_event_id})},null,8,["modelValue","options","class"]),l("small",Ze,u(e(t).type_event_id),1)])]),el,l("div",ll,[ol,s(e(m),{modelValue:e(P),"onUpdate:modelValue":o[7]||(o[7]=a=>n(P)?P.value=a:null),id:"address",type:"text",class:r({"p-invalid":e(t).address})},null,8,["modelValue","class"]),l("small",al,u(e(t).address),1)]),l("div",tl,[l("div",sl,[il,s(e(m),{modelValue:e(S),"onUpdate:modelValue":o[8]||(o[8]=a=>n(S)?S.value=a:null),id:"start_date",type:"date",class:r({"p-invalid":e(t).start_date})},null,8,["modelValue","class"]),l("small",dl,u(e(t).start_date),1)]),l("div",nl,[rl,s(e(m),{modelValue:e(q),"onUpdate:modelValue":o[9]||(o[9]=a=>n(q)?q.value=a:null),id:"start_time",type:"time",class:r({"p-invalid":e(t).start_time})},null,8,["modelValue","class"]),l("small",cl,u(e(t).start_time),1)])]),l("div",ul,[l("div",_l,[ml,s(e(m),{modelValue:e(C),"onUpdate:modelValue":o[10]||(o[10]=a=>n(C)?C.value=a:null),id:"end_date",type:"date",class:r({"p-invalid":e(t).end_date})},null,8,["modelValue","class"]),l("small",pl,u(e(t).end_date),1)]),l("div",vl,[hl,s(e(m),{modelValue:e(D),"onUpdate:modelValue":o[11]||(o[11]=a=>n(D)?D.value=a:null),id:"end_time",type:"time",class:r({"p-invalid":e(t).end_time})},null,8,["modelValue","class"]),l("small",bl,u(e(t).end_time),1)])]),fl,l("div",gl,[yl,s(e(m),{modelValue:e(E),"onUpdate:modelValue":o[12]||(o[12]=a=>n(E)?E.value=a:null),id:"email",type:"text",class:r({"p-invalid":e(t).email})},null,8,["modelValue","class"]),l("small",Vl,u(e(t).email),1)]),l("div",Ul,[wl,s(e(m),{modelValue:e(L),"onUpdate:modelValue":o[13]||(o[13]=a=>n(L)?L.value=a:null),id:"phone",type:"text",class:r({"p-invalid":e(t).phone})},null,8,["modelValue","class"]),l("small",xl,u(e(t).phone),1)]),l("div",kl,[Pl,s(e(m),{modelValue:e(F),"onUpdate:modelValue":o[14]||(o[14]=a=>n(F)?F.value=a:null),id:"website",type:"text",class:r({"p-invalid":e(t).website})},null,8,["modelValue","class"]),l("small",Sl,u(e(t).website),1)]),ql,l("div",Cl,[Dl,s(e(m),{modelValue:e(T),"onUpdate:modelValue":o[15]||(o[15]=a=>n(T)?T.value=a:null),id:"instagram",type:"text",class:r({"p-invalid":e(t).instagram})},null,8,["modelValue","class"]),l("small",El,u(e(t).instagram),1)]),l("div",Ll,[Fl,s(e(m),{modelValue:e(B),"onUpdate:modelValue":o[16]||(o[16]=a=>n(B)?B.value=a:null),id:"facebook",type:"text",class:r({"p-invalid":e(t).facebook})},null,8,["modelValue","class"]),l("small",Tl,u(e(t).facebook),1)]),l("div",Bl,[$l,s(e(m),{modelValue:e($),"onUpdate:modelValue":o[17]||(o[17]=a=>n($)?$.value=a:null),id:"twitter",type:"text",class:r({"p-invalid":e(t).twitter})},null,8,["modelValue","class"]),l("small",Rl,u(e(t).twitter),1)]),l("div",Il,[Nl,s(e(m),{modelValue:e(R),"onUpdate:modelValue":o[18]||(o[18]=a=>n(R)?R.value=a:null),id:"youtube",type:"text",class:r({"p-invalid":e(t).youtube})},null,8,["modelValue","class"]),s(e(m),{modelValue:e(I),"onUpdate:modelValue":o[19]||(o[19]=a=>n(I)?I.value=a:null),id:"_method",type:"hidden"},null,8,["modelValue"]),l("small",zl,u(e(t).youtube),1)]),l("div",Ml,[Wl,s(e(v),{modelValue:e(V),"onUpdate:modelValue":o[20]||(o[20]=a=>n(V)?V.value=a:null),options:Y.value,optionLabel:"name",optionValue:"id",placeholder:"Selecionar",class:r({"p-invalid":e(t).status_id})},null,8,["modelValue","options","class"])]),l("div",Hl,[l("img",{src:e(fe)+i.value.image,alt:"",weigth:"500",height:"500",style:{"border-radius":"15px"}},null,8,jl)]),Al,l("div",Gl,[Ol,s(ce,{mode:"basic",name:"image[]",accept:"image/*",auto:"",maxFileSize:1e6,customUpload:"",onUploader:de})])]),s(Q,{label:"Submeter",class:"mr-2 mb-2",onClick:e(j),disabled:b.value},null,8,["onClick","disabled"]),b.value?(A(),ve(X,{key:0,style:{width:"35px",height:"35px"},strokeWidth:"8",fill:"var(--surface-ground)",animationDuration:".5s","aria-label":"Custom ProgressSpinner"})):he("",!0)])],32)])]))}}};export{lo as default};
