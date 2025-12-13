<template>
    <n-card title="联盟黑名单">
        <n-alert type="info" style="margin-bottom: 16px"> 中国内网穿透联盟黑名单 </n-alert>

        <!-- 搜索栏 -->
        <div v-if="!loading && !error && blacklist.length > 0" style="margin-bottom: 16px">
            <n-space vertical>
                <n-input
                    v-model:value="searchKeyword"
                    placeholder="搜索邮箱、原因或应用ID..."
                    clearable
                    size="medium"
                    style="max-width: 400px"
                >
                    <template #prefix>
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
                                <circle cx="11" cy="11" r="8" />
                                <path d="m21 21-4.3-4.3" />
                            </svg>
                        </n-icon>
                    </template>
                </n-input>
                <div v-if="searchKeyword" style="font-size: 12px; color: #666">
                    搜索到 {{ filteredBlacklist.length }} 条记录（共 {{ blacklist.length }} 条）
                </div>
            </n-space>
        </div>

        <!-- 加载状态 -->
        <div v-if="loading" style="text-align: center; padding: 40px">
            <n-spin size="large" />
            <div style="margin-top: 12px; color: #999">加载黑名单数据中...</div>
        </div>

        <!-- 错误状态 -->
        <div v-else-if="error" style="text-align: center; padding: 40px; color: #ff4d4f">
            <n-icon size="48" style="margin-bottom: 12px">
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
            <div style="font-size: 16px; font-weight: 500">{{ error }}</div>
            <n-button type="primary" @click="fetchBlacklist" style="margin-top: 12px">
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

        <!-- 空状态 -->
        <div v-else-if="blacklist.length === 0" style="text-align: center; padding: 40px; color: #999">
            <n-icon size="48" style="margin-bottom: 12px">
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
                    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                </svg>
            </n-icon>
            <div style="font-size: 16px; font-weight: 500">暂无黑名单数据</div>
        </div>

        <!-- 搜索无结果 -->
        <div
            v-else-if="searchKeyword && filteredBlacklist.length === 0"
            style="text-align: center; padding: 40px; color: #999"
        >
            <n-icon size="48" style="margin-bottom: 12px">
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
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                </svg>
            </n-icon>
            <div style="font-size: 16px; font-weight: 500">未找到匹配 "{{ searchKeyword }}" 的记录</div>
            <n-button type="primary" @click="searchKeyword = ''" style="margin-top: 12px"> 清除搜索 </n-button>
        </div>

        <!-- 黑名单列表 -->
        <div v-else>
            <n-data-table
                :columns="columns"
                :data="filteredBlacklist"
                :pagination="pagination"
                :scroll-x="1200"
                striped
                size="small"
            />
        </div>

        <!-- 刷新按钮 -->
        <template #action>
            <n-button :loading="loading" @click="fetchBlacklist" type="primary" size="small">
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
                刷新数据
            </n-button>
        </template>
    </n-card>
</template>

<script lang="ts" setup>
import { ref, onMounted, h, computed } from 'vue';
import { NTag, NEllipsis } from 'naive-ui';
import api from '@/api';

// 响应式数据
const blacklist = ref<any[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const searchKeyword = ref('');

// 过滤后的黑名单数据
const filteredBlacklist = computed(() => {
    if (!searchKeyword.value) {
        return blacklist.value;
    }

    const keyword = searchKeyword.value.toLowerCase();
    return blacklist.value.filter(
        (item) =>
            item.email.toLowerCase().includes(keyword) ||
            item.reason.toLowerCase().includes(keyword) ||
            item.appId.toLowerCase().includes(keyword)
    );
});

// 分页配置
const pagination = {
    pageSize: 10,
    showSizePicker: true,
    pageSizes: [10, 20, 50],
    showQuickJumper: true,
};

// 表格列配置
const columns = [
    {
        title: 'ID',
        key: 'id',
        width: 80,
        align: 'center',
        sorter: 'default',
    },
    {
        title: '邮箱',
        key: 'email',
        width: 200,
        ellipsis: {
            tooltip: true,
        },
        render(row: any) {
            return h(
                NEllipsis,
                {},
                {
                    default: () =>
                        h(
                            'span',
                            {
                                style: 'font-family: monospace; font-size: 13px;',
                            },
                            row.email
                        ),
                }
            );
        },
    },
    {
        title: '原因',
        key: 'reason',
        width: 300,
        ellipsis: {
            tooltip: true,
        },
        render(row: any) {
            return h(
                'span',
                {
                    style: 'color: #ff4d4f; font-weight: 500;',
                },
                row.reason
            );
        },
    },
    {
        title: '创建日期',
        key: 'createdAt',
        width: 180,
        sorter: 'default',
        render(row: any) {
            return h(
                'span',
                {
                    style: 'font-size: 12px; color: #666;',
                },
                formatDate(row.createdAt)
            );
        },
    },
    {
        title: '更新日期',
        key: 'updatedAt',
        width: 180,
        sorter: 'default',
        render(row: any) {
            return h(
                'span',
                {
                    style: 'font-size: 12px; color: #666;',
                },
                formatDate(row.updatedAt)
            );
        },
    },
    {
        title: '应用ID',
        key: 'appId',
        width: 160,
        align: 'center',
        render(row: any) {
            return h(
                NTag,
                {
                    type: 'info',
                    size: 'small',
                    style: 'font-family: monospace;',
                },
                {
                    default: () => row.appId,
                }
            );
        },
    },
];

/**
 * 格式化日期
 */
const formatDate = (dateString: string) => {
    try {
        const date = new Date(dateString);
        return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return dateString;
    }
};

/**
 * 获取黑名单数据
 */
const fetchBlacklist = async () => {
    loading.value = true;
    error.value = null;

    try {
        const response = await api.v2.alliance.getBlacklist();

        if (response.status === 200 && response.msg === 'success') {
            blacklist.value = response.data.list || [];
        } else {
            error.value = response.msg || '获取黑名单数据失败';
        }
    } catch (err: any) {
        error.value = err.message || '网络错误，获取黑名单数据失败';
    } finally {
        loading.value = false;
    }
};

// 组件挂载时获取数据
onMounted(() => {
    fetchBlacklist();
});
</script>

<style scoped>
.n-card {
    margin-bottom: 16px;
}
</style>
