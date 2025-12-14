<template>
    <n-back-top :right="100" />
    <n-h2>应用市场</n-h2>
    <n-card style="margin-bottom: 24px">
        <n-space vertical>
            <p>这里汇集了各种优秀的应用和工具，为ChmlFrp用户提供更多选择。</p>
            <n-space>
                <n-statistic label="应用总数" :value="appData.total" />
                <n-statistic label="开源应用" :value="appData.open_source_count" />
                <n-statistic label="闭源应用" :value="appData.proprietary_count" />
            </n-space>
        </n-space>
    </n-card>
    
    <n-h3>应用列表</n-h3>
    <n-spin :show="loading">
        <n-list hoverable>
            <n-list-item v-for="app in sortedApps" :key="app.id">
                <template #prefix>
                    <n-avatar
                        size="large"
                        :src="app.icon"
                        fallback-src="https://cdn.chmlfrp.cn/icon/default-app.png"
                    />
                </template>
                <n-thing :title="app.name" :description="app.intro" @click="showAppDetail(app)" style="cursor: pointer;">
                    <template #action>
                        <n-space>
                            <n-tag :type="app.open_source ? 'success' : 'warning'" size="small">
                                {{ app.open_source ? '开源' : '闭源' }}
                            </n-tag>
                            <n-button
                                size="small"
                                type="primary"
                                @click.stop="handleDownload(app)"
                                :disabled="!app.download_url"
                            >
                                下载
                            </n-button>
                        </n-space>
                    </template>
                </n-thing>
            </n-list-item>
        </n-list>
        
        <n-empty v-if="!loading && sortedApps.length === 0" description="暂无应用数据">
            <template #extra>
                <n-button size="small" @click="fetchApps">
                    重新加载
                </n-button>
            </template>
        </n-empty>
    </n-spin>
    
    <n-modal v-model:show="showDetail" preset="card" style="width: 600px; max-width: 90vw;">
        <template #header>
            <n-space align="center">
                <n-avatar
                    size="medium"
                    :src="selectedApp?.icon"
                    fallback-src="https://cdn.chmlfrp.cn/icon/default-app.png"
                />
                <div>
                    <n-h3 style="margin: 0">{{ selectedApp?.name }}</n-h3>
                    <n-text depth="3">{{ selectedApp?.intro }}</n-text>
                </div>
            </n-space>
        </template>
        <n-space vertical>
            <n-space align="center">
                <n-tag :type="selectedApp?.open_source ? 'success' : 'warning'" size="small">
                    {{ selectedApp?.open_source ? '开源应用' : '闭源应用' }}
                </n-tag>
                <n-button
                    type="primary"
                    @click="handleDownload(selectedApp!)"
                    :disabled="!selectedApp?.download_url"
                >
                    下载应用
                </n-button>
            </n-space>
            <n-h4>应用介绍</n-h4>
            <div v-html="renderedDescription" class="markdown-content"></div>
        </n-space>
    </n-modal>
    
    <n-card style="margin-top: 32px">
        如果您也想让您的软件出现在这里，请邮件联系 <a href="mailto:boring_student@qq.com">boring_student@qq.com</a>
    </n-card>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { marked } from 'marked';

// 定义应用数据类型
interface App {
    id: number;
    name: string;
    intro: string;
    description: string;
    open_source: boolean;
    icon: string;
    download_url: string;
}

interface AppData {
    apps: App[];
    total: number;
    open_source_count: number;
    proprietary_count: number;
}

// 响应式数据
const loading = ref(true);
const appData = ref<AppData>({
    apps: [],
    total: 0,
    open_source_count: 0,
    proprietary_count: 0
});
const showDetail = ref(false);
const selectedApp = ref<App | null>(null);
const renderedDescription = ref('');

// API URL
const API_URL = 'https://chmlfrp.api.chmlfrp.com/appstore';

// 计算属性：按开源在前排序的应用列表
const sortedApps = computed(() => {
    return [...appData.value.apps].sort((a: App, b: App) => {
        // 开源应用在前，商业应用在后
        if (a.open_source && !b.open_source) return -1;
        if (!a.open_source && b.open_source) return 1;
        // 相同类型按ID排序
        return a.id - b.id;
    });
});

// 从API获取应用数据
const fetchApps = async () => {
    loading.value = true;
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        if (data.msg === '应用列表获取成功') {
            appData.value = data.data;
        } else {
            throw new Error('API返回错误信息');
        }
    } catch (error) {
        console.error('获取应用数据失败:', error);
        // 使用模拟数据作为备用
        appData.value = {
            apps: [
                {
                    id: 1,
                    name: 'ChmlFrp客户端',
                    intro: '内网穿透工具',
                    description: 'ChmlFrp官方推出的内网穿透客户端，支持Windows、macOS、Linux系统，提供稳定快速的内网穿透服务。',
                    open_source: true,
                    icon: 'https://cdn.chmlfrp.cn/icon/chmlfrp-client.png',
                    download_url: 'https://download.chmlfrp.cn'
                },
                {
                    id: 2,
                    name: 'FrpMgr面板',
                    intro: 'Frp服务管理面板',
                    description: '基于Web的Frp服务管理面板，提供隧道管理、节点监控、用户管理等功能，支持多用户和多节点部署。',
                    open_source: true,
                    icon: 'https://cdn.chmlfrp.cn/icon/frpmgr-panel.png',
                    download_url: 'https://github.com/chmlfrp/frpmgr'
                }
            ],
            total: 2,
            open_source_count: 2,
            proprietary_count: 0
        };
    } finally {
        loading.value = false;
    }
};

// 显示应用详情
const showAppDetail = (app: App) => {
    selectedApp.value = app;
    // 使用marked将Markdown转换为HTML
    renderedDescription.value = marked.parse(app.description || '暂无详细描述');
    showDetail.value = true;
};

// 处理下载
const handleDownload = (app: App) => {
    if (app.download_url) {
        window.open(app.download_url, '_blank');
    }
};

// 组件挂载时获取数据
onMounted(() => {
    fetchApps();
});
</script>

<style lang="scss">
.n-list-item {
    margin-bottom: 8px;
    cursor: pointer;
    transition: background-color 0.2s;
    
    &:hover {
        background-color: #f5f5f5;
    }
}

.n-thing {
    width: 100%;
}

.markdown-content {
    line-height: 1.6;
    
    h1, h2, h3, h4, h5, h6 {
        margin: 16px 0 8px 0;
        color: #333;
    }
    
    p {
        margin: 8px 0;
        color: #666;
    }
    
    ul, ol {
        margin: 8px 0;
        padding-left: 24px;
    }
    
    li {
        margin: 4px 0;
    }
    
    code {
        background-color: #f5f5f5;
        padding: 2px 6px;
        border-radius: 3px;
        font-family: 'Courier New', monospace;
    }
    
    pre {
        background-color: #f8f8f8;
        padding: 12px;
        border-radius: 4px;
        overflow-x: auto;
        margin: 12px 0;
        
        code {
            background: none;
            padding: 0;
        }
    }
    
    blockquote {
        border-left: 4px solid #ddd;
        margin: 12px 0;
        padding-left: 16px;
        color: #666;
        font-style: italic;
    }
}
</style>
