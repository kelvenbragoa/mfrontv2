<script setup>
const smoothScroll = (id) => {
    document.querySelector(id).scrollIntoView({
        behavior: 'smooth'
    });
};
</script>
<template>
    <div class="py-4 px-4 mx-0 mt-8 lg:mx-8">
        <div class="grid justify-content-between">
            <div class="col-12 md:col-3" style="margin-top: -1.5rem">
                <a @click="smoothScroll('#home')" class="flex flex-wrap align-items-center justify-content-center md:justify-content-start md:mb-0 mb-3 cursor-pointer">
                    <h4 class="font-bold text-blue-500 text-3xl text-900">MTICKET</h4>
                </a>
                <p>Descubra coisas incríveis para fazer onde quer que vá.</p>
                <img :src="'/demo/images/google-play.png'" height="30" width="120" class="border-round hover:scale-110 transition duration-500 cursor-pointer object-cover m-1" />
                <img :src="'/demo/images/app-store.png'" height="30" width="120" class="border-round hover:scale-110 transition duration-500 cursor-pointer object-cover m-1" />
            </div>

            <div class="col-12 md:col-10 lg:col-7">
                <div class="grid text-center md:text-left">
                    <div class="col-12 md:col-2">
                        <h4 class="font-medium text-2xl line-height-3 mb-3 text-900">Mticket</h4>
                        <a class="line-height-3 text-xl block cursor-pointer mb-2 text-700">Sobre nós</a>
                        <a class="line-height-3 text-xl block cursor-pointer mb-2 text-700">Perguntas Frequentes</a>
                    </div>
                    <div class="col-12 md:col-3 mt-4 md:mt-0">
                        <h4 class="font-medium text-2xl line-height-3 mb-3 text-900">Aspectos Legais</h4>
                        <a class="line-height-3 text-xl block cursor-pointer mb-2 text-700">Políticas de Privacidade</a>
                        <a class="line-height-3 text-xl block cursor-pointer text-700">Termos de Serviço</a>
                    </div>
                    <div class="col-12 md:col-5 mt-4 md:mt-0">
                        <h4 class="font-medium text-2xl line-height-3 mb-3 text-900">Suporte</h4>
                        <a class="line-height-3 text-xl block cursor-pointer mb-2 text-700">Entre em contacto</a>
                        <a class="line-height-3 text-xl block cursor-pointer mb-2 text-700">Email: suporte@mticket.co.mz</a>
                        <a class="line-height-3 text-xl block cursor-pointer text-700">Telefone:+258 842648618 / 842280974</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
