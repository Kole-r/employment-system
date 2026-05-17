<template>
    <div class="job-page">
        <!-- Hero -->
        <div class="page-hero">
            <div class="hero-left">
                <span class="hero-label">JOB MANAGEMENT</span>
                <h1 class="hero-title">岗位列表</h1>
            </div>
            <div class="hero-right">
                <div class="stat-block">
                    <span class="stat-num">{{ tableData.length }}</span>
                    <span class="stat-label">TOTAL</span>
                </div>
                <div class="stat-block">
                    <span class="stat-num">{{ tableData.filter(i => i.status === 1).length }}</span>
                    <span class="stat-label">HIRING</span>
                </div>
            </div>
        </div>

        <!-- Filter Bar -->
        <div class="filter-bar">
            <div class="filter-left">
                <div class="segmented-control">
                    <button
                        v-for="t in typeOptions"
                        :key="t.value"
                        :class="['segment', { active: activeType === t.value }]"
                        @click="activeType = t.value"
                    >{{ t.label }}</button>
                </div>
                <div class="search-box">
                    <input v-model="keyword" type="text" class="search-input" placeholder="搜索岗位或公司..." />
                </div>
            </div>
            <span class="result-count">{{ filteredData.length }} RESULTS</span>
        </div>

        <!-- Status -->
        <div v-if="statusMsg" class="status-msg">{{ statusMsg }}</div>

        <!-- Table -->
        <div class="table-wrap">
            <table class="data-table">
                <thead>
                    <tr>
                        <th class="col-index">#</th>
                        <th class="col-company">公司</th>
                        <th class="col-title">岗位</th>
                        <th class="col-city">城市</th>
                        <th class="col-salary">薪资</th>
                        <th class="col-degree">学历</th>
                        <th class="col-status">状态</th>
                        <th class="col-actions">操作</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(item, index) in filteredData" :key="item.id">
                        <td class="col-index">{{ index + 1 }}</td>
                        <td class="col-company">
                            <span class="company-name">{{ item.company_name }}</span>
                            <span class="company-type">{{ item.company_type }}</span>
                        </td>
                        <td class="col-title">
                            <span class="title-text">{{ item.job_title }}</span>
                            <span class="job-tags" v-if="item.tags">
                                <span class="tag" v-for="t in item.tags.split(',').slice(0, 3)" :key="t">{{ t }}</span>
                            </span>
                        </td>
                        <td class="col-city">{{ item.city }}</td>
                        <td class="col-salary">
                            <span class="salary-val">{{ item.salary_min / 1000 }}K–{{ item.salary_max / 1000 }}K</span>
                        </td>
                        <td class="col-degree">{{ item.degree_required }}</td>
                        <td class="col-status">
                            <span :class="['status-dot', item.status === 1 ? 'on' : 'off']"></span>
                            <span :class="['status-text', item.status === 1 ? 'on' : 'off']">
                                {{ item.status === 1 ? '招聘中' : '已下架' }}
                            </span>
                        </td>
                        <td class="col-actions">
                            <button class="abtn abtn-edit" @click="handleEdit(item)">编辑</button>
                            <button class="abtn abtn-toggle" @click="handleToggle(item)">
                                {{ item.status === 1 ? '下架' : '上架' }}
                            </button>
                            <button class="abtn abtn-delete" @click="handleDelete(item)">删除</button>
                        </td>
                    </tr>
                </tbody>
            </table>
            <div v-if="filteredData.length === 0" class="empty-state">
                <span class="empty-label">NO DATA</span>
                <span class="empty-desc">暂无岗位数据</span>
            </div>
        </div>

        <!-- Edit Modal -->
        <Teleport to="body">
            <Transition name="fade">
                <div v-if="editVisible" class="modal-backdrop" @click.self="editVisible = false">
                    <div class="edit-modal">
                        <div class="modal-top">
                            <span class="modal-tag">EDIT JOB</span>
                            <button class="modal-close" @click="editVisible = false">&times;</button>
                        </div>
                        <div class="edit-scroll">
                            <div class="edit-section-title">岗位信息</div>
                            <div class="form-row">
                                <div class="form-group form-group-half">
                                    <label class="form-label">岗位名称</label>
                                    <input v-model="editForm.job_title" type="text" class="form-input" placeholder="如：前端开发工程师" />
                                    <span v-if="editErrors.job_title" class="form-error">{{ editErrors.job_title }}</span>
                                </div>
                                <div class="form-group form-group-half">
                                    <label class="form-label">工作城市</label>
                                    <input v-model="editForm.city" type="text" class="form-input" placeholder="如：北京" />
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group form-group-half">
                                    <label class="form-label">岗位类型</label>
                                    <div class="select-wrap">
                                        <select v-model="editForm.job_type" class="form-select">
                                            <option :value="null" disabled>请选择类型</option>
                                            <option value="技术">技术</option>
                                            <option value="产品">产品</option>
                                            <option value="运营">运营</option>
                                            <option value="设计">设计</option>
                                        </select>
                                        <span class="select-arrow">&#9662;</span>
                                    </div>
                                </div>
                                <div class="form-group form-group-half">
                                    <label class="form-label">岗位分类</label>
                                    <input v-model="editForm.job_category" type="text" class="form-input" placeholder="如：前端/后端/算法" />
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group form-group-half">
                                    <label class="form-label">学历要求</label>
                                    <div class="select-wrap">
                                        <select v-model="editForm.degree_required" class="form-select">
                                            <option :value="null" disabled>请选择</option>
                                            <option value="本科">本科</option>
                                            <option value="硕士">硕士</option>
                                            <option value="博士">博士</option>
                                        </select>
                                        <span class="select-arrow">&#9662;</span>
                                    </div>
                                </div>
                                <div class="form-group form-group-half">
                                    <label class="form-label">经验要求</label>
                                    <input v-model="editForm.experience" type="text" class="form-input" placeholder="如：应届/1-3年" />
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group form-group-half">
                                    <label class="form-label">最低薪资</label>
                                    <input v-model.number="editForm.salary_min" type="number" class="form-input" placeholder="如：15000" />
                                </div>
                                <div class="form-group form-group-half">
                                    <label class="form-label">最高薪资</label>
                                    <input v-model.number="editForm.salary_max" type="number" class="form-input" placeholder="如：30000" />
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group form-group-half">
                                    <label class="form-label">招聘人数</label>
                                    <input v-model.number="editForm.headcount" type="number" class="form-input" placeholder="1" />
                                </div>
                                <div class="form-group form-group-half">
                                    <label class="form-label">标签</label>
                                    <input v-model="editForm.tags" type="text" class="form-input" placeholder="逗号分隔，如：Vue,React" />
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">岗位描述</label>
                                <textarea v-model="editForm.job_description" class="form-textarea" rows="3" placeholder="描述日常工作内容"></textarea>
                            </div>
                            <div class="form-group">
                                <label class="form-label">岗位要求</label>
                                <textarea v-model="editForm.job_requirements" class="form-textarea" rows="3" placeholder="任职资格要求"></textarea>
                            </div>
                            <div class="form-group">
                                <label class="form-label">福利待遇</label>
                                <input v-model="editForm.benefits" type="text" class="form-input" placeholder="逗号分隔，如：五险一金,带薪年假" />
                            </div>
                            <div class="form-group">
                                <label class="form-label">投递链接</label>
                                <input v-model="editForm.link" type="text" class="form-input" placeholder="如：https://company.com/apply" />
                            </div>

                            <div class="edit-section-title">公司信息</div>
                            <div class="form-row">
                                <div class="form-group form-group-half">
                                    <label class="form-label">公司名称</label>
                                    <input v-model="editForm.company_name" type="text" class="form-input" placeholder="如：字节跳动" />
                                    <span v-if="editErrors.company_name" class="form-error">{{ editErrors.company_name }}</span>
                                </div>
                                <div class="form-group form-group-half">
                                    <label class="form-label">公司类型</label>
                                    <input v-model="editForm.company_type" type="text" class="form-input" placeholder="如：互联网" />
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">公司规模</label>
                                <input v-model="editForm.company_size" type="text" class="form-input" placeholder="如：10000人以上" style="max-width: 340px;" />
                            </div>
                            <div class="form-group">
                                <label class="form-label">公司描述</label>
                                <textarea v-model="editForm.company_desc" class="form-textarea" rows="2" placeholder="一句话介绍公司"></textarea>
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

