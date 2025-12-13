import axios from 'axios';

// 服务器指标接口
export interface ServerMetrics {
    cpu: number;
    memory: number;
    steal: number;
    ioLatency: number;
    threadContention: number;
}

// 服务器状态接口
export interface ServerStatus {
    metrics: ServerMetrics;
    serverName: string;
    load: number;
}

// 服务器状态响应接口
export interface ServerStatusResponse {
    metrics: ServerMetrics;
    serverName: string;
    load: number;
}

/**
 * 获取服务器状态
 * @returns {Promise<ServerStatus>} 服务器状态
 */
export const getServerStatus = async (): Promise<ServerStatus> => {
    const response = await axios.get('https://cf-v2.uapis.cn/api/server-status', {
        timeout: 10000, // 10秒超时
    });
    return response.data;
};
