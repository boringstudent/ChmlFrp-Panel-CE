<template>
    <n-back-top :right="100" />
    <DomainListHeader
        :loading="loading"
        :create-loading="createDomainNameLoading"
        @refresh="fetchDomainData"
        @create="handleCreateDomain"
    />
    <n-card v-if="domainData.length > 0" style="margin-bottom: 20px">
        <n-flex>
            <n-button @click="toggleSelectAll" size="small">
                {{ selectAll ? '取消全选' : '全选' }}
            </n-button>
            <n-button @click="handleInvertSelection" size="small">
                反选
            </n-button>
            <n-button 
                @click="handleBatchUpdate" 
                size="small" 
                type="primary" 
                :disabled="selectedDomains.length === 0"
                :loading="batchUpdateLoading"
            >
                批量修改 ({{ selectedDomains.length }})
            </n-button>
            <n-button 
                @click="handleBatchDelete" 
                size="small" 
                type="error" 
                :disabled="selectedDomains.length === 0"
                :loading="batchDeleteLoading"
            >
                批量删除 ({{ selectedDomains.length }})
            </n-button>
            <n-text depth="3">
                已选择 {{ selectedDomains.length }} 个域名
            </n-text>
        </n-flex>
    </n-card>
    <n-grid v-if="loading" cols="1 m:2 l:3 xl:4 2xl:5" :x-gap="12" :y-gap="12" responsive="screen">
        <n-grid-item v-for="i in count" :key="i">
            <n-infinite-scroll :distance="1" @load="handleLoad">
                <n-skeleton height="190.6px" width="100%" style="border-radius: 10px" />
            </n-infinite-scroll>
        </n-grid-item>
    </n-grid>
    <n-grid v-else cols="1 m:2 l:3 xl:4 2xl:5" :x-gap="24" :y-gap="24" responsive="screen" class="domain-grid">
        <n-grid-item v-for="(domain, index) in domainData" :key="domain.id" class="grid-item">
            <DomainCard
                :domain="domain"
                :loading="domainLoading[index]"
                :index="index"
                :selected="selectedDomains.includes(index)"
                @edit="handleEditDomain"
                @delete="handleDeleteDomain"
                @update:selected="handleDomainSelectionChange"
            />
        </n-grid-item>
    </n-grid>
    <DomainListEmpty
        v-if="!loading && domainData.length === 0"
        :loading="createDomainNameLoading"
        @create="handleCreateDomain"
    />
    <CreateDomainModal
        :show="createDomainNameModal"
        :model="model"
        :fast-model="fastModel"
        :domain-name-options="domainNameOptions"
        :record-type-options="recordTypeOptions"
        :fast-record-type-options="fastRecordTypeOptions"
        :ttl-options="TTLOptions"
        :tunnel-options="tunnelOptions"
        :target-placeholder="targetPlaceholder"
        :loading="createLoading"
        :loading-tunnel="loadingSelectedTunnel"
        :size="size"
        :cname-warning="INFO_MESSAGES.CNAME_WARNING"
        @update:show="createDomainNameModal = $event"
        @update:model="model = $event"
        @update:fast-model="fastModel = $event"
        @tab-change="handleTabChange"
        @submit="handleSubmit"
        @fast-submit="handleFastSubmit"
    />
    <EditDomainModal
        :show="editDomainNameModal"
        :model="model"
        :domain-name-options="domainNameOptions"
        :record-type-options="recordTypeOptions"
        :ttl-options="TTLOptions"
        :target-placeholder="targetPlaceholder"
        :loading="editLoading"
        :size="size"
        @update:show="editDomainNameModal = $event"
        @update:model="model = $event"
        @submit="handleEditSubmit"
    />

    <!-- 批量删除确认对话框 -->
    <n-modal v-model:show="batchDeleteModal" :mask-closable="false">
        <n-card
            style="width: 600px; max-width: 90vw;"
            title="批量删除域名"
            :bordered="false"
            size="huge"
            role="dialog"
            aria-modal="true"
        >
            <template #header-extra>
                <n-button quaternary circle @click="batchDeleteModal = false">
                    <template #icon>
                        <n-icon>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
                                <path fill="none" d="M0 0h24v24H0z"/>
                                <path d="M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z" fill="currentColor"/>
                            </svg>
                        </n-icon>
                    </template>
                </n-button>
            </template>
            
            <n-alert type="warning" title="警告" style="margin-bottom: 20px;">
                您即将删除 {{ selectedDomains.length }} 个域名，此操作不可撤销！
            </n-alert>
            
            <n-text depth="3">
                请确认您要删除以下域名：
            </n-text>
            
            <n-list style="margin: 16px 0; max-height: 200px; overflow-y: auto;">
                <n-list-item v-for="index in selectedDomains" :key="index">
                    <n-text>
                        {{ domainData[index]?.record }}.{{ domainData[index]?.domain }}
                    </n-text>
                </n-list-item>
            </n-list>
            
            <template #footer>
                <n-flex justify="end">
                    <n-button @click="batchDeleteModal = false" :disabled="batchDeleteLoading">
                        取消
                    </n-button>
                    <n-button 
                        @click="confirmBatchDelete" 
                        type="error" 
                        :loading="batchDeleteLoading"
                    >
                        确认删除
                    </n-button>
                </n-flex>
            </template>
        </n-card>
    </n-modal>

    <!-- 批量删除进度条 -->
    <n-modal v-model:show="batchDeleteLoading" :mask-closable="false">
        <n-card
            style="width: 500px; max-width: 90vw;"
            title="正在批量删除域名"
            :bordered="false"
            size="huge"
            role="dialog"
            aria-modal="true"
        >
            <n-flex vertical align="center" style="padding: 20px 0;">
                <n-progress
                    type="line"
                    :percentage="batchDeleteProgress"
                    :indicator-placement="'inside'"
                    :height="24"
                    style="width: 100%;"
                />
                <n-text depth="3">
                    正在删除域名 {{ batchDeleteProgress }}% ({{ Math.floor(selectedDomains.length * batchDeleteProgress / 100) }}/{{ selectedDomains.length }})
                </n-text>
            </n-flex>
        </n-card>
    </n-modal>

    <!-- 批量修改确认对话框 -->
    <n-modal v-model:show="batchUpdateModal" :mask-closable="false">
        <n-card
            style="width: 600px; max-width: 90vw;"
            title="批量修改域名解析"
            :bordered="false"
            size="huge"
            role="dialog"
            aria-modal="true"
        >
            <template #header-extra>
                <n-button quaternary circle @click="batchUpdateModal = false">
                    <template #icon>
                        <n-icon>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
                                <path fill="none" d="M0 0h24v24H0z"/>
                                <path d="M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z" fill="currentColor"/>
                            </svg>
                        </n-icon>
                    </template>
                </n-button>
            </template>
            
            <n-alert type="info" title="批量修改说明" style="margin-bottom: 20px;">
                您即将批量修改 {{ selectedDomains.length }} 个域名的解析设置。
                <br>• TTL设置和目标地址都可以选择"不修改"来保留原值
                <br>• TTL设置可以独立修改，不受域名类型限制
                <br>• 修改目标地址时要求所有选中域名的记录类型必须一致
            </n-alert>
            
            <n-form :model="batchUpdateForm" label-placement="left" label-width="auto">
                <n-form-item label="TTL设置" required>
                    <n-select
                        v-model:value="batchUpdateForm.TTLValue"
                        :options="TTLOptions"
                        placeholder="请选择TTL"
                    />
                </n-form-item>
                <n-form-item label="目标地址" required>
                    <n-input-group>
                        <n-select
                            v-model:value="batchUpdateForm.targetMode"
                            :options="[
                                { label: '不修改', value: 'keep' },
                                { label: '修改为', value: 'change' }
                            ]"
                            style="width: 100px;"
                        />
                        <n-input
                            v-model:value="batchUpdateForm.target"
                            placeholder="请输入目标地址"
                            clearable
                            :disabled="!canModifyTarget || batchUpdateForm.targetMode === 'keep'"
                        />
                    </n-input-group>
                    <template #feedback v-if="!canModifyTarget && batchUpdateForm.targetMode === 'change'">
                        <n-text depth="3" style="font-size: 12px;">
                            选中域名的记录类型不一致，无法修改目标地址
                        </n-text>
                    </template>
                </n-form-item>
            </n-form>
            
            <n-text depth="3">
                将修改以下域名：
            </n-text>
            
            <n-list style="margin: 16px 0; max-height: 200px; overflow-y: auto;">
                <n-list-item v-for="index in selectedDomains" :key="index">
                    <n-flex vertical>
                        <n-text>
                            {{ domainData[index]?.record }}.{{ domainData[index]?.domain }}
                        </n-text>
                        <n-text depth="3" style="font-size: 12px;">
                            记录类型: {{ domainData[index]?.type }} | 当前目标: {{ domainData[index]?.target }}
                        </n-text>
                    </n-flex>
                </n-list-item>
            </n-list>
            
            <template #footer>
                <n-flex justify="end">
                    <n-button @click="batchUpdateModal = false" :disabled="batchUpdateLoading">
                        取消
                    </n-button>
                    <n-button 
                        @click="confirmBatchUpdate" 
                        type="primary" 
                        :loading="batchUpdateLoading"
                    >
                        确认修改
                    </n-button>
                </n-flex>
            </template>
        </n-card>
    </n-modal>

    <!-- 批量修改进度条 -->
    <n-modal v-model:show="batchUpdateLoading" :mask-closable="false">
        <n-card
            style="width: 500px; max-width: 90vw;"
            title="正在批量修改域名"
            :bordered="false"
            size="huge"
            role="dialog"
            aria-modal="true"
        >
            <n-flex vertical align="center" style="padding: 20px 0;">
                <n-progress
                    type="line"
                    :percentage="batchUpdateProgress"
                    :indicator-placement="'inside'"
                    :height="24"
                    style="width: 100%;"
                />
                <n-text depth="3">
                    正在修改域名 {{ batchUpdateProgress }}% ({{ Math.floor(selectedDomains.length * batchUpdateProgress / 100) }}/{{ selectedDomains.length }})
                </n-text>
            </n-flex>
        </n-card>
    </n-modal>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted, computed } from 'vue';