const tableData = ref([]);
const activeType = ref('all');
const keyword = ref('');
const statusMsg = ref('');
const editVisible = ref(false);
const editStatusMsg = ref('');

const typeOptions = [
    { label: '全部', value: 'all' },
    { label: '技术', value: '技术' },
    { label: '产品', value: '产品' },
    { label: '运营', value: '运营' },
    { label: '设计', value: '设计' }
];

const editForm = ref({});
const editErrors = reactive({ job_title: '', company_name: '' });

const filteredData = computed(() => {
    let data = tableData.value;
    if (activeType.value !== 'all') {
        data = data.filter(i => i.job_type === activeType.value);
    }
    if (keyword.value) {
        const kw = keyword.value.toLowerCase();
        data = data.filter(i =>
            i.job_title.toLowerCase().includes(kw) ||
            i.company_name.toLowerCase().includes(kw)
        );
    }
    return data;
});

const showStatus = (msg) => {
    statusMsg.value = msg;
    setTimeout(() => { statusMsg.value = ''; }, 3000);
};

onMounted(() => { getTableData(); });

const getTableData = async () => {
    try {
        const res = await axios.get('/adminApi/job/list');
        tableData.value = res.data.data;
    } catch (e) {
        console.error(e);
    }
};

const handleEdit = (row) => {
    editForm.value = { ...row };
    editVisible.value = true;
};

