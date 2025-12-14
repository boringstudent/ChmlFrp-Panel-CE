import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { useProviderStore } from '../stores/provider';
import { useUserStore } from '../stores/user';

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        redirect: '/home',
        component: () => import('@/views/Home/index.vue'),
        children: [
            {
                path: '/home',
                name: '首页',
                component: () => import('@/pages/Home/index.vue'),
                meta: {
                    title: 'ChmlFrp-CE - 控制台首页',
                    keywords: 'ChmlFrp-CE, 内网穿透, 端口映射, frp, 免费frp, 映射',
                    description: 'ChmlFrp-CE控制台首页，您可以在这里查看您的ChmlFrp-CE账户预览',
                    requiresAuth: true,
                },
            },
            {
                path: '/user',
                name: '个人资料',
                component: () => import('@/pages/User/index.vue'),
                meta: {
                    title: '个人资料 - ChmlFrp-CE',
                    keywords: 'ChmlFrp-CE, 个人资料, 用户信息, 内网穿透, 端口映射, frp, 免费frp, 映射',
                    description: '管理和查看您的ChmlFrp-CE个人资料和账户信息。',
                    requiresAuth: true,
                },
            },
        ],
    },
    {
        path: '/',
        name: '隧道管理',
        component: () => import('@/views/Home/index.vue'),
        children: [
            {
                path: '/tunnel/list',
                name: '隧道列表',
                component: () => import('@/pages/Tunnel/List/index.vue'),
                meta: {
                    title: '隧道列表 - ChmlFrp-CE',
                    keywords: 'ChmlFrp-CE, 隧道管理, 隧道列表, 内网穿透, 端口映射, frp, 免费frp, 映射',
                    description: '查看和管理您的ChmlFrp-CE所有映射隧道列表。',
                    requiresAuth: true,
                },
            },
            {
                path: '/tunnel/download',
                name: '软件下载',
                component: () => import('@/pages/Tunnel/Download/index.vue'),
                meta: {
                    title: '软件下载 - ChmlFrp-CE',
                    keywords: 'ChmlFrp-CE, 软件下载, 客户端, 内网穿透, 端口映射, frp, 免费frp, 映射',
                    description: '下载ChmlFrp-CE的各种客户端软件，支持多平台。',
                },
            },
            {
                path: '/tunnel/config',
                name: '配置文件',
                component: () => import('@/pages/Tunnel/Config/index.vue'),
                meta: {
                    title: '配置文件 - ChmlFrp-CE',
                    keywords: 'ChmlFrp-CE, 配置文件, 内网穿透, 端口映射, frp, 免费frp, 映射',
                    description: '配置和管理您的ChmlFrp-CE映射配置文件。',
                    requiresAuth: true,
                },
            },
            {
                path: '/tunnel/status',
                name: '节点状态',
                component: () => import('@/pages/Tunnel/Status/index.vue'),
                meta: {
                    title: '节点状态 - ChmlFrp-CE',
                    keywords: 'ChmlFrp-CE, 节点状态, 内网穿透, 端口映射, frp, 免费frp, 映射',
                    description: '查看ChmlFrp-CE端口映射节点的实时负载状态。',
                },
            },
            {
                path: '/tunnel/api',
                name: 'API状态',
                component: () => import('@/pages/Tunnel/Api/index.vue'),
                meta: {
                    title: 'API状态 - ChmlFrp-CE',
                    keywords: 'ChmlFrp-CE, API状态, 服务器状态, 内网穿透, 端口映射, frp, 免费frp, 映射',
                    description: '查看ChmlFrp-CE各地API服务器的实时状态和性能指标。',
                },
            },
        ],
    },
    {
        path: '/',
        name: '扩展功能',
        component: () => import('@/views/Home/index.vue'),
        children: [
            {
                path: '/expand/domain-name',
                name: '免费域名',
                component: () => import('@/pages/Expand/DomainName/index.vue'),
                meta: {
                    title: '免费域名 - ChmlFrp-CE',
                    keywords: 'ChmlFrp-CE, 免费域名, 域名服务, 内网穿透, 端口映射, frp, 免费frp, 映射',
                    description: '在ChmlFrp-CE获取和管理您的免费域名。',
                    requiresAuth: true,
                },
            },
            {
                path: '/expand/free-ssl',
                name: '免费SSL',
                component: () => import('@/pages/Expand/FreeSSL/index.vue'),
                meta: {
                    title: '免费SSL - ChmlFrp-CE',
                    keywords: 'ChmlFrp-CE, 免费SSL证书, SSL, 端口映射, frp, 免费frp, 映射',
                    description: '您可以在ChmlFrp-CE免费申请SSL证书',
                    requiresAuth: true,
                },
            },
            {
                path: '/expand/app-marketplace',
                name: '应用市场',
                component: () => import('@/pages/Expand/AppMarketplace/index.vue'),
                meta: {
                    title: '第三方应用市场 - ChmlFrp-CE',
                    keywords:
                        'ChmlFrp-CE, 第三方应用市场, 第三方启动器, 第三方工具, frp, 免费frp, 映射',
                    description:
                        '这里汇集了各种优秀的第三方启动器和工具，为ChmlFrp用户提供更多选择。如果您也想让您的软件出现在这里，请邮件联系 boring_student@qq.com',
                    requiresAuth: true,
                },
            },
        ],
    },

    {
        path: '/',
        name: '其他信息',
        component: () => import('@/views/Home/index.vue'),
        children: [
            {
                path: '/other/about',
                name: '关于面板',
                component: () => import('@/pages/Other/About/index.vue'),
                meta: {
                    title: '关于面板 - ChmlFrp-CE',
                    keywords: 'ChmlFrp-CE, 关于我们, 内网穿透, 端口映射, frp, 免费frp, 映射',
                    description: '了解更多关于ChmlFrp-CE控制面板的信息。',
                },
            },
            {
                path: '/other/log',
                name: '用户日志',
                component: () => import('@/pages/Other/Log/index.vue'),
                meta: {
                    title: '用户日志 - ChmlFrp-CE',
                    keywords: 'ChmlFrp-CE, 用户日志, 操作记录, 内网穿透, 端口映射, frp, 免费frp, 映射',
                    description: '查看您的ChmlFrp-CE操作日志记录。',
                    requiresAuth: true,
                },
            },
            {
                path: '/other/blacklist',
                name: '联盟黑名单',
                component: () => import('@/pages/Other/Blacklist/index.vue'),
                meta: {
                    title: '联盟黑名单 - ChmlFrp-CE',
                    keywords: 'ChmlFrp-CE, 联盟黑名单, 内网穿透联盟, 违规用户, 内网穿透, 端口映射, frp, 免费frp, 映射',
                    description: '查看中国内网穿透联盟统一黑名单信息。',
                },
            },
        ],
    },
    {
        path: '/sign',
        name: '登录',
        component: () => import('@/views/Sign/index.vue'),
        meta: {
            title: '登录 - ChmlFrp-CE',
            keywords: 'ChmlFrp-CE, 登录, 用户认证, 内网穿透, 端口映射, frp, 免费frp, 映射',
            description: '登录到ChmlFrp-CE控制台管理面板',
        },
    },
    {
        path: '/tunnel/info',
        name: '隧道详情',
        component: () => import('@/views/TunnelInfo/index.vue'),
        meta: {
            title: '隧道详情 - ChmlFrp-CE',
            keywords: 'ChmlFrp-CE, 隧道详情, 内网穿透, 端口映射, frp, 免费frp, 映射',
            description:
                'ChmlFrp-CE用户隧道详情，这里会展示隧道连接数，今日流量，节点负载信息，隧道基础信息及关联程序等。',
        },
    },
    {
        path: '/node/info',
        name: '节点详情',
        component: () => import('@/views/NodeInfo/index.vue'),
        meta: {
            title: '节点详情 - ChmlFrp',
            keywords: 'ChmlFrp, 节点详情, 内网穿透, 端口映射, frp, 免费frp, 映射',
            description: 'ChmlFrp单个节点详情，这里会展示映射节点关联数据。',
        },
    },
    {
        path: '/',
        name: '管理面板',
        component: () => import('@/views/Home/index.vue'),
        children: [
            {
                path: '/admin/overall',
                name: '系统总览',
                component: () => import('@/pages/Admin/Overall/index.vue'),
                meta: {
                    title: '总览 - 管理员控制台 - ChmlFrp',
                    requiresAuth: true,
                },
            },
            {
                path: '/admin/panel',
                name: '面板管理',
                component: () => import('@/pages/Admin/PanelSettings/index.vue'),
                meta: {
                    title: '面板管理 - 管理员控制台 - ChmlFrp',
                    requiresAuth: true,
                },
            },
            {
                path: '/admin/node',
                name: '节点管理',
                component: () => import('@/pages/Admin/NodeManagement/index.vue'),
                meta: {
                    title: '节点管理 - 管理员控制台 - ChmlFrp',
                    requiresAuth: true,
                },
            },
            {
                path: '/admin/user',
                name: '用户管理',
                component: () => import('@/pages/Admin/UserManagement/index.vue'),
                meta: {
                    title: '用户管理 - 管理员控制台 - ChmlFrp',
                    requiresAuth: true,
                },
            },
            {
                path: '/admin/tunnel',
                name: '管理隧道',
                component: () => import('@/pages/Admin/TunnelManagement/index.vue'),
                meta: {
                    title: '隧道管理 - 管理员控制台 - ChmlFrp',
                    requiresAuth: true,
                },
            },
            {
                path: '/admin/gift-code',
                name: '兑换码管理',
                component: () => import('@/pages/Admin/ExchangeCode/index.vue'),
                meta: {
                    title: '兑换码管理 - 管理员控制台 - ChmlFrp',
                    requiresAuth: true,
                },
            },
            {
                path: '/admin/domain-name',
                name: '免费域名管理',
                component: () => import('@/pages/Admin/DomainNameManagement/index.vue'),
                meta: {
                    title: '免费域名管理 - 管理员控制台 - ChmlFrp',
                    requiresAuth: true,
                },
            },
        ],
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: () => import('@/views/NotFound/index.vue'),
    },
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
});

router.beforeEach((to, from, next) => {
    void from;

    useProviderStore().loadingBar?.start();

    const userStore = useUserStore();
    const isAuthenticated = !!userStore.userInfo; // 检查是否存在用户信息

    if (to.meta.requiresAuth && !isAuthenticated) {
        // 如果路由需要认证且用户未登录
        next({ path: '/sign' });
    } else {
        next();
    }
});

router.afterEach(() => {
    useProviderStore().loadingBar?.finish();
});

export default router;
