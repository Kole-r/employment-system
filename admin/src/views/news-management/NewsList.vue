<template>
    <div class="news-page">
        <!-- 顶部标题区 -->
        <div class="page-hero">
            <div class="hero-left">
                <span class="hero-label">NEWS MANAGEMENT</span>
                <h1 class="hero-title">新闻列表</h1>
            </div>
            <div class="hero-right">
                <div class="stat-block">
                    <span class="stat-num">{{ tableData.length }}</span>
                    <span class="stat-label">TOTAL</span>
                </div>
                <div class="stat-block">
                    <span class="stat-num">{{ tableData.filter(i => i.isPublish === 1).length }}</span>
                    <span class="stat-label">PUBLISHED</span>
                </div>
            </div>
        </div>

        <!-- 分类浏览 -->
        <div class="filter-bar">
            <div class="segmented-control">
                <button
                    v-for="cat in categoryOptions"
                    :key="cat.value"
                    :class="['segment', { active: activeCategory === cat.value }]"
                    @click="activeCategory = cat.value"
                >{{ cat.label }}</button>
            </div>
            <span class="result-count">{{ filteredData.length }} RESULTS</span>
        </div>

        <!-- 状态提示 -->
        <div v-if="statusMsg" class="status-msg">{{ statusMsg }}</div>

        <!-- 数据表格 -->
        <div class="table-wrap">
            <table class="data-table">
                <thead>
                    <tr>
                        <th class="col-index">#</th>
                        <th class="col-cover">封面</th>
                        <th class="col-title">标题</th>
                        <th class="col-cat">分类</th>
                        <th class="col-status">状态</th>
                        <th class="col-time">编辑时间</th>
                        <th class="col-actions">操作</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(item, index) in filteredData" :key="item.id">
                        <td class="col-index">{{ index + 1 }}</td>
                        <td class="col-cover">
                            <div class="cover-thumb" v-if="item.cover">
                                <img :src="item.cover" alt="" />
                            </div>
                            <span v-else class="no-cover">—</span>
                        </td>
                        <td class="col-title">
                            <span class="title-text">{{ item.title }}</span>
                        </td>
                        <td class="col-cat">
                            <span class="cat-pill">{{ getCategoryLabel(item.category) }}</span>
                        </td>
                        <td class="col-status">
                            <span :class="['status-dot', item.isPublish === 1 ? 'on' : 'off']"></span>
                            <span :class="['status-text', item.isPublish === 1 ? 'on' : 'off']">
                                {{ item.isPublish === 1 ? '已发布' : '草稿' }}
                            </span>
                        </td>
                        <td class="col-time">{{ item.editTime }}</td>
                        <td class="col-actions">
                            <button class="abtn abtn-preview" @click="handlePreview(item)">预览</button>
                            <button class="abtn abtn-publish" @click="handlePublish(item)">
                                {{ item.isPublish === 1 ? '撤回' : '发布' }}
                            </button>
                            <button class="abtn abtn-edit" @click="handleEdit(item)">编辑</button>
                            <button class="abtn abtn-delete" @click="handleDelete(item)">删除</button>
                        </td>
                    </tr>
                </tbody>
            </table>
            <div v-if="filteredData.length === 0" class="empty-state">
                <span class="empty-label">NO DATA</span>
                <span class="empty-desc">当前分类下没有新闻</span>
            </div>
        </div>

        <!-- 预览弹窗 -->
        <Teleport to="body">
            <Transition name="fade">
                <div v-if="previewVisible" class="modal-backdrop" @click.self="previewVisible = false">
                    <div class="preview-modal">
                        <div class="modal-top">
                            <span class="modal-tag">PREVIEW</span>
                            <button class="modal-close" @click="previewVisible = false">&times;</button>
                        </div>
                        <div class="preview-scroll">
                            <div class="preview-head">
                                <span class="pv-label">TITLE</span>
                                <h2 class="pv-title">{{ previewData.title }}</h2>
                            </div>
                            <div class="preview-row">
                                <div class="pv-field">
                                    <span class="pv-label">CATEGORY</span>
                                    <span class="pv-val">{{ getCategoryLabel(previewData.category) }}</span>
                                </div>
                                <div class="pv-field">
                                    <span class="pv-label">STATUS</span>
                                    <span :class="['pv-val', previewData.isPublish === 1 ? 'on' : 'off']">
                                        {{ previewData.isPublish === 1 ? 'PUBLISHED' : 'DRAFT' }}
                                    </span>
                                </div>
                                <div class="pv-field">
                                    <span class="pv-label">EDIT TIME</span>
                                    <span class="pv-val">{{ previewData.editTime }}</span>
                                </div>
                            </div>
                            <div v-if="previewData.cover" class="preview-cover">
                                <img :src="previewData.cover" alt="" />
                            </div>
                            <div class="preview-divider"></div>
                            <div class="preview-body" v-html="previewData.content"></div>
                        </div>
                    </div>
                </div>
            </Transition>
        </Teleport>

        <AdminChatBot :context="chatContext" />

        <!-- 编辑弹窗 -->
        <Teleport to="body">
            <Transition name="fade">
                <div v-if="editVisible" class="modal-backdrop" @click.self="editVisible = false">
                    <div class="edit-modal">
                        <div class="modal-top">
                            <span class="modal-tag">EDIT ARTICLE</span>
                            <button class="modal-close" @click="editVisible = false">&times;</button>
                        </div>
                        <div class="edit-scroll">
                            <div class="form-group">
                                <label class="form-label">新闻标题</label>
                                <input v-model="editForm.title" type="text" class="form-input" placeholder="请输入新闻标题（5-100字）" />
                                <span v-if="editErrors.title" class="form-error">{{ editErrors.title }}</span>
                            </div>
                            <div class="form-group">
                                <label class="form-label">新闻内容</label>
                                <textarea v-model="editForm.content" class="form-textarea" rows="10" placeholder="请输入新闻内容"></textarea>
                                <span v-if="editErrors.content" class="form-error">{{ editErrors.content }}</span>
                            </div>
                            <div class="form-row">
                                <div class="form-group form-group-half">
                                    <label class="form-label">类别</label>
                                    <div class="select-wrap">
                                        <select v-model="editForm.category" class="form-select">
                                            <option :value="null" disabled>请选择类别</option>
                                            <option :value="1">政策解读</option>
                                            <option :value="2">行业动态</option>
                                            <option :value="3">求职技巧</option>
                                            <option :value="4">校园招聘</option>
                                        </select>
                                        <span class="select-arrow">&#9662;</span>
                                    </div>
                                    <span v-if="editErrors.category" class="form-error">{{ editErrors.category }}</span>
                                </div>
                                <div class="form-group form-group-half">
                                    <label class="form-label">封面</label>
                                    <Upload :avatar="editForm.cover" @koleChange="handleEditCoverChange" />
                                </div>
                            </div>
                        </div>
                        <div class="modal-foot">
                            <span v-if="editStatusMsg" class="edit-status">{{ editStatusMsg }}</span>
                            <button class="abtn abtn-cancel" @click="editVisible = false">取消</button>
                            <button class="abtn abtn-save" @click="submitEdit">保存</button>
                        </div>
                    </div>
                </div>
            </Transition>
        </Teleport>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue';
