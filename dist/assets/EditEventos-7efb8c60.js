import{u as ce,r as p,a as ue,h as X,o as _e,b,c as j,d as Z,e,f as s,w as me,g as l,n,p as u,t as r,k as pe,l as ve,j as he,s as m,q as f}from"./index-b670bd76.js";import{b as ee,s as be}from"./APIConstant-43486e71.js";import{u as fe}from"./vee-validate.esm-a565d278.js";import{c as ge,a as c}from"./index.esm-a7e89c92.js";const ye={key:0,className:"card"},Ve={class:"col-12"},we={class:"card-w-title"},Ue=e("i",{class:"pi pi-angle-left"},null,-1),ke=e("h5",null,"Editar Eventos",-1),xe=e("small",{class:"p-error"},"Os campos marcados * sao considerados campos obrigatorios.",-1),Pe={class:"col-12 md:col-12"},Ce={class:"card p-fluid"},qe=e("h5",null,"Formulário Criação de Eventos",-1),Se=e("h5",null,"Informação Geral",-1),Be={class:"field"},De=e("label",{for:"name"},"Nome",-1),Ee={id:"name-help",class:"p-error"},Fe={class:"formgrid grid"},Le={class:"field col"},Te=e("label",{for:"province_id"},"Provincia",-1),Ie={id:"province_id-help",class:"p-error"},$e={class:"field col"},Re=e("label",{for:"city_id"},"Cidade",-1),Ne={id:"city_id-help",class:"p-error"},ze={class:"field"},Me=e("label",{for:"description"},"Descrição do Evento",-1),We={id:"description-help",class:"p-error"},He={class:"formgrid grid"},je={class:"field col"},Ae=e("label",{for:"main_category_id"},"Categoria Principal",-1),Ge={id:"main_category_id-help",class:"p-error"},Oe={class:"field col"},Ye=e("label",{for:"second_category_id"},"Categoria Secundário",-1),Je={id:"second_category_id-help",class:"p-error"},Ke={class:"field col"},Qe=e("label",{for:"type_event_id"},"Tipo de Eventos",-1),Xe={id:"type_event_id-help",class:"p-error"},Ze=e("h5",null,"Localização e Data do Evento",-1),el={class:"field"},ll=e("label",{for:"address"},"Endereço",-1),ol={id:"address-help",class:"p-error"},al={class:"formgrid grid"},tl={class:"field col"},sl=e("label",{for:"start_date"},"Data de Inicio",-1),il={id:"start_date-help",class:"p-error"},dl={class:"field col"},nl=e("label",{for:"start_time"},"Horas de Inicio",-1),rl={id:"start_time-help",class:"p-error"},cl={class:"formgrid grid"},ul={class:"field col"},_l=e("label",{for:"end_date"},"Data de Termino",-1),ml={id:"end_date-help",class:"p-error"},pl={class:"field col"},vl=e("label",{for:"end_time"},"Horas de Termino",-1),hl={id:"end_time-help",class:"p-error"},bl=e("h5",null,"Contactos para Informações",-1),fl={class:"field"},gl=e("label",{for:"email"},"Email",-1),yl={id:"email-help",class:"p-error"},Vl={class:"field"},wl=e("label",{for:"phone"},"Telefone",-1),Ul={id:"phone-help",class:"p-error"},kl={class:"field"},xl=e("label",{for:"website"},"Website",-1),Pl={id:"website-help",class:"p-error"},Cl=e("h5",null,"Redes Sociais",-1),ql={class:"field"},Sl=e("label",{for:"instagram"},"Instagram",-1),Bl={id:"instagram-help",class:"p-error"},Dl={class:"field"},El=e("label",{for:"facebook"},"Facebook",-1),Fl={id:"facebook-help",class:"p-error"},Ll={class:"field"},Tl=e("label",{for:"twitter"},"Twitter",-1),Il={id:"twitter-help",class:"p-error"},$l={class:"field"},Rl=e("label",{for:"youtube"},"Video Youtube Promocional",-1),Nl={id:"youtube-help",class:"p-error"},zl={class:"col-12 lg:col-6 xl:col-6"},Ml=["src"],Wl=e("h5",null,"Imagem Capa",-1),Hl={class:"field"},jl=e("label",{for:"image"},"Imagem",-1),Al={key:1,class:"text-center"},Gl=e("p",null,"Por Favor Aguarde...",-1),Xl={__name:"EditEventos",setup(Ol){const v=ce(),z=p(!0),h=p(!1),A=p([]),G=p([]),O=p([]),M=p([]),i=p([]),W=ue();function Y(){v&&v.back()}const le=ge({name:c().required().trim().label("Nome"),province_id:c().required().trim().label("Provincia"),city_id:c().required().trim().label("Cidade"),description:c().required().label("Descricao"),main_category_id:c().required().label("CategoriaPrincipal"),second_category_id:c().required().label("CategoriaSec"),type_event_id:c().required().label("Province"),address:c().required().label("Province"),start_date:c().required().label("Province"),start_time:c().required().label("Province"),end_date:c().required().label("Province"),end_time:c().required().label("Province"),email:c().required().label("Province"),phone:c().required().label("Province"),website:c().required().label("Province"),instagram:c().required().label("Province"),facebook:c().required().label("Province"),twitter:c().required().label("Province"),youtube:c().required().label("Province")}),{defineField:d,handleSubmit:oe,resetForm:ae,errors:t,setErrors:te}=fe({validationSchema:le}),[g]=d("name"),[y]=d("province_id"),[V]=d("city_id"),[w]=d("description"),[U]=d("main_category_id"),[k]=d("second_category_id"),[x]=d("type_event_id"),[P]=d("address"),[C]=d("start_date"),[q]=d("start_time"),[S]=d("end_date"),[B]=d("end_time"),[D]=d("email"),[E]=d("phone"),[F]=d("website"),[L]=d("instagram"),[T]=d("facebook"),[I]=d("twitter"),[$]=d("youtube"),[R]=d("_method"),N=p(),se=p(),ie=_=>{N.value=_.files[0],console.log(N.value)},H=oe(_=>{N.value!=null&&(_.image=N.value),console.log(_),h.value=!0,X.post(`${ee}/promotor-eventos/${v.currentRoute.value.params.id}`,_,{headers:{"Content-Type":"multipart/form-data"}}).then(o=>{ae(),v.push({path:"/promotor/eventos"}),W.add({severity:"success",summary:"Successo",detail:"Registro editado com sucesso",life:3e3})}).catch(o=>{h.value=!1,W.add({severity:"error",summary:`${o.response.data.message}`,detail:"Detalhe da Mensagem",life:3e3}),o.response.data.errors&&te(o.response.data.errors)}).finally(()=>{h.value=!1})}),de=()=>{X.get(`${ee}/promotor-eventos/${v.currentRoute.value.params.id}/edit`).then(_=>{i.value=_.data.event,A.value=_.data.province,G.value=_.data.city,M.value=_.data.category,O.value=_.data.typeevent,g.value=i.value.name,y.value=i.value.province_id,V.value=i.value.city_id,w.value=i.value.description,U.value=i.value.main_category_id,k.value=i.value.second_category_id,x.value=i.value.type_event_id,P.value=i.value.address,C.value=i.value.start_date,q.value=i.value.start_time,S.value=i.value.end_date,B.value=i.value.end_time,D.value=i.value.email,E.value=i.value.phone,F.value=i.value.website,L.value=i.value.instagram,T.value=i.value.facebook,I.value=i.value.twitter,$.value=i.value.youtube,se.value=i.value.image,R.value="put",z.value=!1}).catch(_=>{z.value=!1,W.add({severity:"error",summary:`${_}`,detail:"Message Detail",life:3e3}),Y()})};return _e(()=>{de()}),(_,o)=>{const J=b("Button"),ne=b("Textarea"),K=b("Calendar"),re=b("FileUpload"),Q=b("ProgressSpinner");return z.value?(j(),Z("div",Al,[s(Q,{style:{width:"50px",height:"50px"},strokeWidth:"8",fill:"var(--surface-ground)",animationDuration:".5s","aria-label":"Custom ProgressSpinner"}),Gl])):(j(),Z("div",ye,[e("div",Ve,[e("div",we,[s(J,{label:"Voltar",class:"mr-2 mb-2",onClick:Y},{default:me(()=>[Ue,he(" Voltar")]),_:1}),ke]),xe,e("form",{onSubmit:o[20]||(o[20]=(...a)=>l(H)&&l(H)(...a))},[e("div",Pe,[e("div",Ce,[qe,Se,e("div",Be,[De,s(l(m),{modelValue:l(g),"onUpdate:modelValue":o[0]||(o[0]=a=>n(g)?g.value=a:null),id:"name",type:"text",class:u({"p-invalid":l(t).name})},null,8,["modelValue","class"]),e("small",Ee,r(l(t).name),1)]),e("div",Fe,[e("div",Le,[Te,s(l(f),{modelValue:l(y),"onUpdate:modelValue":o[1]||(o[1]=a=>n(y)?y.value=a:null),options:A.value,optionLabel:"name",optionValue:"id",placeholder:"Selecionar",class:u({"p-invalid":l(t).province_id})},null,8,["modelValue","options","class"]),e("small",Ie,r(l(t).province_id),1)]),e("div",$e,[Re,s(l(f),{modelValue:l(V),"onUpdate:modelValue":o[2]||(o[2]=a=>n(V)?V.value=a:null),options:G.value,optionLabel:"name",optionValue:"id",placeholder:"Selecionar",class:u({"p-invalid":l(t).city_id})},null,8,["modelValue","options","class"]),e("small",Ne,r(l(t).city_id),1)])]),e("div",ze,[Me,s(ne,{rows:"5",modelValue:l(w),"onUpdate:modelValue":o[3]||(o[3]=a=>n(w)?w.value=a:null),id:"description",type:"text",class:u({"p-invalid":l(t).description})},null,8,["modelValue","class"]),e("small",We,r(l(t).description),1)]),e("div",He,[e("div",je,[Ae,s(l(f),{modelValue:l(U),"onUpdate:modelValue":o[4]||(o[4]=a=>n(U)?U.value=a:null),options:M.value,optionLabel:"name",optionValue:"id",placeholder:"Selecionar",class:u({"p-invalid":l(t).main_category_id})},null,8,["modelValue","options","class"]),e("small",Ge,r(l(t).main_category_id),1)]),e("div",Oe,[Ye,s(l(f),{modelValue:l(k),"onUpdate:modelValue":o[5]||(o[5]=a=>n(k)?k.value=a:null),options:M.value,optionLabel:"name",optionValue:"id",placeholder:"Selecionar",class:u({"p-invalid":l(t).second_category_id})},null,8,["modelValue","options","class"]),e("small",Je,r(l(t).second_category_id),1)]),e("div",Ke,[Qe,s(l(f),{modelValue:l(x),"onUpdate:modelValue":o[6]||(o[6]=a=>n(x)?x.value=a:null),options:O.value,optionLabel:"name",optionValue:"id",placeholder:"Selecionar",class:u({"p-invalid":l(t).type_event_id})},null,8,["modelValue","options","class"]),e("small",Xe,r(l(t).type_event_id),1)])]),Ze,e("div",el,[ll,s(l(m),{modelValue:l(P),"onUpdate:modelValue":o[7]||(o[7]=a=>n(P)?P.value=a:null),id:"address",type:"text",class:u({"p-invalid":l(t).address})},null,8,["modelValue","class"]),e("small",ol,r(l(t).address),1)]),e("div",al,[e("div",tl,[sl,s(K,{showIcon:!0,showButtonBar:!0,modelValue:l(C),"onUpdate:modelValue":o[8]||(o[8]=a=>n(C)?C.value=a:null)},null,8,["modelValue"]),e("small",il,r(l(t).start_date),1)]),e("div",dl,[nl,s(l(m),{modelValue:l(q),"onUpdate:modelValue":o[9]||(o[9]=a=>n(q)?q.value=a:null),id:"start_time",type:"time",class:u({"p-invalid":l(t).start_time})},null,8,["modelValue","class"]),e("small",rl,r(l(t).start_time),1)])]),e("div",cl,[e("div",ul,[_l,s(K,{showIcon:!0,showButtonBar:!0,modelValue:l(S),"onUpdate:modelValue":o[10]||(o[10]=a=>n(S)?S.value=a:null)},null,8,["modelValue"]),e("small",ml,r(l(t).end_date),1)]),e("div",pl,[vl,s(l(m),{modelValue:l(B),"onUpdate:modelValue":o[11]||(o[11]=a=>n(B)?B.value=a:null),id:"end_time",type:"time",class:u({"p-invalid":l(t).end_time})},null,8,["modelValue","class"]),e("small",hl,r(l(t).end_time),1)])]),bl,e("div",fl,[gl,s(l(m),{modelValue:l(D),"onUpdate:modelValue":o[12]||(o[12]=a=>n(D)?D.value=a:null),id:"email",type:"text",class:u({"p-invalid":l(t).email})},null,8,["modelValue","class"]),e("small",yl,r(l(t).email),1)]),e("div",Vl,[wl,s(l(m),{modelValue:l(E),"onUpdate:modelValue":o[13]||(o[13]=a=>n(E)?E.value=a:null),id:"phone",type:"text",class:u({"p-invalid":l(t).phone})},null,8,["modelValue","class"]),e("small",Ul,r(l(t).phone),1)]),e("div",kl,[xl,s(l(m),{modelValue:l(F),"onUpdate:modelValue":o[14]||(o[14]=a=>n(F)?F.value=a:null),id:"website",type:"text",class:u({"p-invalid":l(t).website})},null,8,["modelValue","class"]),e("small",Pl,r(l(t).website),1)]),Cl,e("div",ql,[Sl,s(l(m),{modelValue:l(L),"onUpdate:modelValue":o[15]||(o[15]=a=>n(L)?L.value=a:null),id:"instagram",type:"text",class:u({"p-invalid":l(t).instagram})},null,8,["modelValue","class"]),e("small",Bl,r(l(t).instagram),1)]),e("div",Dl,[El,s(l(m),{modelValue:l(T),"onUpdate:modelValue":o[16]||(o[16]=a=>n(T)?T.value=a:null),id:"facebook",type:"text",class:u({"p-invalid":l(t).facebook})},null,8,["modelValue","class"]),e("small",Fl,r(l(t).facebook),1)]),e("div",Ll,[Tl,s(l(m),{modelValue:l(I),"onUpdate:modelValue":o[17]||(o[17]=a=>n(I)?I.value=a:null),id:"twitter",type:"text",class:u({"p-invalid":l(t).twitter})},null,8,["modelValue","class"]),e("small",Il,r(l(t).twitter),1)]),e("div",$l,[Rl,s(l(m),{modelValue:l($),"onUpdate:modelValue":o[18]||(o[18]=a=>n($)?$.value=a:null),id:"youtube",type:"text",class:u({"p-invalid":l(t).youtube})},null,8,["modelValue","class"]),s(l(m),{modelValue:l(R),"onUpdate:modelValue":o[19]||(o[19]=a=>n(R)?R.value=a:null),id:"_method",type:"hidden"},null,8,["modelValue"]),e("small",Nl,r(l(t).youtube),1)]),e("div",zl,[e("img",{src:l(be)+i.value.image,alt:"",weigth:"500",height:"500",style:{"border-radius":"15px"}},null,8,Ml)]),Wl,e("div",Hl,[jl,s(re,{mode:"basic",name:"image[]",accept:"image/*",auto:"",maxFileSize:1e6,customUpload:"",onUploader:ie})])]),s(J,{label:"Submeter",class:"mr-2 mb-2",onClick:l(H),disabled:h.value},null,8,["onClick","disabled"]),h.value?(j(),pe(Q,{key:0,style:{width:"35px",height:"35px"},strokeWidth:"8",fill:"var(--surface-ground)",animationDuration:".5s","aria-label":"Custom ProgressSpinner"})):ve("",!0)])],32)])]))}}};export{Xl as default};
