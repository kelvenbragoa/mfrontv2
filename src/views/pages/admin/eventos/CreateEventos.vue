<script setup>
import { RouterView, RouterLink, useRouter, useRoute } from 'vue-router';
import { baseURL } from '@/service/ApiConstant';
import { onMounted, ref } from 'vue';
import axios from 'axios';
import { useForm } from 'vee-validate';
import * as yup from 'yup';
import { useToast } from 'primevue/usetoast';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';

const router = useRouter();
const isLoadingDiv = ref(true);
const isLoadingButton = ref(false);
const provinces = ref([]);
const cities = ref([]);
const typeevent = ref([]);
const categories = ref([]);
const toast = useToast();

function goBackUsingBack() {
    if (router) {
        router.back();
    }
}
const schema = yup.object({
    name: yup.string().required().trim().label('Nome'),
    province_id: yup.string().required().trim().label('Provincia'),
    city_id: yup.string().required().trim().label('Cidade'),
    description: yup.string().required().label('Descricao'),
    main_category_id: yup.string().required().label('CategoriaPrincipal'),
    second_category_id: yup.string().required().label('CategoriaSec'),
    type_event_id: yup.string().required().label('Province'),
    address: yup.string().required().label('Province'),
    start_date: yup.string().required().label('Province'),
    start_time: yup.string().required().label('Province'),
    end_date: yup.string().required().label('Province'),
    end_time: yup.string().required().label('Province'),
    email: yup.string().required().label('Province'),
    phone: yup.string().required().label('Province'),
    website: yup.string().required().label('Province'),
    instagram: yup.string().required().label('Province'),
    facebook: yup.string().required().label('Province'),
    twitter: yup.string().required().label('Province'),
    youtube: yup.string().required().label('Province'),


    // email: yup.string().required().email().label('Email province_id'),
    // fullName: yup.string().required().label('Full name'),
    // password: yup.string().required().min(6).label('Password'),
    // passwordConfirm: yup
    //     .string()
    //     .oneOf([yup.ref('password')], 'Passwords must match')
    //     .required()
    //     .label('Password confirmation'),
    // terms: yup.boolean().required().isTrue('You must agree to terms and conditions').label('terms agreement'),
    // type: yup.string().required().label('Account type')
});

const { defineField, handleSubmit, resetForm, errors, setErrors } = useForm({
    validationSchema: schema
});

const [name] = defineField('name');
const [province_id] = defineField('province_id');
const [city_id] = defineField('city_id');
const [description] = defineField('description');
const [main_category_id] = defineField('main_category_id');
const [second_category_id] = defineField('second_category_id');
const [type_event_id] = defineField('type_event_id');
const [address] = defineField('address');
const [start_date] = defineField('start_date');
const [start_time] = defineField('start_time');
const [end_date] = defineField('end_date');
const [end_time] = defineField('end_time');
const [email] = defineField('email');
const [phone] = defineField('phone');
const [website] = defineField('website');
const [instagram] = defineField('instagram');
const [facebook] = defineField('facebook');
const [twitter] = defineField('twitter');
const [youtube] = defineField('youtube');
const image = ref();