import axios from '@/util/axios.config.js';
import upload from '@/util/upload.js';
import Upload from '@/components/upload/Upload.vue';
import AdminChatBot from '@/components/AdminChatBot.vue';

const tableData = ref([]);
const activeCategory = ref(0);
const statusMsg = ref('');
const previewVisible = ref(false);
const previewData = ref({});
const editVisible = ref(false);
const editStatusMsg = ref('');

const editForm = ref({
    id: null, title: '', content: '', category: null, cover: '', file: null, isPublish: 0
});

const editErrors = reactive({ title: '', content: '', category: '' });

const categoryOptions = [
    { label: '全部', value: 0 },
    { label: '政策解读', value: 1 },
    { label: '行业动态', value: 2 },
    { label: '求职技巧', value: 3 },
    { label: '校园招聘', value: 4 }
];

const filteredData = computed(() => {
    if (activeCategory.value === 0) return tableData.value;
    return tableData.value.filter(i => i.category === activeCategory.value);
});

const chatContext = computed(() => {
    const category = getCategoryLabel(activeCategory.value);
    const total = tableData.value.length;
    const published = tableData.value.filter(i => i.isPublish === 1).length;
    return `当前页面：新闻管理\n分类筛选：${category}\n新闻总数：${total}\n已发布：${published}\n分类选项：政策解读(1)、行业动态(2)、求职技巧(3)、校园招聘(4)`;
});

