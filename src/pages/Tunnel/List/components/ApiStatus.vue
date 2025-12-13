<template>
    <n-card title="API状态" style="margin-bottom: 12px">
        <n-alert type="info" style="margin-bottom: 16px"> ChmlFrp的各地API服务器状态 </n-alert>

        <!-- 加载状态 -->
        <div v-if="loading" style="text-align: center; padding: 20px">
            <n-spin size="small" />
            <div style="margin-top: 8px; color: #999">加载服务器状态中...</div>
        </div>

        <!-- 错误状态 -->
        <div v-else-if="error" style="text-align: center; padding: 20px; color: #ff4d4f">
            <n-icon size="32" style="margin-bottom: 8px">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
            </n-icon>
            <div style="font-size: 14px; font-weight: 500">{{ error }}</div>
            <n-button type="primary" @click="fetchServerStatus" size="small" style="margin-top: 8px">
                <template #icon>
                    <n-icon>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        >
                            <path d="M21 2v6h-6" />
                            <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                            <path d="M3 22v-6h6" />
                            <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
                        </svg>
                    </n-icon>
                </template>
                重试
            </n-button>
        </div>

        <!-- 服务器状态列表 -->
        <div v-else>
            <n-space vertical>
                <div v-for="server in serverStatusList" :key="server.serverName" class="server-status-item">
                    <n-card size="small" :bordered="true">
                        <template #header>
                            <div style="display: flex; justify-content: space-between; align-items: center">
                                <span style="font-weight: 600">{{ server.serverName }}</span>
                                <n-tag :type="getServerStatusType(server.load)" size="small">
                                    负载: {{ server.load.toFixed(1) }}
                                </n-tag>
                            </div>
                        </template>

                        <n-grid :cols="5" :x-gap="8" :y-gap="8">
                            <n-grid-item>
                                <div class="metric-item">
                                    <div class="metric-label">CPU</div>
                                    <div class="metric-value" :class="getMetricClass(server.metrics.cpu)">
                                        {{ server.metrics.cpu.toFixed(1) }}%
                                    </div>
                                </div>
                            </n-grid-item>
                            <n-grid-item>
                                <div class="metric-item">
                                    <div class="metric-label">内存</div>
                                    <div class="metric-value" :class="getMetricClass(server.metrics.memory)">
                                        {{ server.metrics.memory.toFixed(1) }}%
                                    </div>
                                </div>
                            </n-grid-item>
                            <n-grid-item>
                                <div class="metric-item">
                                    <div class="metric-label">资源抢占</div>
                                    <div class="metric-value" :class="getMetricClass(server.metrics.steal)">
                                        {{ server.metrics.steal.toFixed(1) }}%
                                    </div>
                                </div>
                            </n-grid-item>
                            <n-grid-item>
                                <div class="metric-item">
                                    <div class="metric-label">IO延迟</div>
                                    <div class="metric-value" :class="getMetricClass(server.metrics.ioLatency)">
                                        {{ server.metrics.ioLatency.toFixed(1) }}ms
                                    </div>
                                </div>
                            </n-grid-item>
                            <n-grid-item>
                                <div class="metric-item">
                                    <div class="metric-label">线程争用</div>
                                    <div class="metric-value" :class="getMetricClass(server.metrics.threadContention)">
                                        {{ server.metrics.threadContention.toFixed(1) }}%
                                    </div>
                                </div>
                            </n-grid-item>
                        </n-grid>
                    </n-card>
                </div>
            </n-space>
        </div>

        <!-- 刷新按钮 -->
        <template #action>
            <n-button :loading="loading" @click="fetchServerStatus" type="primary" size="small">
                <template #icon>
                    <n-icon>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        >
                            <path d="M21 2v6h-6" />
                            <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                            <path d="M3 22v-6h6" />
                            <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
                        </svg>
                    </n-icon>
                </template>
                刷新状态
            </n-button>
        </template>
    </n-card>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue';
import api from '@/api';
import type { ServerStatus } from '@/api/v2/server/server';

// 响应式数据
const serverStatusList = ref<ServerStatus[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
let updateInterval: number | null = null;

/**
 * 根据负载获取服务器状态类型
 */
const getServerStatusType = (load: number) => {
    if (load < 30) return 'success';
    if (load < 70) return 'warning';
    return 'error';
};

/**
 * 根据指标值获取样式类
 */
const getMetricClass = (value: number) => {
    if (value < 30) return 'metric-low';
    if (value < 70) return 'metric-medium';
    return 'metric-high';
};

/**
 * 获取服务器状态
 */
const fetchServerStatus = async () => {
    loading.value = true;
    error.value = null;

    try {
        const response = await api.v2.server.getServerStatus();

        // 检查服务器是否已在列表中
        const existingIndex = serverStatusList.value.findIndex((server) => server.serverName === response.serverName);

        if (existingIndex === -1) {
            // 新服务器，添加到列表
            serverStatusList.value.push(response);
        } else {
            // 更新现有服务器数据
            serverStatusList.value[existingIndex] = response;
        }
    } catch (err: any) {
        error.value = err.message || '获取服务器状态失败';
    } finally {
        loading.value = false;
    }
};

/**
 * 开始自动更新
 */
const startAutoUpdate = () => {
    if (updateInterval) {
        clearInterval(updateInterval);
    }

    updateInterval = window.setInterval(() => {
        if (document.visibilityState === 'visible') {
            fetchServerStatus();
        }
    }, 3000); // 3秒更新一次
};

/**
 * 停止自动更新
 */
const stopAutoUpdate = () => {
    if (updateInterval) {
        clearInterval(updateInterval);
        updateInterval = null;
    }
};

// 组件挂载时获取数据并开始自动更新
onMounted(() => {
    fetchServerStatus();
    startAutoUpdate();
});

// 组件卸载时停止自动更新
onUnmounted(() => {
    stopAutoUpdate();
});

// 监听页面可见性变化
const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
        startAutoUpdate();
    } else {
        stopAutoUpdate();
    }
};

document.addEventListener('visibilitychange', handleVisibilityChange);

// 清理事件监听器
onUnmounted(() => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
});
</script>

<style scoped>
.server-status-item {
    margin-bottom: 8px;
}

.server-status-item:last-child {
    margin-bottom: 0;
}

.metric-item {
    text-align: center;
    padding: 4px;
}

.metric-label {
    font-size: 12px;
    color: #666;
    margin-bottom: 4px;
}

.metric-value {
    font-size: 14px;
    font-weight: 600;
}

.metric-low {
    color: #52c41a;
}

.metric-medium {
    color: #faad14;
}

.metric-high {
    color: #ff4d4f;
}
</style>