import { useMessage, useDialog } from 'naive-ui';
import { useUserStore } from '@/stores/user';
import { useDomainList } from './composables/useDomainList';
import { useDomainForm } from './composables/useDomainForm';
import { useDomainCreate } from './composables/useDomainCreate';
import { useDomainEdit } from './composables/useDomainEdit';
import { useDomainDelete } from './composables/useDomainDelete';
import { useDomainOptions } from './composables/useDomainOptions';
import { useTunnelList } from './composables/useTunnelList';
import DomainListHeader from './components/DomainListHeader.vue';
import DomainCard from './components/DomainCard.vue';
import DomainListEmpty from './components/DomainListEmpty.vue';
import CreateDomainModal from './components/CreateDomainModal.vue';
import EditDomainModal from './components/EditDomainModal.vue';
import type { FreeDomain, TTLValue } from './types';
import { RECORD_TYPE_OPTIONS, FAST_RECORD_TYPE_OPTIONS, TTL_OPTIONS, INFO_MESSAGES } from './constants';

const userStore = useUserStore();
const userInfo = userStore.userInfo;
const message = useMessage();
const dialog = useDialog();

// 域名列表
const { loading, domainData, fetchDomainData } = useDomainList(userInfo || undefined);

// 域名表单
const { model, fastModel, targetPlaceholder, resetForm, resetFastForm } = useDomainForm();

