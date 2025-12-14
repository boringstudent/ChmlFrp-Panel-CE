<template>
    <n-card style="margin-bottom: 12px" title="隧道列表">
        <template #header-extra>
            <n-space>
                <n-button round quaternary @click="$emit('selectAll')" :disabled="!hasTunnels" :type="isAllSelected ? 'primary' : 'default'">
                    <template #icon>
                        <n-icon :component="CheckmarkDoneOutline" />
                    </template>
                    {{ isAllSelected ? '取消全选' : '全选' }}
                </n-button>
                <n-button round quaternary @click="$emit('invertSelection')" :disabled="!hasTunnels">
                    <template #icon>
                        <n-icon :component="SwapHorizontalOutline" />
                    </template>
                    反选
                </n-button>
                <n-button 
                    round 
                    quaternary 
                    @click="$emit('batchDelete')" 
                    :disabled="!hasSelectedTunnels" 
                    :type="hasSelectedTunnels ? 'error' : 'default'"
                    :loading="batchDeleting"
                >
                    <template #icon>
                        <n-icon :component="TrashOutline" />
                    </template>
                    批量删除 ({{ selectedCount }})
                </n-button>
                <n-button round quaternary :loading="loading" @click="$emit('refresh')">
                    <template #icon>
                        <n-icon :component="RefreshOutline" />
                    </template>
                    刷新
                </n-button>
                <n-button @click="$emit('add')" :loading="adding" type="primary" round quaternary :disabled="adding">
                    <template #icon>
                        <n-icon v-if="!adding" :component="AddOutline" />
                    </template>
                    添加隧道
                </n-button>
            </n-space>
        </template>
    </n-card>
</template>

<script lang="ts" setup>
import { AddOutline, RefreshOutline, CheckmarkDoneOutline, SwapHorizontalOutline, TrashOutline } from '@vicons/ionicons5';

interface Props {
    loading: boolean;
    adding: boolean;
    batchDeleting: boolean;
    hasTunnels: boolean;
    hasSelectedTunnels: boolean;
    selectedCount: number;
    isAllSelected: boolean;
}

defineProps<Props>();

defineEmits<{
    refresh: [];
    add: [];
    selectAll: [];
    invertSelection: [];
    batchDelete: [];
}>();
</script>