const onSubmit = handleSubmit((values) => {
    if (image.value != null) {
        values.image = image.value;
    }
    isLoadingButton.value = true;
    axios
        .post(`${baseURL}/promotor-eventos`, values,{
            headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        .then((response) => {
            resetForm();
            router.push({ path: '/admin/eventos' });
            toast.add({ severity: 'success', summary: `Successo`, detail: 'Evento criado com sucesso', life: 3000 });
        })
        .catch((error) => {
            isLoadingButton.value = false;
            toast.add({ severity: 'error', summary: `${error.response.data.message}`, detail: 'Detalhe da Mensagem', life: 3000 });
            if (error.response.data.errors) {
                setErrors(error.response.data.errors);
            }
        })
        .finally(() => {
            isLoadingButton.value = false;
        });
});

const onFileUpload = (event) => {
    image.value = event.files[0];
    console.log(image.value);
};

const getCreateEvents = () => {
    axios
        .get(`${baseURL}/promotor-eventos/create`)
        .then((response) => {
            // toast.add({ severity: 'success', summary: 'Success Message', detail: 'Message Detail', life: 3000 });
            provinces.value = response.data.province;
            cities.value = response.data.city;
            categories.value = response.data.category;
            typeevent.value = response.data.typeevent;
            isLoadingDiv.value = false;
        })
        .catch((error) => {
            isLoadingDiv.value = false;
            toast.add({ severity: 'error', summary: `${error}`, detail: 'Message Detail', life: 3000 });
            goBackUsingBack();
        });
};
onMounted(() => {
    getCreateEvents();
});
</script>
<template>
    <div className="card" v-if="!isLoadingDiv">
        <div class="col-12">
            <div class="card-w-title">
                <Button label="Voltar" class="mr-2 mb-2" @click="goBackUsingBack"><i class="pi pi-angle-left"></i> Voltar</Button>
                <h5>Criar Evento</h5>
            </div>

            <small class="p-error">Os campos marcados * sao considerados campos obrigatorios.</small>
            <form @submit="onSubmit">
                <div class="col-12 md:col-12">
                    <div class="card p-fluid">
                        <h5>Formulário Criação de Eventos</h5>
                        <h5>Informação Geral</h5>
                        <div class="field">
                            <label for="name">Nome</label>
                            <InputText v-model="name" id="name" type="text" :class="{ 'p-invalid': errors.name }" />
                            <small id="name-help" class="p-error">{{ errors.name }}</small>
                        </div>
                        <div class="formgrid grid">
                            <div class="field col">
                                <label for="province_id">Provincia</label>
                                <Dropdown v-model="province_id" :options="provinces" optionLabel="name" optionValue="id" placeholder="Selecionar" :class="{ 'p-invalid': errors.province_id }" />
                                <small id="province_id-help" class="p-error">{{ errors.province_id }}</small>
                            </div>
                            <div class="field col">
                                <label for="city_id">Cidade</label>
                                <Dropdown v-model="city_id" :options="cities" optionLabel="name" optionValue="id" placeholder="Selecionar" :class="{ 'p-invalid': errors.city_id }" />
                                <small id="city_id-help" class="p-error">{{ errors.city_id }}</small>
                            </div>
                        </div>
                        <div class="field">
                            <label for="description">Descrição do Evento</label>
                            <Textarea rows="5" v-model="description" id="description" type="text" :class="{ 'p-invalid': errors.description }" />
                            <small id="description-help" class="p-error">{{ errors.description }}</small>
                        </div>
                        <div class="formgrid grid">
                            <div class="field col">
                                <label for="main_category_id">Categoria Principal</label>
                                <Dropdown v-model="main_category_id" :options="categories" optionLabel="name" optionValue="id" placeholder="Selecionar" :class="{ 'p-invalid': errors.main_category_id }" />
                                <small id="main_category_id-help" class="p-error">{{ errors.main_category_id }}</small>
                            </div>
                            <div class="field col">
                                <label for="second_category_id">Categoria Secundário</label>
                                <Dropdown v-model="second_category_id" :options="categories" optionLabel="name" optionValue="id" placeholder="Selecionar" :class="{ 'p-invalid': errors.second_category_id }" />
                                <small id="second_category_id-help" class="p-error">{{ errors.second_category_id }}</small>
                            </div>
                            <div class="field col">
                                <label for="type_event_id">Tipo de Eventos</label>
                                <Dropdown v-model="type_event_id" :options="typeevent" optionLabel="name" optionValue="id" placeholder="Selecionar" :class="{ 'p-invalid': errors.type_event_id }" />
                                <small id="type_event_id-help" class="p-error">{{ errors.type_event_id }}</small>
                            </div>
                        </div>
                        <h5>Localização e Data do Evento</h5>
                        <div class="field">
                            <label for="address">Endereço</label>
                            <InputText v-model="address" id="address" type="text" :class="{ 'p-invalid': errors.address }" />
                            <small id="address-help" class="p-error">{{ errors.address }}</small>
                        </div>
                        <div class="formgrid grid">
                            <div class="field col">
                                <label for="start_date">Data de Inicio</label>
                                <InputText v-model="start_date" id="start_date" type="date" :class="{ 'p-invalid': errors.start_date }" />
                                <small id="start_date-help" class="p-error">{{ errors.start_date }}</small>
                            </div>
                            <div class="field col">
                                <label for="start_time">Horas de Inicio</label>
                                <InputText v-model="start_time" id="start_time" type="time" :class="{ 'p-invalid': errors.start_time }" />
                                <small id="start_time-help" class="p-error">{{ errors.start_time }}</small>
                            </div>
                        </div>
                        <div class="formgrid grid">
                            <div class="field col">
                                <label for="end_date">Data de Termino</label>
                                <InputText v-model="end_date" id="end_date" type="date" :class="{ 'p-invalid': errors.end_date }" />

                                <small id="end_date-help" class="p-error">{{ errors.end_date }}</small>
                            </div>
                            <div class="field col">
                                <label for="end_time">Horas de Termino</label>
                                <InputText v-model="end_time" id="end_time" type="time" :class="{ 'p-invalid': errors.end_time }" />
                                <small id="end_time-help" class="p-error">{{ errors.end_time }}</small>
                            </div>
                        </div>
                        <h5>Contactos para Informações</h5>
                        <div class="field">
                            <label for="email">Email</label>
                            <InputText v-model="email" id="email" type="text" :class="{ 'p-invalid': errors.email }" />
                            <small id="email-help" class="p-error">{{ errors.email }}</small>
                        </div>
                        <div class="field">
                            <label for="phone">Telefone</label>
                            <InputText v-model="phone" id="phone" type="text" :class="{ 'p-invalid': errors.phone }" />
                            <small id="phone-help" class="p-error">{{ errors.phone }}</small>
                        </div>

                        <div class="field">
                            <label for="website">Website</label>
                            <InputText v-model="website" id="website" type="text" :class="{ 'p-invalid': errors.website }" />
                            <small id="website-help" class="p-error">{{ errors.website }}</small>
                        </div>
                        <h5>Redes Sociais</h5>
                        <div class="field">
                            <label for="instagram">Instagram</label>
                            <InputText v-model="instagram" id="instagram" type="text" :class="{ 'p-invalid': errors.instagram }" />
                            <small id="instagram-help" class="p-error">{{ errors.instagram }}</small>
                        </div>
                        <div class="field">
                            <label for="facebook">Facebook</label>
                            <InputText v-model="facebook" id="facebook" type="text" :class="{ 'p-invalid': errors.facebook }" />
                            <small id="facebook-help" class="p-error">{{ errors.facebook }}</small>
                        </div>
                        <div class="field">
                            <label for="twitter">Twitter</label>
                            <InputText v-model="twitter" id="twitter" type="text" :class="{ 'p-invalid': errors.twitter }" />
                            <small id="twitter-help" class="p-error">{{ errors.twitter }}</small>
                        </div>
                        <div class="field">
                            <label for="youtube">Video Youtube Promocional</label>
                            <InputText v-model="youtube" id="youtube" type="text" :class="{ 'p-invalid': errors.youtube }" />
                            <small id="youtube-help" class="p-error">{{ errors.youtube }}</small>
                        </div>
                        <h5>Imagem Capa</h5>
                        <div class="field">
                            <label for="image">Imagem</label>
                            <FileUpload mode="basic" name="image[]" accept="image/*" auto :maxFileSize="1000000" customUpload @uploader="onFileUpload" />
                        </div>


                        <!-- <div class="formgrid grid">
                            <div class="field col">
                            <label for="license">Carta de Condução</label>
                            <InputText v-model="license" id="license" type="text" :class="{ 'p-invalid': errors.license }" />
                            <small id="license-help" class="p-error">{{ errors.license }}</small>
                            </div>
                            <div class="field col">
                                <label for="mobile">Telefone</label>
                                <InputText v-model="mobile" id="mobile" type="text" :class="{ 'p-invalid': errors.mobile }" />
                                <small id="mobile-help" class="p-error">{{ errors.mobile }}</small>
                            </div>
                        </div>

                        
                       
                        <div class="field">
                            <label for="province_id">Provincia</label>
                            <Dropdown v-model="province_id" :options="provinces" optionLabel="name" optionValue="id" placeholder="Selecionar" :class="{ 'p-invalid': errors.province_id }" />
                            <small id="province_id-help" class="p-error">{{ errors.province_id }}</small>
                        </div> -->
                    </div>
                    <Button label="Submeter" class="mr-2 mb-2" @click="onSubmit" :disabled="isLoadingButton"></Button
                    ><ProgressSpinner style="width: 35px; height: 35px" strokeWidth="8" fill="var(--surface-ground)" animationDuration=".5s" aria-label="Custom ProgressSpinner" v-if="isLoadingButton" />
                </div>
            </form>
        </div>
    </div>
    <div class="text-center" v-else>
        <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="8" fill="var(--surface-ground)" animationDuration=".5s" aria-label="Custom ProgressSpinner" />
        <p>Por Favor Aguarde...</p>
    </div>
</template>