// 域名选项
const { domainNameOptions, loading: loadingDomainOptions, fetchDomainOptions } = useDomainOptions();

// 选中状态管理
const selectedDomains = ref<number[]>([]);
const selectAll = ref(false);

// 批量删除状态
const batchDeleteLoading = ref(false);
const batchDeleteProgress = ref(0);
const batchDeleteModal = ref(false);

// 批量修改状态
const batchUpdateLoading = ref(false);
const batchUpdateProgress = ref(0);
const batchUpdateModal = ref(false);
const batchUpdateForm = ref({
    TTLValue: '不修改' as TTLValue | '不修改',
    target: '',
    targetMode: 'keep' as 'keep' | 'change'
});

// 计算是否可以修改目标地址（记录类型一致时才能修改）
const canModifyTarget = computed(() => {
    if (selectedDomains.value.length === 0) return false;
    
    const selectedDomainTypes = new Set(selectedDomains.value.map(index => domainData.value[index]?.type));
    return selectedDomainTypes.size === 1;
});

// 处理域名选择变化
const handleDomainSelectionChange = (selected: boolean, domain: FreeDomain, index: number) => {
    if (selected) {
        if (!selectedDomains.value.includes(index)) {
            selectedDomains.value.push(index);
        }
    } else {
        const domainIndex = selectedDomains.value.indexOf(index);
        if (domainIndex > -1) {
            selectedDomains.value.splice(domainIndex, 1);
        }
    }

    // 更新全选状态
    selectAll.value = selectedDomains.value.length === domainData.value.length;
};

