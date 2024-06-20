import axios from 'axios';
import router from './../router/index';
import { useRouter } from 'vue-router';


// export const baseURL = 'http://127.0.0.1:8000/api';
// export const styleURL = 'http://127.0.0.1:8000';
// export const storageURL = 'http://127.0.0.1:8000/storage/';

export const baseURL = 'http://192.168.194.232:8001/api';
export const styleURL = 'http://192.168.194.232:8001';
export const storageURL = 'http://192.168.194.232:8001/storage/';




export function logout() {

    axios.post(`${baseURL}/logout`).then((response) => {
        console.log(response);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.replace('/login');
    });
}