const validateEdit = () => {
    editErrors.job_title = '';
    editErrors.company_name = '';
    let valid = true;
    if (!editForm.value.job_title) {
        editErrors.job_title = '请输入岗位名称';
        valid = false;
    }
    if (!editForm.value.company_name) {
        editErrors.company_name = '请输入公司名称';
        valid = false;
    }
    return valid;
};

const submitEdit = async () => {
    if (!validateEdit()) return;
    try {
        await axios.put(`/adminApi/job/update/${editForm.value.id}`, editForm.value, {
            headers: { 'Content-Type': 'application/json' }
        });
        editVisible.value = false;
        showStatus('[SAVED]');
        getTableData();
    } catch (e) {
        editStatusMsg.value = '[ERROR] 保存失败';
        setTimeout(() => { editStatusMsg.value = ''; }, 3000);
    }
};

const handleToggle = async (row) => {
    try {
        const newStatus = row.status === 1 ? 0 : 1;
        await axios.put(`/adminApi/job/update/${row.id}`, { status: newStatus }, {
            headers: { 'Content-Type': 'application/json' }
        });
        row.status = newStatus;
        showStatus(newStatus === 1 ? '[HIRED]' : '[CLOSED]');
    } catch (e) {
        showStatus('[ERROR] 操作失败');
    }
};

const handleDelete = async (row) => {
    try {
        await axios.delete(`/adminApi/job/delete/${row.id}`);
        showStatus('[DELETED]');
        getTableData();
    } catch (e) {
        showStatus('[ERROR] 删除失败');
    }
};
</script>

<style lang="scss" scoped>
$black: #000000;
$surface: #0A0A0A;
$surface-1: #111111;
$surface-2: #161616;
$border: #1E1E1E;
$border-hi: #2A2A2A;
$g1: #333333;
$g2: #555555;
$g3: #888888;
$g4: #AAAAAA;
$g5: #CCCCCC;
$white: #F0F0F0;
$pure: #FFFFFF;
$accent: #D71921;
$green: #3DDC84;
$amber: #D4A843;
$blue: #5B9BF6;

.job-page {
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

.stat-block { text-align: right; }

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

/* ── Filter ── */
.filter-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
}

.filter-left {
    display: flex;
    align-items: center;
    gap: 16px;
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

    &:hover { color: $g5; }
    &.active {
        background: $pure;
        color: $black;
        font-weight: 700;
    }
}

.search-box { margin-left: 8px; }

.search-input {
    background: $surface-2;
    border: 1px solid $border-hi;
    border-radius: 999px;
    padding: 10px 18px;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 13px;
    color: $white;
    outline: none;
    width: 220px;
    transition: border-color 150ms ease-out;

    &::placeholder { color: $g1; }
    &:focus { border-color: $g4; }
}

.result-count {
    font-family: 'Space Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.08em;
    color: $g2;
}

/* ── Status ── */
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
    border-radius: 12px;
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

.col-company {
    min-width: 140px;
}

.company-name {
    color: $white;
    font-weight: 500;
    display: block;
}

.company-type {
    font-family: 'Space Mono', monospace;
    font-size: 11px;
    color: $g2;
}

.col-title {
    min-width: 180px;
}

.title-text {
    color: $white;
    font-weight: 500;
    display: block;
}

.job-tags {
    display: flex;
    gap: 4px;
    margin-top: 4px;
    flex-wrap: wrap;
}

.tag {
    font-family: 'Space Mono', monospace;
    font-size: 10px;
    color: $g3;
    border: 1px solid $border-hi;
    border-radius: 999px;
    padding: 1px 8px;
}

.col-city {
    font-family: 'Space Mono', monospace;
    font-size: 12px;
    color: $g4;
}

.col-salary {
    min-width: 100px;
}

.salary-val {
    font-family: 'Space Mono', monospace;
    font-size: 14px;
    font-weight: 700;
    color: $amber;
}

.col-degree {
    font-family: 'Space Mono', monospace;
    font-size: 12px;
    color: $g4;
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

.col-actions { width: 200px; }

/* ── Buttons ── */
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

.abtn-edit {
    border-color: $g4;
    color: $g4;
    &:hover { background: $g4; color: $black; }
}

.abtn-toggle {
    border-color: $green;
    color: $green;
    &:hover { background: $green; color: $black; }
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

/* ── Empty ── */
.empty-state {
    text-align: center;
    padding: 64px 0;
}

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

.edit-modal {
    background: $surface;
    border: 1px solid $border-hi;
    border-radius: 16px;
    width: 720px;
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

.edit-scroll {
    padding: 28px 24px;
    overflow-y: auto;
    flex: 1;
}

.form-row {
    display: flex;
    gap: 16px;
}

.form-group {
    margin-bottom: 20px;
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
    &:focus { border-color: $g4; }
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

    &:focus { border-color: $g4; }
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
    &:focus { border-color: $g4; }
}

.edit-section-title {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 15px;
    font-weight: 500;
    color: $white;
    margin-bottom: 16px;
    margin-top: 8px;
    padding-bottom: 10px;
    border-bottom: 1px solid $border;

    &:first-child { margin-top: 0; }
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