const getCategoryLabel = (val) => categoryOptions.find(c => c.value === val)?.label || '未知';

const showStatus = (msg) => {
    statusMsg.value = msg;
    setTimeout(() => { statusMsg.value = ''; }, 3000);
};

onMounted(() => { getTableData(); });

const getTableData = async () => {
    try {
        const res = await axios.get('/adminApi/news/list');
        tableData.value = res.data.data;
    } catch (e) {
        console.error(e);
    }
};

const handlePreview = (row) => {
    previewData.value = { ...row };
    previewVisible.value = true;
};

const handlePublish = async (row) => {
    try {
        const newStatus = row.isPublish === 1 ? 0 : 1;
        await axios.put(`/adminApi/news/update/${row.id}`,
            { isPublish: newStatus },
            { headers: { 'Content-Type': 'application/json' } }
        );
        row.isPublish = newStatus;
        showStatus(newStatus === 1 ? '[PUBLISHED]' : '[UNPUBLISHED]');
    } catch (e) {
        showStatus('[ERROR] 操作失败');
    }
};

const handleEdit = (row) => {
    editForm.value = {
        id: row.id, title: row.title, content: row.content,
        category: row.category, cover: row.cover, file: null, isPublish: row.isPublish
    };
    editVisible.value = true;
};

const handleEditCoverChange = (file) => {
    editForm.value.cover = URL.createObjectURL(file);
    editForm.value.file = file;
};

const validateEdit = () => {
    editErrors.title = '';
    editErrors.content = '';
    editErrors.category = '';
    let valid = true;
    if (!editForm.value.title || editForm.value.title.length < 5) {
        editErrors.title = '标题长度至少 5 个字符';
        valid = false;
    }
    if (editForm.value.title.length > 100) {
        editErrors.title = '标题长度不能超过 100 个字符';
        valid = false;
    }
    if (!editForm.value.content || editForm.value.content.length < 20) {
        editErrors.content = '内容长度至少 20 个字符';
        valid = false;
    }
    if (!editForm.value.category) {
        editErrors.category = '请选择新闻分类';
        valid = false;
    }
    return valid;
};

const submitEdit = async () => {
    if (!validateEdit()) return;
    try {
        const fd = new FormData();
        fd.append('title', editForm.value.title);
        fd.append('content', editForm.value.content);
        fd.append('category', editForm.value.category);
        fd.append('isPublish', editForm.value.isPublish);
        if (editForm.value.file) fd.append('file', editForm.value.file);
        await axios.put(`/adminApi/news/update/${editForm.value.id}`, fd, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        editVisible.value = false;
        showStatus('[SAVED]');
        getTableData();
    } catch (e) {
        editStatusMsg.value = '[ERROR] 保存失败';
        setTimeout(() => { editStatusMsg.value = ''; }, 3000);
    }
};

const handleDelete = async (row) => {
    try {
        await axios.delete(`/adminApi/news/delete/${row.id}`);
        showStatus('[DELETED]');
        getTableData();
    } catch (e) {
        showStatus('[ERROR] 删除失败');
    }
};
</script>

<style lang="scss" scoped>
/* ── Tokens ── */
$black: #F7F8FA;
$surface: #FFFFFF;
$surface-1: #FFFFFF;
$surface-2: #F2F4F7;
$border: #E4E7EB;
$border-hi: #D0D5DD;
$g1: #98A2B3;
$g2: #667085;
$g3: #475467;
$g4: #344054;
$g5: #1D2939;
$white: #344054;
$pure: #101828;
$accent: #2563EB;
$green: #16A34A;
$amber: #D97706;
$blue: #2563EB;

.news-page {
    font-family: 'Space Grotesk', system-ui, sans-serif;
    color: $g5;
    background: $black;
    min-height: 100vh;
    padding: 32px 40px 64px;
}

/* ── Hero ── */
.page-hero {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 40px;
}

.hero-label {
    font-family: 'Space Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.1em;
    color: $g3;
    display: block;
    margin-bottom: 8px;
}

.hero-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 36px;
    font-weight: 700;
    color: $pure;
    margin: 0;
    letter-spacing: -0.02em;
}

.hero-right {
    display: flex;
    gap: 32px;
}

.stat-block {
    text-align: right;
}

.stat-num {
    font-family: 'Space Mono', monospace;
    font-size: 32px;
    font-weight: 700;
    color: $pure;
    display: block;
    line-height: 1;
}

