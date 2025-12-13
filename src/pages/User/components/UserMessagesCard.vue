<template>
    <n-card title="消息">
        <!-- 系统通知 -->
        <n-alert
            v-if="userInfo?.usergroup === '封禁'"
            title="您的账户已被封禁"
            type="error"
            style="margin-bottom: 10px"
        >
            理由：理由信息正在开发中，如果想知道具体原因请联系QQ：242247494
        </n-alert>
        <n-alert v-if="userInfo?.realname === '未实名'" title="未实名通知" type="warning" style="margin-bottom: 10px">
            您尚未实名，请前往右侧实名认证填写处进行实名，每位用户提供3次免费实名，次数耗尽后请联系QQ242247494进行重置。我们允许14岁以上人群实名，但请不要使用非本人身份证实名。
        </n-alert>
        <n-alert v-if="isTermExpiringSoon" title="您的会员即将到期" type="info" style="margin-bottom: 10px">
            您的ChmlFrp{{ userInfo?.usergroup }}将于 {{ userInfo?.term }} 到期，剩余
            {{ remainingDays }} 天，请及时续费。
        </n-alert>

        <!-- 消息列表 -->
        <div v-if="loading" style="text-align: center; padding: 20px">
            <n-spin size="small" />
            <div style="margin-top: 8px; color: #999">加载消息中...</div>
        </div>

        <div v-else-if="error" style="text-align: center; padding: 20px; color: #ff4d4f">
            {{ error }}
        </div>

        <div v-else-if="messages.length === 0" style="text-align: center; padding: 20px; color: #999">暂无消息</div>

        <div v-else>
            <!-- 公开消息 -->
            <div v-if="publicMessages.length > 0">
                <n-h3 prefix="bar" style="margin-top: 0">
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
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                        </n-icon>
                    </template>
                    公开消息
                </n-h3>
                <n-list>
                    <n-list-item v-for="msg in publicMessages" :key="msg.id">
                        <template #prefix>
                            <n-icon size="20" style="color: #18a058">
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
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="m9 12 2 2 4-4" />
                                </svg>
                            </n-icon>
                        </template>
                        <n-thing>
                            <template #description>
                                <n-text depth="3" style="font-size: 12px">
                                    {{ formatMessageTime(msg.time) }}
                                </n-text>
                            </template>
                            <div v-html="msg.content" style="line-height: 1.5"></div>
                        </n-thing>
                    </n-list-item>
                </n-list>
            </div>

            <!-- 私有消息 -->
            <div v-if="privateMessages.length > 0" style="margin-top: 20px">
                <n-h3 prefix="bar" style="margin-top: 0">
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
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                <path d="M12 11v1" />
                                <path d="M12 16v1" />
                            </svg>
                        </n-icon>
                    </template>
                    私有消息
                </n-h3>
                <n-list>
                    <n-list-item v-for="msg in privateMessages" :key="msg.id">
                        <template #prefix>
                            <n-icon size="20" style="color: #2080f0">
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
                                    <path d="M21 2H3v16h5v4l4-4h5l4-4V2z" />
                                    <path d="M7 10h10" />
                                    <path d="M7 14h10" />
                                </svg>
                            </n-icon>
                        </template>
                        <n-thing>
                            <template #description>
                                <n-text depth="3" style="font-size: 12px">
                                    {{ formatMessageTime(msg.time) }}
                                </n-text>
                            </template>
                            <div v-html="msg.content" style="line-height: 1.5"></div>
                        </n-thing>
                    </n-list-item>
                </n-list>
            </div>
        </div>

        <!-- 刷新按钮 -->
        <template #action>
            <n-button :loading="loading" @click="fetchMessages" type="primary" size="small">
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
                刷新消息
            </n-button>
        </template>
    </n-card>
</template>

<script lang="ts" setup>
import { computed, onMounted } from 'vue';
import { useMessages } from '../composables/useMessages';

interface Props {
    userInfo?: {
        usergroup?: string;
        realname?: string;
        term?: string;
    };
    remainingDays: number;
}

const props = defineProps<Props>();

const { messages, loading, error, fetchMessages, formatMessageTime, publicMessages, privateMessages } = useMessages();

const isTermExpiringSoon = computed(() => {
    return props.remainingDays < 7 && props.remainingDays >= 0;
});

// 组件挂载时获取消息
onMounted(() => {
    fetchMessages();
});
</script>
