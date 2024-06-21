import{u as re,r as p,a as ce,h as Q,o as ue,b as N,c as j,d as X,e as l,f as s,w as _e,g as e,s as n,v as r,t as c,k as me,l as pe,j as ve,x as m,y as b}from"./index-4c06444b.js";import{b as Z,s as he}from"./APIConstant-7cd3c3b1.js";import{u as be}from"./vee-validate.esm-153206bd.js";import{c as fe,a as u}from"./index.esm-7b5acfa1.js";const ge={key:0,className:"card"},ye={class:"col-12"},Ve={class:"card-w-title"},Ue=l("i",{class:"pi pi-angle-left"},null,-1),we=l("h5",null,"Editar Eventos",-1),xe=l("small",{class:"p-error"},"Os campos marcados * sao considerados campos obrigatorios.",-1),ke={class:"col-12 md:col-12"},Pe={class:"card p-fluid"},Se=l("h5",null,"Formulário Criação de Eventos",-1),qe=l("h5",null,"Informação Geral",-1),Ce={class:"field"},De=l("label",{for:"name"},"Nome",-1),Ee={id:"name-help",class:"p-error"},Fe={class:"formgrid grid"},Le={class:"field col"},Te=l("label",{for:"province_id"},"Provincia",-1),Be={id:"province_id-help",class:"p-error"},$e={class:"field col"},Re=l("label",{for:"city_id"},"Cidade",-1),Ie={id:"city_id-help",class:"p-error"},Ne={class:"field"},ze=l("label",{for:"description"},"Descrição do Evento",-1),Me={id:"description-help",class:"p-error"},We={class:"formgrid grid"},He={class:"field col"},je=l("label",{for:"main_category_id"},"Categoria Principal",-1),Ae={id:"main_category_id-help",class:"p-error"},Ge={class:"field col"},Oe=l("label",{for:"second_category_id"},"Categoria Secundário",-1),Ye={id:"second_category_id-help",class:"p-error"},Je={class:"field col"},Ke=l("label",{for:"type_event_id"},"Tipo de Eventos",-1),Qe={id:"type_event_id-help",class:"p-error"},Xe=l("h5",null,"Localização e Data do Evento",-1),Ze={class:"field"},el=l("label",{for:"address"},"Endereço",-1),ll={id:"address-help",class:"p-error"},ol={class:"formgrid grid"},al={class:"field col"},tl=l("label",{for:"start_date"},"Data de Inicio",-1),sl={id:"start_date-help",class:"p-error"},il={class:"field col"},dl=l("label",{for:"start_time"},"Horas de Inicio",-1),nl={id:"start_time-help",class:"p-error"},rl={class:"formgrid grid"},cl={class:"field col"},ul=l("label",{for:"end_date"},"Data de Termino",-1),_l={id:"end_date-help",class:"p-error"},ml={class:"field col"},pl=l("label",{for:"end_time"},"Horas de Termino",-1),vl={id:"end_time-help",class:"p-error"},hl=l("h5",null,"Contactos para Informações",-1),bl={class:"field"},fl=l("label",{for:"email"},"Email",-1),gl={id:"email-help",class:"p-error"},yl={class:"field"},Vl=l("label",{for:"phone"},"Telefone",-1),Ul={id:"phone-help",class:"p-error"},wl={class:"field"},xl=l("label",{for:"website"},"Website",-1),kl={id:"website-help",class:"p-error"},Pl=l("h5",null,"Redes Sociais",-1),Sl={class:"field"},ql=l("label",{for:"instagram"},"Instagram",-1),Cl={id:"instagram-help",class:"p-error"},Dl={class:"field"},El=l("label",{for:"facebook"},"Facebook",-1),Fl={id:"facebook-help",class:"p-error"},Ll={class:"field"},Tl=l("label",{for:"twitter"},"Twitter",-1),Bl={id:"twitter-help",class:"p-error"},$l={class:"field"},Rl=l("label",{for:"youtube"},"Video Youtube Promocional",-1),Il={id:"youtube-help",class:"p-error"},Nl={class:"col-12 lg:col-6 xl:col-6"},zl=["src"],Ml=l("h5",null,"Imagem Capa",-1),Wl={class:"field"},Hl=l("label",{for:"image"},"Imagem",-1),jl={key:1,class:"text-center"},Al=l("p",null,"Por Favor Aguarde...",-1),Ql={__name:"EditEventos",setup(Gl){const v=re(),z=p(!0),h=p(!1),A=p([]),G=p([]),O=p([]),M=p([]),i=p([]),W=ce();function Y(){v&&v.back()}const ee=fe({name:u().required().trim().label("Nome"),province_id:u().required().trim().label("Provincia"),city_id:u().required().trim().label("Cidade"),description:u().required().label("Descricao"),main_category_id:u().required().label("CategoriaPrincipal"),second_category_id:u().required().label("CategoriaSec"),type_event_id:u().required().label("Province"),address:u().required().label("Province"),start_date:u().required().label("Province"),start_time:u().required().label("Province"),end_date:u().required().label("Province"),end_time:u().required().label("Province"),email:u().required().label("Province"),phone:u().required().label("Province"),website:u().required().label("Province"),instagram:u().required().label("Province"),facebook:u().required().label("Province"),twitter:u().required().label("Province"),youtube:u().required().label("Province")}),{defineField:d,handleSubmit:le,resetForm:oe,errors:t,setErrors:ae}=be({validationSchema:ee}),[f]=d("name"),[g]=d("province_id"),[y]=d("city_id"),[V]=d("description"),[U]=d("main_category_id"),[w]=d("second_category_id"),[x]=d("type_event_id"),[k]=d("address"),[P]=d("start_date"),[S]=d("start_time"),[q]=d("end_date"),[C]=d("end_time"),[D]=d("email"),[E]=d("phone"),[F]=d("website"),[L]=d("instagram"),[T]=d("facebook"),[B]=d("twitter"),[$]=d("youtube"),[R]=d("_method"),I=p(),te=p(),se=_=>{I.value=_.files[0],console.log(I.value)},H=le(_=>{I.value!=null&&(_.image=I.value),console.log(_),h.value=!0,Q.post(`${Z}/promotor-eventos/${v.currentRoute.value.params.id}`,_,{headers:{"Content-Type":"multipart/form-data"}}).then(o=>{oe(),v.push({path:"/promotor/eventos"}),W.add({severity:"success",summary:"Successo",detail:"Registro editado com sucesso",life:3e3})}).catch(o=>{h.value=!1,W.add({severity:"error",summary:`${o.response.data.message}`,detail:"Detalhe da Mensagem",life:3e3}),o.response.data.errors&&ae(o.response.data.errors)}).finally(()=>{h.value=!1})}),ie=()=>{Q.get(`${Z}/promotor-eventos/${v.currentRoute.value.params.id}/edit`).then(_=>{i.value=_.data.event,A.value=_.data.province,G.value=_.data.city,M.value=_.data.category,O.value=_.data.typeevent,f.value=i.value.name,g.value=i.value.province_id,y.value=i.value.city_id,V.value=i.value.description,U.value=i.value.main_category_id,w.value=i.value.second_category_id,x.value=i.value.type_event_id,k.value=i.value.address,P.value=i.value.start_date,S.value=i.value.start_time,q.value=i.value.end_date,C.value=i.value.end_time,D.value=i.value.email,E.value=i.value.phone,F.value=i.value.website,L.value=i.value.instagram,T.value=i.value.facebook,B.value=i.value.twitter,$.value=i.value.youtube,te.value=i.value.image,R.value="put",z.value=!1}).catch(_=>{z.value=!1,W.add({severity:"error",summary:`${_}`,detail:"Message Detail",life:3e3}),Y()})};return ue(()=>{ie()}),(_,o)=>{const J=N("Button"),de=N("Textarea"),ne=N("FileUpload"),K=N("ProgressSpinner");return z.value?(j(),X("div",jl,[s(K,{style:{width:"50px",height:"50px"},strokeWidth:"8",fill:"var(--surface-ground)",animationDuration:".5s","aria-label":"Custom ProgressSpinner"}),Al])):(j(),X("div",ge,[l("div",ye,[l("div",Ve,[s(J,{label:"Voltar",class:"mr-2 mb-2",onClick:Y},{default:_e(()=>[Ue,ve(" Voltar")]),_:1}),we]),xe,l("form",{onSubmit:o[20]||(o[20]=(...a)=>e(H)&&e(H)(...a))},[l("div",ke,[l("div",Pe,[Se,qe,l("div",Ce,[De,s(e(m),{modelValue:e(f),"onUpdate:modelValue":o[0]||(o[0]=a=>n(f)?f.value=a:null),id:"name",type:"text",class:r({"p-invalid":e(t).name})},null,8,["modelValue","class"]),l("small",Ee,c(e(t).name),1)]),l("div",Fe,[l("div",Le,[Te,s(e(b),{modelValue:e(g),"onUpdate:modelValue":o[1]||(o[1]=a=>n(g)?g.value=a:null),options:A.value,optionLabel:"name",optionValue:"id",placeholder:"Selecionar",class:r({"p-invalid":e(t).province_id})},null,8,["modelValue","options","class"]),l("small",Be,c(e(t).province_id),1)]),l("div",$e,[Re,s(e(b),{modelValue:e(y),"onUpdate:modelValue":o[2]||(o[2]=a=>n(y)?y.value=a:null),options:G.value,optionLabel:"name",optionValue:"id",placeholder:"Selecionar",class:r({"p-invalid":e(t).city_id})},null,8,["modelValue","options","class"]),l("small",Ie,c(e(t).city_id),1)])]),l("div",Ne,[ze,s(de,{rows:"5",modelValue:e(V),"onUpdate:modelValue":o[3]||(o[3]=a=>n(V)?V.value=a:null),id:"description",type:"text",class:r({"p-invalid":e(t).description})},null,8,["modelValue","class"]),l("small",Me,c(e(t).description),1)]),l("div",We,[l("div",He,[je,s(e(b),{modelValue:e(U),"onUpdate:modelValue":o[4]||(o[4]=a=>n(U)?U.value=a:null),options:M.value,optionLabel:"name",optionValue:"id",placeholder:"Selecionar",class:r({"p-invalid":e(t).main_category_id})},null,8,["modelValue","options","class"]),l("small",Ae,c(e(t).main_category_id),1)]),l("div",Ge,[Oe,s(e(b),{modelValue:e(w),"onUpdate:modelValue":o[5]||(o[5]=a=>n(w)?w.value=a:null),options:M.value,optionLabel:"name",optionValue:"id",placeholder:"Selecionar",class:r({"p-invalid":e(t).second_category_id})},null,8,["modelValue","options","class"]),l("small",Ye,c(e(t).second_category_id),1)]),l("div",Je,[Ke,s(e(b),{modelValue:e(x),"onUpdate:modelValue":o[6]||(o[6]=a=>n(x)?x.value=a:null),options:O.value,optionLabel:"name",optionValue:"id",placeholder:"Selecionar",class:r({"p-invalid":e(t).type_event_id})},null,8,["modelValue","options","class"]),l("small",Qe,c(e(t).type_event_id),1)])]),Xe,l("div",Ze,[el,s(e(m),{modelValue:e(k),"onUpdate:modelValue":o[7]||(o[7]=a=>n(k)?k.value=a:null),id:"address",type:"text",class:r({"p-invalid":e(t).address})},null,8,["modelValue","class"]),l("small",ll,c(e(t).address),1)]),l("div",ol,[l("div",al,[tl,s(e(m),{modelValue:e(P),"onUpdate:modelValue":o[8]||(o[8]=a=>n(P)?P.value=a:null),id:"start_date",type:"date",class:r({"p-invalid":e(t).start_time})},null,8,["modelValue","class"]),l("small",sl,c(e(t).start_date),1)]),l("div",il,[dl,s(e(m),{modelValue:e(S),"onUpdate:modelValue":o[9]||(o[9]=a=>n(S)?S.value=a:null),id:"start_time",type:"time",class:r({"p-invalid":e(t).start_time})},null,8,["modelValue","class"]),l("small",nl,c(e(t).start_time),1)])]),l("div",rl,[l("div",cl,[ul,s(e(m),{modelValue:e(q),"onUpdate:modelValue":o[10]||(o[10]=a=>n(q)?q.value=a:null),id:"end_date",type:"date",class:r({"p-invalid":e(t).end_date})},null,8,["modelValue","class"]),l("small",_l,c(e(t).end_date),1)]),l("div",ml,[pl,s(e(m),{modelValue:e(C),"onUpdate:modelValue":o[11]||(o[11]=a=>n(C)?C.value=a:null),id:"end_time",type:"time",class:r({"p-invalid":e(t).end_time})},null,8,["modelValue","class"]),l("small",vl,c(e(t).end_time),1)])]),hl,l("div",bl,[fl,s(e(m),{modelValue:e(D),"onUpdate:modelValue":o[12]||(o[12]=a=>n(D)?D.value=a:null),id:"email",type:"text",class:r({"p-invalid":e(t).email})},null,8,["modelValue","class"]),l("small",gl,c(e(t).email),1)]),l("div",yl,[Vl,s(e(m),{modelValue:e(E),"onUpdate:modelValue":o[13]||(o[13]=a=>n(E)?E.value=a:null),id:"phone",type:"text",class:r({"p-invalid":e(t).phone})},null,8,["modelValue","class"]),l("small",Ul,c(e(t).phone),1)]),l("div",wl,[xl,s(e(m),{modelValue:e(F),"onUpdate:modelValue":o[14]||(o[14]=a=>n(F)?F.value=a:null),id:"website",type:"text",class:r({"p-invalid":e(t).website})},null,8,["modelValue","class"]),l("small",kl,c(e(t).website),1)]),Pl,l("div",Sl,[ql,s(e(m),{modelValue:e(L),"onUpdate:modelValue":o[15]||(o[15]=a=>n(L)?L.value=a:null),id:"instagram",type:"text",class:r({"p-invalid":e(t).instagram})},null,8,["modelValue","class"]),l("small",Cl,c(e(t).instagram),1)]),l("div",Dl,[El,s(e(m),{modelValue:e(T),"onUpdate:modelValue":o[16]||(o[16]=a=>n(T)?T.value=a:null),id:"facebook",type:"text",class:r({"p-invalid":e(t).facebook})},null,8,["modelValue","class"]),l("small",Fl,c(e(t).facebook),1)]),l("div",Ll,[Tl,s(e(m),{modelValue:e(B),"onUpdate:modelValue":o[17]||(o[17]=a=>n(B)?B.value=a:null),id:"twitter",type:"text",class:r({"p-invalid":e(t).twitter})},null,8,["modelValue","class"]),l("small",Bl,c(e(t).twitter),1)]),l("div",$l,[Rl,s(e(m),{modelValue:e($),"onUpdate:modelValue":o[18]||(o[18]=a=>n($)?$.value=a:null),id:"youtube",type:"text",class:r({"p-invalid":e(t).youtube})},null,8,["modelValue","class"]),s(e(m),{modelValue:e(R),"onUpdate:modelValue":o[19]||(o[19]=a=>n(R)?R.value=a:null),id:"_method",type:"hidden"},null,8,["modelValue"]),l("small",Il,c(e(t).youtube),1)]),l("div",Nl,[l("img",{src:e(he)+i.value.image,alt:"",weigth:"500",height:"500",style:{"border-radius":"15px"}},null,8,zl)]),Ml,l("div",Wl,[Hl,s(ne,{mode:"basic",name:"image[]",accept:"image/*",auto:"",maxFileSize:1e6,customUpload:"",onUploader:se})])]),s(J,{label:"Submeter",class:"mr-2 mb-2",onClick:e(H),disabled:h.value},null,8,["onClick","disabled"]),h.value?(j(),me(K,{key:0,style:{width:"35px",height:"35px"},strokeWidth:"8",fill:"var(--surface-ground)",animationDuration:".5s","aria-label":"Custom ProgressSpinner"})):pe("",!0)])],32)])]))}}};export{Ql as default};
