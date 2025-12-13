<template>
    <div class="api-status-page">
        <n-card title="API状态" style="margin-bottom: 20px">
            <n-alert type="info" style="margin-bottom: 16px">
                ChmlFrp的各地API服务器状态
                <span style="float: right; font-weight: 500"> 下次更新: {{ countdown }}秒 </span>
            </n-alert>

            <!-- 加载状态 -->
            <div v-if="loading" style="text-align: center; padding: 40px">
                <n-spin size="large" />
                <div style="margin-top: 16px; color: #999">加载服务器状态中...</div>
            </div>

            <!-- 错误状态 -->
            <div v-else-if="error" style="text-align: center; padding: 40px; color: #ff4d4f">
                <n-icon size="48" style="margin-bottom: 16px">
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
                <div style="font-size: 16px; font-weight: 500; margin-bottom: 16px">{{ error }}</div>
                <n-button type="primary" @click="fetchServerStatus" size="medium">
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
            <div v-else class="server-status-container">
                <!-- 占位符内容，用于固定高度 -->
                <div v-if="loading" class="placeholder-content">
                    <div v-for="i in Math.max(1, serverStatusList.length)" :key="i" class="server-status-placeholder">
                        <n-card size="small" :bordered="true">
                            <template #header>
                                <div style="display: flex; justify-content: space-between; align-items: center">
                                    <n-skeleton text style="width: 120px; height: 20px" />
                                    <n-skeleton text style="width: 80px; height: 24px" />
                                </div>
                            </template>

                            <n-grid :cols="5" :x-gap="12" :y-gap="12">
                                <n-grid-item v-for="j in 5" :key="j">
                                    <div class="metric-item">
                                        <n-skeleton text style="width: 60px; height: 14px; margin-bottom: 4px" />
                                        <n-skeleton text style="width: 40px; height: 16px" />
                                    </div>
                                </n-grid-item>
                            </n-grid>
                        </n-card>
                    </div>
                </div>

                <!-- 实际服务器状态内容 -->
                <div v-show="!loading" class="server-status-content">
                    <n-space vertical>
                        <div v-for="server in serverStatusList" :key="server.serverName" class="server-status-item">
                            <n-card size="small" :bordered="true">
                                <template #header>
                                    <div style="display: flex; justify-content: space-between; align-items: center">
                                        <span style="font-weight: 600; font-size: 16px">{{ server.serverName }}</span>
                                        <n-tag :type="getServerStatusType(server.load)" size="medium">
                                            负载: {{ server.load.toFixed(1) }}
                                        </n-tag>
                                    </div>
                                </template>

                                <n-grid :cols="5" :x-gap="12" :y-gap="12">
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
                                            <div
                                                class="metric-value"
                                                :class="getMetricClass(server.metrics.threadContention)"
                                            >
                                                {{ server.metrics.threadContention.toFixed(1) }}%
                                            </div>
                                        </div>
                                    </n-grid-item>
                                </n-grid>
                            </n-card>
                        </div>
                    </n-space>
                </div>
            </div>

            <!-- 刷新按钮 -->
            <template #action>
                <n-button :loading="loading" @click="fetchServerStatus" type="primary" size="medium">
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
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import api from '@/api';
import type { ServerStatus } from '@/api/v2/server/server';
import { NSkeleton } from 'naive-ui';

// 响应式数据
const serverStatusList = ref<ServerStatus[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const lastUpdateTime = ref<number>(0);
const countdown = ref<number>(3);
let updateInterval: number | null = null;
let countdownInterval: number | null = null;

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
    // 避免重复请求
    if (loading.value) return;

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
            // 更新现有服务器数据 - 使用Object.assign避免界面抖动
            Object.assign(serverStatusList.value[existingIndex], response);
        }

        // 记录最后更新时间
        lastUpdateTime.value = Date.now();

        // 重置倒计时
        countdown.value = 3;
    } catch (err: any) {
        error.value = err.message || '获取服务器状态失败';
    } finally {
        loading.value = false;
    }
};

/**
 * 开始倒计时
 */
const startCountdown = () => {
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }

    countdownInterval = window.setInterval(() => {
        if (countdown.value > 0) {
            countdown.value--;
        } else {
            // 倒计时结束，触发更新
            countdown.value = 3;
            if (document.visibilityState === 'visible') {
                fetchServerStatus();
            }
        }
    }, 1000); // 每秒更新倒计时
};

/**
 * 开始自动更新
 */
const startAutoUpdate = () => {
    if (updateInterval) {
        clearInterval(updateInterval);
    }

    // 使用倒计时方式控制更新，避免界面抖动
    startCountdown();
};

/**
 * 停止自动更新
 */
const stopAutoUpdate = () => {
    if (updateInterval) {
        clearInterval(updateInterval);
        updateInterval = null;
    }

    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
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
        // 页面变为可见时，立即更新数据并重新开始倒计时
        fetchServerStatus();
        startAutoUpdate();
    } else {
        // 页面不可见时停止倒计时
        if (countdownInterval) {
            clearInterval(countdownInterval);
            countdownInterval = null;
        }
    }
};

document.addEventListener('visibilitychange', handleVisibilityChange);

// 清理事件监听器
onUnmounted(() => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
});
</script>

<style scoped>
.api-status-page {
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
}

.server-status-container {
    position: relative;
    min-height: 200px; /* 确保有最小高度 */
}

.placeholder-content {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1;
    opacity: 0.7;
    transition: opacity 0.3s ease;
}

.server-status-content {
    position: relative;
    z-index: 2;
    transition: opacity 0.3s ease;
}

.server-status-placeholder {
    margin-bottom: 16px;
    animation: placeholder-pulse 1.5s ease-in-out infinite;
}

.server-status-item {
    margin-bottom: 16px;
    transition: all 0.3s ease;
}

.server-status-item:last-child {
    margin-bottom: 0;
}

.metric-item {
    text-align: center;
    padding: 8px;
    border-radius: 6px;
    background-color: #f8f9fa;
}

.metric-label {
    font-size: 12px;
    color: #666;
    margin-bottom: 4px;
}

.metric-value {
    font-size: 16px;
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

@keyframes placeholder-pulse {
    0% {
        opacity: 0.6;
    }
    50% {
        opacity: 0.8;
    }
    100% {
        opacity: 0.6;
    }
}

/* 平滑过渡效果 */
.server-status-content {
    animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>