.stat-label {
    font-family: 'Space Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.1em;
    color: $g2;
    margin-top: 4px;
    display: block;
}

/* ── Filter Bar ── */
.filter-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
}

.segmented-control {
    display: inline-flex;
    border: 1px solid $border-hi;
    border-radius: 999px;
    overflow: hidden;
}

.segment {
    font-family: 'Space Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 10px 22px;
    background: transparent;
    border: none;
    color: $g3;
    cursor: pointer;
    transition: all 150ms ease-out;
    position: relative;

    &:hover { color: $g5; }

    &.active {
        background: $pure;
        color: $black;
        font-weight: 700;
    }
}

.result-count {
    font-family: 'Space Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.08em;
    color: $g2;
}

/* ── Status Msg ── */
.status-msg {
    font-family: 'Space Mono', monospace;
    font-size: 12px;
    letter-spacing: 0.04em;
    color: $g4;
    margin-bottom: 16px;
}

/* ── Table ── */
.table-wrap {
    border: 1px solid $border;
    border-radius: 14px;
    overflow: hidden;
    background: $surface;
}

.data-table {
    width: 100%;
    border-collapse: collapse;

    th {
        font-family: 'Space Mono', monospace;
        font-size: 10px;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: $g2;
        text-align: left;
        padding: 14px 16px;
        border-bottom: 1px solid $border-hi;
        background: $surface-1;
    }

    td {
        padding: 14px 16px;
        border-bottom: 1px solid $border;
        vertical-align: middle;
        font-size: 14px;
        color: $g5;
    }

    tbody tr {
        transition: background 100ms;

        &:hover { background: $surface-2; }
        &:last-child td { border-bottom: none; }
    }
}

.col-index {
    width: 50px;
    font-family: 'Space Mono', monospace;
    font-size: 12px;
    color: $g2;
}

.col-cover { width: 90px; }

.cover-thumb {
    width: 64px;
    height: 40px;
    border-radius: 4px;
    overflow: hidden;
    border: 1px solid $border-hi;

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
    }
}

.no-cover {
    font-family: 'Space Mono', monospace;
    font-size: 12px;
    color: $g1;
}

.col-title { min-width: 200px; }

.title-text {
    color: $white;
    font-weight: 500;
}

.col-cat { width: 80px; }

.cat-pill {
    font-family: 'Space Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.04em;
    color: $g4;
    border: 1px solid $border-hi;
    border-radius: 999px;
    padding: 3px 10px;
}

.col-status { width: 100px; }

.status-dot {
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    margin-right: 6px;
    vertical-align: middle;

    &.on { background: $green; }
    &.off { background: $g1; }
}

.status-text {
    font-family: 'Space Mono', monospace;
    font-size: 12px;
    vertical-align: middle;

    &.on { color: $green; }
    &.off { color: $g2; }
}

.col-time {
    width: 160px;
    font-family: 'Space Mono', monospace;
    font-size: 12px;
    color: $g3;
}

.col-actions {
    width: 280px;
}

/* ── Action Buttons ── */
.abtn {
    font-family: 'Space Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 5px 12px;
    border-radius: 999px;
    border: 1px solid;
    background: transparent;
    cursor: pointer;
    transition: all 150ms ease-out;
    margin-right: 6px;

    &:last-child { margin-right: 0; }
}

.abtn-preview {
    border-color: $blue;
    color: $blue;
    &:hover { background: $blue; color: $black; }
}

.abtn-publish {
    border-color: $green;
    color: $green;
    &:hover { background: $green; color: $black; }
}

.abtn-edit {
    border-color: $g4;
    color: $g4;
    &:hover { background: $g4; color: $black; }
}

.abtn-delete {
    border-color: $accent;
    color: $accent;
    &:hover { background: $accent; color: $pure; }
}

.abtn-cancel {
    border-color: $g2;
    color: $g3;
    &:hover { border-color: $g4; color: $g5; }
}

.abtn-save {
    border-color: $pure;
    color: $pure;
    &:hover { background: $pure; color: $black; }
}

/* ── Empty State ── */
.empty-state {
    text-align: center;
    padding: 64px 0;

    .empty-label {
        font-family: 'Space Mono', monospace;
        font-size: 14px;
        letter-spacing: 0.1em;
        color: $g2;
        display: block;
    }

    .empty-desc {
        font-size: 13px;
        color: $g1;
        margin-top: 8px;
        display: block;
    }
}

