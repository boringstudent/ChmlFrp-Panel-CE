import axios from 'axios';

// 黑名单项接口
export interface BlacklistItem {
    id: number;
    email: string;
    reason: string;
    createdAt: string;
    updatedAt: string;
    appId: string;
}

// 黑名单响应接口
export interface BlacklistResponse {
    msg: string;
    status: number;
    data: {
        msg: string;
        list: BlacklistItem[];
    };
}

/**
 * 获取联盟黑名单列表
 * @returns {Promise<BlacklistResponse>} 黑名单响应
 */
export const getBlacklist = async (): Promise<BlacklistResponse> => {
    const response = await axios.get('https://xn--6orp08a.xn--v6qw21h0gd43u.xn--fiqs8s/v1/blacklist/list/all', {
        timeout: 30000, // 30秒超时，因为数据量较大
    });
    return response.data;
};