// 全选处理
const handleSelectAll = (checked: boolean) => {
    if (checked) {
        selectedDomains.value = domainData.value.map((_, index) => index);
    } else {
        selectedDomains.value = [];
    }
};

// 反选处理
const handleInvertSelection = () => {
    const allIndices = domainData.value.map((_, index) => index);
    selectedDomains.value = allIndices.filter(index => !selectedDomains.value.includes(index));
    selectAll.value = selectedDomains.value.length === domainData.value.length;
};

// 切换全选状态
const toggleSelectAll = () => {
    selectAll.value = !selectAll.value;
    if (selectAll.value) {
        selectedDomains.value = domainData.value.map((_, index) => index);
    } else {
        selectedDomains.value = [];
    }
};

// 批量删除处理
const handleBatchDelete = () => {
    if (selectedDomains.value.length === 0) {
        message.warning('请先选择要删除的域名');
        return;
    }
    batchDeleteModal.value = true;
};

// 批量修改处理
const handleBatchUpdate = () => {
    if (selectedDomains.value.length === 0) {
        message.warning('请先选择要修改的域名');
        return;
    }
    
    // 重置表单
    batchUpdateForm.value.TTLValue = '不修改';
    batchUpdateForm.value.target = '';
    batchUpdateForm.value.targetMode = 'keep';
    
    batchUpdateModal.value = true;
};