/* ── Modal ── */
.modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.85);
    z-index: 2000;
    display: flex;
    align-items: center;
    justify-content: center;
}

.preview-modal,
.edit-modal {
    background: $surface;
    border: 1px solid $border-hi;
    border-radius: 16px;
    width: 700px;
    max-height: 85vh;
    display: flex;
    flex-direction: column;
}

.modal-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid $border;
    flex-shrink: 0;
}

.modal-tag {
    font-family: 'Space Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.1em;
    color: $g3;
}

.modal-close {
    font-size: 20px;
    background: transparent;
    border: none;
    color: $g3;
    cursor: pointer;
    padding: 0 4px;
    line-height: 1;
    transition: color 150ms;
    &:hover { color: $pure; }
}

.modal-foot {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 16px 24px;
    border-top: 1px solid $border;
    flex-shrink: 0;
}

/* ── Preview ── */
.preview-scroll,
.edit-scroll {
    padding: 28px 24px;
    overflow-y: auto;
    flex: 1;
}

.preview-head { margin-bottom: 24px; }

.preview-row {
    display: flex;
    gap: 32px;
    margin-bottom: 24px;
}

.pv-field { flex: 1; }

.pv-label {
    font-family: 'Space Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.1em;
    color: $g2;
    display: block;
    margin-bottom: 6px;
}

.pv-val {
    font-size: 15px;
    color: $g5;

    &.on { color: $green; }
    &.off { color: $g2; }
}

.pv-title {
    font-size: 24px;
    font-weight: 700;
    color: $pure;
    margin: 0;
    line-height: 1.3;
    letter-spacing: -0.01em;
}

.preview-cover {
    margin-bottom: 24px;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid $border-hi;

    img {
        width: 100%;
        max-height: 280px;
        object-fit: cover;
        display: block;
    }
}

.preview-divider {
    height: 1px;
    background: $border-hi;
    margin-bottom: 24px;
}

.preview-body {
    font-size: 15px;
    line-height: 1.8;
    color: $g5;

    :deep(img) {
        max-width: 100%;
        border-radius: 8px;
    }
}

/* ── Edit Modal ── */
.edit-modal {
    width: 720px;
}

.form-group {
    margin-bottom: 20px;
}

.form-row {
    display: flex;
    gap: 16px;
}

.form-group-half {
    flex: 1;
}

.form-label {
    font-family: 'Space Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: $g3;
    display: block;
    margin-bottom: 8px;
}

.form-input {
    width: 100%;
    background: $surface-2;
    border: 1px solid $border-hi;
    border-radius: 8px;
    padding: 11px 14px;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 14px;
    color: $white;
    outline: none;
    transition: border-color 150ms ease-out;
    box-sizing: border-box;

    &::placeholder { color: $g1; }
    &:focus { border-color: $g4; background: #F9FAFB; }
}

.form-error {
    font-family: 'Space Mono', monospace;
    font-size: 11px;
    color: $accent;
    display: block;
    margin-top: 6px;
    letter-spacing: 0.02em;
}

.select-wrap {
    position: relative;
}

.form-select {
    width: 100%;
    background: $surface-2;
    border: 1px solid $border-hi;
    border-radius: 8px;
    padding: 11px 14px;
    padding-right: 40px;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 14px;
    color: $white;
    outline: none;
    appearance: none;
    cursor: pointer;
    transition: border-color 150ms ease-out;
    box-sizing: border-box;

    &:focus { border-color: $g4; background: #F9FAFB; }
}

.select-arrow {
    position: absolute;
    right: 14px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 12px;
    color: $g3;
    pointer-events: none;
}

.form-textarea {
    width: 100%;
    background: $surface-2;
    border: 1px solid $border-hi;
    border-radius: 8px;
    padding: 11px 14px;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 14px;
    color: $white;
    outline: none;
    resize: vertical;
    transition: border-color 150ms ease-out;
    box-sizing: border-box;

    &::placeholder { color: $g1; }
    &:focus { border-color: $g4; background: #F9FAFB; }
}

.edit-status {
    font-family: 'Space Mono', monospace;
    font-size: 12px;
    letter-spacing: 0.04em;
    color: $g4;
    margin-right: auto;
}

/* ── Transitions ── */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 200ms ease-out;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
