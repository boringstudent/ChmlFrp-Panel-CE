import { ref, computed } from 'vue';
import { useMessage } from 'naive-ui';
import { useUserStore } from '@/stores/user';
import api from '@/api';

// 消息项接口
interface MessageItem {
    id: number;
    userid: number;
    content: string;
    quanti: string;
    time: string;
}

/**
 * 消息 composable
 */
export function useMessages() {
    const message = useMessage();
    const userStore = useUserStore();

    const messages = ref<MessageItem[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);

    /**
     * 获取用户消息
     */
    const fetchMessages = async () => {
        if (!userStore.userInfo?.usertoken) {
            error.value = '用户令牌不存在';
            return;
        }

        loading.value = true;
        error.value = null;

        try {
            const response = await api.v2.user.getMessages(userStore.userInfo.usertoken);
            console.log('API Response:', response);
            console.log('Message Data:', response.data);

            if (response.state === 'success') {
                messages.value = response.data || [];
                console.log('Messages assigned:', messages.value);
            } else {
                error.value = response.msg || '获取消息失败';
                message.error(error.value || '获取消息失败');
            }
        } catch (err: any) {
            error.value = err.message || '网络错误，获取消息失败';
            message.error(error.value || '网络错误，获取消息失败');
        } finally {
            loading.value = false;
        }
    };

    /**
     * 格式化消息时间
     */
    const formatMessageTime = (timeString: string) => {
        try {
            const date = new Date(timeString);
            return date.toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            });
        } catch {
            return timeString;
        }
    };

    /**
     * 获取公开消息（userid为0的消息）
     */
    const publicMessages = computed(() => {
        return messages.value.filter((msg: MessageItem) => msg.userid === 0);
    });

    /**
     * 获取私有消息（userid不为0的消息）
     */
    const privateMessages = computed(() => {
        return messages.value.filter((msg: MessageItem) => msg.userid !== 0);
    });

    return {
        messages,
        loading,
        error,
        fetchMessages,
        formatMessageTime,
        publicMessages,
        privateMessages,
    };
}
