import { createRouter, createWebHistory } from 'vue-router';
import AppLayout from '@/layout/AppLayout.vue';
import AppPromotorLayout from '@/layoutpromotor/AppPromotorLayout.vue';
import AppAdminLayout from '@/layoutadmin/AppAdminLayout.vue';
import AppHomeLayout from '@/layouthome/AppHomeLayout.vue';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/admin/dashboard',
            component: AppAdminLayout,
            children: [
                {
                    path: '/admin/dashboard',
                    name: 'admin.dashboard',
                    component: () => import('@/views/pages/admin/Dashboard.vue')
                },
                {
                    path: '/admin/transacoes',
                    name: 'admin.transacoes',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/admin/transacoes/IndexTransacoes.vue')
                },
                {
                    path: '/admin/tickets',
                    name: 'admin.tickets',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/admin/tickets/IndexTickets.vue')
                },
                {
                    path: '/admin/tickets/:id',
                    name: 'admin.tickets.show',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/admin/tickets/ShowTickets.vue')
                },
                {
                    path: '/admin/transacoes/:id/edit',
                    name: 'admin.transacoes.edit',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/admin/transacoes/EditTransacoes.vue')
                },
                {
                    path: '/admin/eventos',
                    name: 'admin.eventos',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/admin/eventos/IndexEventos.vue')
                },
                {
                    path: '/admin/eventos/create',
                    name: 'admin.eventos.create',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/admin/eventos/CreateEventos.vue')
                },
                {
                    path: '/admin/eventos/:id',
                    name: 'admin.eventos.show',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/admin/eventos/ShowEventos.vue')
                },
                {
                    path: '/admin/eventos/:id/edit',
                    name: 'admin.eventos.edit',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/admin/eventos/EditEventos.vue')
                },
                //bilhete
                {
                    path: '/admin/eventos/:id/bilhetes/create',
                    name: 'admin.eventos.show.bilhete.create',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/admin/eventos/bilhetes/CreateBilhetes.vue')
                },
                {
                    path: '/admin/eventos/:id/bilhetes/:idbilhetes/edit',
                    name: 'admin.eventos.show.bilhete.edit',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/admin/eventos/bilhetes/EditBilhetes.vue')
                },
                {
                    path: '/admin/eventos/:id/bilhetes/:idbilhetes',
                    name: 'admin.eventos.show.bilhete.show',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/admin/eventos/bilhetes/ShowBilhetes.vue')
                },
                //convite
                {
                    path: '/admin/eventos/:id/convites/create',
                    name: 'admin.eventos.show.convite.create',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/admin/eventos/convites/CreateConvites.vue')
                },
                {
                    path: '/admin/eventos/:id/convites/:idconvites/edit',
                    name: 'admin.eventos.show.convite.edit',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/admin/eventos/convites/EditConvites.vue')
                },
                {
                    path: '/admin/eventos/:id/convites/:idconvites',
                    name: 'admin.eventos.show.convite.show',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/admin/eventos/convites/ShowConvites.vue')
                },
                //pacotes
                {
                    path: '/admin/eventos/:id/pacotes/create',
                    name: 'admin.eventos.show.pacote.create',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/admin/eventos/pacotes/CreatePacotes.vue')
                },
                {
                    path: '/admin/eventos/:id/pacotes/:idpacotes/edit',
                    name: 'admin.eventos.show.pacote.edit',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/admin/eventos/pacotes/EditPacotes.vue')
                },
                {
                    path: '/admin/eventos/:id/pacotes/:idpacotes',
                    name: 'admin.eventos.show.pacote.show',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/admin/eventos/pacotes/ShowPacotes.vue')
                },
                //bar
                {
                    path: '/admin/eventos/:id/bar/create',
                    name: 'admin.eventos.show.bar.create',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/admin/eventos/bar/CreateBar.vue')
                },
                {
                    path: '/admin/eventos/:id/bar/:idbar/edit',
                    name: 'admin.eventos.show.bar.edit',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/admin/eventos/bar/EditBar.vue')
                },
                {
                    path: '/admin/eventos/:id/bar/:idbar',
                    name: 'admin.eventos.show.bar.show',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/admin/eventos/bar/ShowBar.vue')
                },
                //protocolo
                {
                    path: '/admin/eventos/:id/protocolos/create',
                    name: 'admin.eventos.show.protocolos.create',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/admin/eventos/protocolos/CreateProtocolo.vue')
                },
                {
                    path: '/admin/eventos/:id/protocolos/:idprotocolo/edit',
                    name: 'admin.eventos.show.protocolos.edit',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/admin/eventos/protocolos/EditProtocolo.vue')
                },
                {
                    path: '/admin/eventos/:id/protocolos/:idprotocolo',
                    name: 'admin.eventos.show.protocolos.show',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/admin/eventos/protocolos/ShowProtocolo.vue')
                },
                //barman
                {
                    path: '/admin/eventos/:id/barmans/create',
                    name: 'admin.eventos.show.barmans.create',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/admin/eventos/barmans/CreateBarman.vue')
                },
                {
                    path: '/admin/eventos/:id/barmans/:idbarman/edit',
                    name: 'admin.eventos.show.barmans.edit',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/admin/eventos/barmans/EditBarman.vue')
                },
                {
                    path: '/admin/eventos/:id/barmans/:idbarman',
                    name: 'admin.eventos.show.barmans.show',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/admin/eventos/barmans/ShowBarman.vue')
                },
                //lineups
                {
                    path: '/admin/eventos/:id/lineup/create',
                    name: 'admin.eventos.show.lineup.create',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/admin/eventos/lineups/CreateLineUps.vue')
                },
                {
                    path: '/admin/eventos/:id/lineup/:idlineup/edit',
                    name: 'admin.eventos.show.lineup.edit',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/admin/eventos/lineups/EditLineUps.vue')
                },
                {
                    path: '/admin/eventos/:id/lineup/:idlineup',
                    name: 'admin.eventos.show.lineup.show',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/admin/eventos/lineups/ShowLineUps.vue')
                },
                //produtos
                {
                    path: '/admin/eventos/:id/produtos/create',
                    name: 'admin.eventos.show.produtos.create',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/admin/eventos/produtos/CreateProdutos.vue')
                },
                {
                    path: '/admin/eventos/:id/produtos/:idproduto/edit',
                    name: 'admin.eventos.show.produtos.edit',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/admin/eventos/produtos/EditProdutos.vue')
                },
                {
                    path: '/admin/eventos/:id/produtos/:idproduto',
                    name: 'admin.eventos.show.produtos.show',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/admin/eventos/produtos/ShowProdutos.vue')
                },

                //profile
                {
                    path: '/admin/perfil',
                    name: 'admin.perfil',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/admin/profile/IndexProfile.vue')
                },
                //notification
                {
                    path: '/admin/notificacoes',
                    name: 'admin.noticacao',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/admin/notifications/IndexNotification.vue')
                },
                //evento dashboard
                {
                    path: '/admin/eventos/:id/dashboard',
                    name: 'admin.eventos.dashboard',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/admin/eventos/dashboard/Dashboard.vue')
                },
                //evento dashboard bilhete
                {
                    path: '/admin/eventos/:id/dashboard/bilhetes',
                    name: 'admin.eventos.dashboard.bilhetes',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/admin/eventos/dashboard/bilhetes/IndexDashboardBilhetes.vue')
                },
                //evento dashboard pacotes
                {
                    path: '/admin/eventos/:id/dashboard/pacotes',
                    name: 'admin.eventos.dashboard.pacotes',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/admin/eventos/dashboard/pacotes/IndexDashboardPacotes.vue')
                },
                //evento dashboard convites
                {
                    path: '/admin/eventos/:id/dashboard/convites',
                    name: 'admin.eventos.dashboard.convites',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/admin/eventos/dashboard/convites/IndexDashboardConvites.vue')
                },
                //evento dashboard lineups
                {
                    path: '/admin/eventos/:id/dashboard/lineups',
                    name: 'admin.eventos.dashboard.lineups',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/admin/eventos/dashboard/lineups/IndexDashboardLineups.vue')
                },
            ]
        },

        {
            path: '/promotor/dashboard',
            component: AppPromotorLayout,
            children: [
                {
                    path: '/promotor/dashboard',
                    name: 'promotor.dashboard',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/promotor/Dashboard.vue')
                },
                {
                    path: '/promotor/eventos',
                    name: 'promotor.eventos',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/promotor/eventos/IndexEventos.vue')
                },
                {
                    path: '/promotor/eventos/create',
                    name: 'promotor.eventos.create',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/promotor/eventos/CreateEventos.vue')
                },
                {
                    path: '/promotor/eventos/:id',
                    name: 'promotor.eventos.show',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/promotor/eventos/ShowEventos.vue')
                },
                {
                    path: '/promotor/eventos/:id/edit',
                    name: 'promotor.eventos.edit',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/promotor/eventos/EditEventos.vue')
                },
                //bilhete
                {
                    path: '/promotor/eventos/:id/bilhetes/create',
                    name: 'promotor.eventos.show.bilhete.create',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/promotor/eventos/bilhetes/CreateBilhetes.vue')
                },
                {
                    path: '/promotor/eventos/:id/bilhetes/:idbilhetes/edit',
                    name: 'promotor.eventos.show.bilhete.edit',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/promotor/eventos/bilhetes/EditBilhetes.vue')
                },
                {
                    path: '/promotor/eventos/:id/bilhetes/:idbilhetes',
                    name: 'promotor.eventos.show.bilhete.show',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/promotor/eventos/bilhetes/ShowBilhetes.vue')
                },
                //convite
                {
                    path: '/promotor/eventos/:id/convites/create',
                    name: 'promotor.eventos.show.convite.create',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/promotor/eventos/convites/CreateConvites.vue')
                },
                {
                    path: '/promotor/eventos/:id/convites/:idconvites/edit',
                    name: 'promotor.eventos.show.convite.edit',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/promotor/eventos/convites/EditConvites.vue')
                },
                {
                    path: '/promotor/eventos/:id/convites/:idconvites',
                    name: 'promotor.eventos.show.convite.show',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/promotor/eventos/convites/ShowConvites.vue')
                },
                //pacotes
                {
                    path: '/promotor/eventos/:id/pacotes/create',
                    name: 'promotor.eventos.show.pacote.create',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/promotor/eventos/pacotes/CreatePacotes.vue')
                },
                {
                    path: '/promotor/eventos/:id/pacotes/:idpacotes/edit',
                    name: 'promotor.eventos.show.pacote.edit',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/promotor/eventos/pacotes/EditPacotes.vue')
                },
                {
                    path: '/promotor/eventos/:id/pacotes/:idpacotes',
                    name: 'promotor.eventos.show.pacote.show',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/promotor/eventos/pacotes/ShowPacotes.vue')
                },
                //bar
                {
                    path: '/promotor/eventos/:id/bar/create',
                    name: 'promotor.eventos.show.bar.create',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/promotor/eventos/bar/CreateBar.vue')
                },
                {
                    path: '/promotor/eventos/:id/bar/:idbar/edit',
                    name: 'promotor.eventos.show.bar.edit',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/promotor/eventos/bar/EditBar.vue')
                },
                {
                    path: '/promotor/eventos/:id/bar/:idbar',
                    name: 'promotor.eventos.show.bar.show',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/promotor/eventos/bar/ShowBar.vue')
                },
                //protocolo
                {
                    path: '/promotor/eventos/:id/protocolos/create',
                    name: 'promotor.eventos.show.protocolos.create',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/promotor/eventos/protocolos/CreateProtocolo.vue')
                },
                {
                    path: '/promotor/eventos/:id/protocolos/:idprotocolo/edit',
                    name: 'promotor.eventos.show.protocolos.edit',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/promotor/eventos/protocolos/EditProtocolo.vue')
                },
                {
                    path: '/promotor/eventos/:id/protocolos/:idprotocolo',
                    name: 'promotor.eventos.show.protocolos.show',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/promotor/eventos/protocolos/ShowProtocolo.vue')
                },
                //barman
                {
                    path: '/promotor/eventos/:id/barmans/create',
                    name: 'promotor.eventos.show.barmans.create',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/promotor/eventos/barmans/CreateBarman.vue')
                },
                {
                    path: '/promotor/eventos/:id/barmans/:idbarman/edit',
                    name: 'promotor.eventos.show.barmans.edit',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/promotor/eventos/barmans/EditBarman.vue')
                },
                {
                    path: '/promotor/eventos/:id/barmans/:idbarman',
                    name: 'promotor.eventos.show.barmans.show',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/promotor/eventos/barmans/ShowBarman.vue')
                },
                //lineups
                {
                    path: '/promotor/eventos/:id/lineup/create',
                    name: 'promotor.eventos.show.lineup.create',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/promotor/eventos/lineups/CreateLineUps.vue')
                },
                {
                    path: '/promotor/eventos/:id/lineup/:idlineup/edit',
                    name: 'promotor.eventos.show.lineup.edit',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/promotor/eventos/lineups/EditLineUps.vue')
                },
                {
                    path: '/promotor/eventos/:id/lineup/:idlineup',
                    name: 'promotor.eventos.show.lineup.show',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/promotor/eventos/lineups/ShowLineUps.vue')
                },
                //produtos
                {
                    path: '/promotor/eventos/:id/produtos/create',
                    name: 'promotor.eventos.show.produtos.create',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/promotor/eventos/produtos/CreateProdutos.vue')
                },
                {
                    path: '/promotor/eventos/:id/produtos/:idproduto/edit',
                    name: 'promotor.eventos.show.produtos.edit',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/promotor/eventos/produtos/EditProdutos.vue')
                },
                {
                    path: '/promotor/eventos/:id/produtos/:idproduto',
                    name: 'promotor.eventos.show.produtos.show',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/promotor/eventos/produtos/ShowProdutos.vue')
                },

                //profile
                {
                    path: '/promotor/perfil',
                    name: 'promotor.perfil',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/promotor/profile/IndexProfile.vue')
                },
                //notification
                {
                    path: '/promotor/notificacoes',
                    name: 'promotor.noticacao',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/promotor/notifications/IndexNotification.vue')
                },
                //evento dashboard
                {
                    path: '/promotor/eventos/:id/dashboard',
                    name: 'promotor.eventos.dashboard',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/promotor/eventos/dashboard/Dashboard.vue')
                },
                //evento dashboard bilhete
                {
                    path: '/promotor/eventos/:id/dashboard/bilhetes',
                    name: 'promotor.eventos.dashboard.bilhetes',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/promotor/eventos/dashboard/bilhetes/IndexDashboardBilhetes.vue')
                },
                //evento dashboard pacotes
                {
                    path: '/promotor/eventos/:id/dashboard/pacotes',
                    name: 'promotor.eventos.dashboard.pacotes',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/promotor/eventos/dashboard/pacotes/IndexDashboardPacotes.vue')
                },
                //evento dashboard convites
                {
                    path: '/promotor/eventos/:id/dashboard/convites',
                    name: 'promotor.eventos.dashboard.convites',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/promotor/eventos/dashboard/convites/IndexDashboardConvites.vue')
                },
                //evento dashboard lineups
                {
                    path: '/promotor/eventos/:id/dashboard/lineups',
                    name: 'promotor.eventos.dashboard.lineups',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/promotor/eventos/dashboard/lineups/IndexDashboardLineups.vue')
                },
            ]
        },
        {
            path: '/',
            name: 'home',
            component: AppHomeLayout,
            children: [
                {
                    path: '/',
                    name: 'home',
                    component: () => import('@/views/pages/home/home.vue')
                },
                {
                    path: '/eventos',
                    name: 'eventos.index',
                    component: () => import('@/views/pages/home/events/index.vue')
                },
                {
                    path: '/eventos/:id',
                    name: 'eventos',
                    component: () => import('@/views/pages/home/events/showEvent.vue')
                },
                {
                    path: '/categorias/:id',
                    name: 'categorias',
                    component: () => import('@/views/pages/home/categories/showCategory.vue')
                },
                {
                    path: '/checkout/:id/evento',
                    name: 'checkout',
                    component: () => import('@/views/pages/home/events/checkout.vue')
                },
                {
                    path: '/encomenda',
                    name: 'encomenda',
                    // props: true,
                    component: () => import('@/views/pages/home/events/order.vue'),
                },
                {
                    path: '/ser-promotor',
                    name: 'ser.promotor',
                    component: () => import('@/views/pages/home/serpromotor/index.vue')
                },
                {
                    path: '/meusbilhetes',
                    name: 'meusbilhetes',
                    component: () => import('@/views/pages/home/meusbilhetes/index.vue')
                },
                {
                    path: '/perfil',
                    name: 'user.perfil',
                    component: () => import('@/views/pages/home/profile/IndexUserProfile.vue')
                },
                {
                    path: '/recargas',
                    name: 'user.recargas',
                    component: () => import('@/views/pages/home/cashless/IndexCashless.vue')
                },
                {
                    path: '/recargas/:id',
                    name: 'user.recargas.show',
                    component: () => import('@/views/pages/home/cashless/showCashless.vue')
                },
            ]
        },

        {
            path: '/pages/notfound',
            name: 'notfound',
            component: () => import('@/views/pages/NotFound.vue')
        },

        {
            path: '/login',
            name: 'login',
            component: () => import('@/views/pages/auth/Login.vue')
        },
        {
            path: '/register',
            name: 'register',
            component: () => import('@/views/pages/auth/Register.vue')
        },
        {
            path: '/auth/access',
            name: 'accessDenied',
            component: () => import('@/views/pages/auth/Access.vue')
        },
        {
            path: '/auth/error',
            name: 'error',
            component: () => import('@/views/pages/auth/Error.vue')
        }
    ]
});

export default router;