// 确认批量修改
const confirmBatchUpdate = async () => {
    // 如果选择了修改目标地址，检查选中的域名类型是否一致
    if (batchUpdateForm.value.targetMode === 'change') {
        const selectedDomainTypes = new Set(selectedDomains.value.map(index => domainData.value[index]?.type));
        if (selectedDomainTypes.size > 1) {
            message.error('批量修改目标地址要求所有选中域名的记录类型必须一致');
            return;
        }
        
        // 检查是否填写了目标地址
        if (!batchUpdateForm.value.target.trim()) {
            message.error('请填写要修改的目标地址');
            return;
        }
    }
    
    // 检查是否至少修改了TTL或目标地址中的一个
    if (batchUpdateForm.value.TTLValue === '不修改' && batchUpdateForm.value.targetMode === 'keep') {
        message.error('请至少修改TTL或目标地址中的一个');
        return;
    }
    
    batchUpdateLoading.value = true;
    batchUpdateProgress.value = 0;
    
    const total = selectedDomains.value.length;
    let successCount = 0;
    let failedCount = 0;
    
    for (let i = 0; i < selectedDomains.value.length; i++) {
        const index = selectedDomains.value[i];
        const domain = domainData.value[index];
        
        try {
            // 确定要使用的TTL值
            const ttlValue = batchUpdateForm.value.TTLValue === '不修改' ? domain.ttl : batchUpdateForm.value.TTLValue;
            
            // 确定要使用的目标地址
            const targetValue = batchUpdateForm.value.targetMode === 'keep' ? domain.target : batchUpdateForm.value.target.trim();
            
            await updateDomain({
                selectedDomain: domain.domain,
                selectedRecordType: domain.type,
                recordValue: domain.record,
                TTLValue: ttlValue as TTLValue,
                target: targetValue
            });
            successCount++;
        } catch (error) {
            failedCount++;
            console.error(`修改域名 ${domain.record}.${domain.domain} 失败:`, error);
        }
        
        // 更新进度
        batchUpdateProgress.value = Math.floor(((i + 1) / total) * 100);
        
        // 添加短暂延迟，避免请求过快
        await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    // 完成处理
    batchUpdateLoading.value = false;
    batchUpdateModal.value = false;
    
    // 清空选中状态
    selectedDomains.value = [];
    selectAll.value = false;
    
    // 显示结果
    if (failedCount === 0) {
        message.success(`成功修改 ${successCount} 个域名`);
    } else {
        message.warning(`修改完成：成功 ${successCount} 个，失败 ${failedCount} 个`);
    }
};

// 确认批量删除
const confirmBatchDelete = async () => {
    batchDeleteLoading.value = true;
    batchDeleteProgress.value = 0;
    
    const total = selectedDomains.value.length;
    let successCount = 0;
    let failedCount = 0;
    
    // 按索引排序，确保从后往前删除，避免索引变化问题
    const sortedIndices = [...selectedDomains.value].sort((a, b) => b - a);
    
    for (let i = 0; i < sortedIndices.length; i++) {
        const index = sortedIndices[i];
        const domain = domainData.value[index];
        
        try {
            await deleteDomain(domain, index);
            successCount++;
        } catch (error) {
            failedCount++;
            console.error(`删除域名 ${domain.record}.${domain.domain} 失败:`, error);
        }
        
        // 更新进度
        batchDeleteProgress.value = Math.floor(((i + 1) / total) * 100);
        
        // 添加短暂延迟，避免请求过快
        await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    // 完成处理
    batchDeleteLoading.value = false;
    batchDeleteModal.value = false;
    
    // 清空选中状态
    selectedDomains.value = [];
    selectAll.value = false;
    
    // 显示结果
    if (failedCount === 0) {
        message.success(`成功删除 ${successCount} 个域名`);
    } else {
        message.warning(`删除完成：成功 ${successCount} 个，失败 ${failedCount} 个`);
    }
};

// 隧道列表
const {
    loading: loadingSelectedTunnel,
    tunnelOptions,
    selectedTunnelInfo,
    fetchTunnelList,
    handleTunnelChange: handleTunnelChangeComposable,
} = useTunnelList(userInfo || undefined);

// 创建域名
const {
    loading: createLoading,
    createDomain,
    createFastDomain,
} = useDomainCreate(userInfo || undefined, () => {
    createDomainNameModal.value = false;
    resetForm();
    resetFastForm();
    fetchDomainData();
});

// 编辑域名
const { loading: editLoading, updateDomain } = useDomainEdit(userInfo || undefined, () => {
    editDomainNameModal.value = false;
    resetForm();
    fetchDomainData();
});

// 删除域名
const { deleteDomain } = useDomainDelete(userInfo || undefined, () => {
    fetchDomainData();
});

// 模态框状态
const createDomainNameModal = ref(false);
const createDomainNameLoading = ref(false);
const editDomainNameModal = ref(false);

// 无限滚动
const count = ref(16);
const handleLoad = () => {
    count.value += 1;
};

// 域名加载状态
const domainLoading = ref<boolean[]>([]);

watch(
    domainData,
    (newDomainData) => {
        domainLoading.value = newDomainData.map(() => false);
    },
    { immediate: true }
);

const size = ref('medium');

// 记录类型选项
const recordTypeOptions = RECORD_TYPE_OPTIONS;
const fastRecordTypeOptions = FAST_RECORD_TYPE_OPTIONS;
const TTLOptions = TTL_OPTIONS;

// 创建域名
const handleCreateDomain = async () => {
    createDomainNameLoading.value = true;
    await fetchDomainOptions();
    createDomainNameModal.value = true;
    createDomainNameLoading.value = false;
};

// 编辑域名
const handleEditDomain = (domain: FreeDomain) => {
    model.value.selectedDomain = domain.domain || '';
    model.value.selectedRecordType = domain.type;
    model.value.recordValue = domain.record;
    model.value.TTLValue = domain.ttl as TTLValue;
    model.value.target = domain.target;
    editDomainNameModal.value = true;
};

// 删除域名
const handleDeleteDomain = async (domain: FreeDomain, index: number) => {
    domainLoading.value[index] = true;
    await deleteDomain(domain, index);
    domainLoading.value[index] = false;
};

// 提交创建表单
const handleSubmit = async () => {
    await createDomain(model.value);
};

// 提交快速创建表单
const handleFastSubmit = async (isConfirmed = false) => {
    if (fastModel.value.selectedRecordType === 'CNAME' && !isConfirmed) {
        dialog.warning({
            title: '注意',
            content: INFO_MESSAGES.CNAME_WARNING,
            positiveText: '我真的明白了',
            onPositiveClick: () => handleFastSubmit(true),
        });
        return;
    }

    if (!selectedTunnelInfo.value) {
        message.error('请选择隧道');
        return;
    }

    await createFastDomain(fastModel.value, selectedTunnelInfo.value);
};

// 提交编辑表单
const handleEditSubmit = async () => {
    await updateDomain(model.value);
};

// 标签页切换
const handleTabChange = async (activeName: string) => {
    if (activeName === '快速解析') {
        await fetchTunnelList();
    }
};

// 同步隧道选择变化
watch(
    () => fastModel.value.selectedTunnel,
    (newValue) => {
        if (newValue) {
            handleTunnelChangeComposable(newValue);
        }
    }
);

onMounted(() => {
    fetchDomainData();
});
</script>

<style scoped>
.domain-grid {
    margin-top: 0;
}

.grid-item {
    transition: opacity 0.2s ease;
}

.grid-item:hover {
    opacity: 0.95;
}
</style>
