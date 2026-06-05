<template>
    <div class="add-page">
        <!-- Hero -->
        <div class="page-hero">
            <div class="hero-left">
                <span class="hero-label">NEWS MANAGEMENT</span>
                <h1 class="hero-title">创建新闻</h1>
            </div>
        </div>
        <!-- Form Card -->
        <div class="form-card">
            <div class="form-header">
                <span class="form-tag">NEW ARTICLE</span>
            </div>
            <div class="form-body">
                <div class="form-group">
                    <label class="form-label">新闻标题</label>
                    <input
                        v-model="newsForm.title"
                        type="text"
                        class="form-input"
                        placeholder="请输入新闻标题（5-100字）"
                    />
                    <span v-if="errors.title" class="form-error">{{ errors.title }}</span>
                </div>

                <div class="form-group">
                    <label class="form-label">新闻内容</label>
                    <div class="editor-wrap">
                        <editor @event="handleEditorEvent" />
                    </div>
                    <span v-if="errors.content" class="form-error">{{ errors.content }}</span>
                </div>

                <div class="form-row">
                    <div class="form-group form-group-half">
                        <label class="form-label">类别</label>
                        <div class="select-wrap">
                            <select v-model="newsForm.category" class="form-select">
                                <option :value="null" disabled>请选择类别</option>
                                <option :value="1">政策解读</option>
                                <option :value="2">行业动态</option>
                                <option :value="3">求职技巧</option>
                                <option :value="4">校园招聘</option>
                            </select>
                            <span class="select-arrow">&#9662;</span>
                        </div>
                        <span v-if="errors.category" class="form-error">{{ errors.category }}</span>
                    </div>
                    <div class="form-group form-group-half">
                        <label class="form-label">封面</label>
                        <Upload :avatar="newsForm.cover" @koleChange="handChange" />
                        <span v-if="errors.cover" class="form-error">{{ errors.cover }}</span>
                    </div>
                </div>

                <div class="form-actions">
                    <span v-if="statusMsg" class="status-msg">{{ statusMsg }}</span>
                    <button class="btn-draft" @click="submitDraft">保存草稿</button>
                    <button class="btn-publish" @click="submitPublish">发布新闻</button>
                </div>
            </div>
        </div>
        <AdminChatBot :context="`新闻标题: ${newsForm.title}\n新闻内容: ${newsForm.content}`" />
    </div>
</template>

<script setup>
import Upload from '@/components/upload/Upload.vue';
import upload from '@/util/upload.js';
import editor from '@/components/Editor/editor.vue';
import AdminChatBot from '@/components/AdminChatBot.vue';
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const statusMsg = ref('');
const newsForm = reactive({
    title: '',
    content: '',
    category: null,
    cover: '',
    file: null,
    isPublish: 0
});

const errors = reactive({
    title: '',
    content: '',
    category: '',
    cover: ''
});

const clearErrors = () => {
    errors.title = '';
    errors.content = '';
    errors.category = '';
    errors.cover = '';
};

const validate = () => {
    clearErrors();
    let valid = true;

    if (!newsForm.title || newsForm.title.length < 5) {
        errors.title = '标题长度至少 5 个字符';
        valid = false;
    }
    if (newsForm.title.length > 100) {
        errors.title = '标题长度不能超过 100 个字符';
        valid = false;
    }
    if (!newsForm.content || newsForm.content.length < 20) {
        errors.content = '内容长度至少 20 个字符';
        valid = false;
    }
    if (!newsForm.category) {
        errors.category = '请选择新闻分类';
        valid = false;
    }
    if (!newsForm.cover) {
        errors.cover = '请上传新闻封面';
        valid = false;
    }

    return valid;
};

const showStatus = (msg) => {
    statusMsg.value = msg;
    setTimeout(() => { statusMsg.value = ''; }, 3000);
};

const handleEditorEvent = (content) => {
    newsForm.content = content;
};

const handChange = (file) => {
    newsForm.cover = URL.createObjectURL(file);
    newsForm.file = file;
    errors.cover = '';
};

const submitDraft = async () => {
    newsForm.isPublish = 0;
    await submitForm();
};

const submitPublish = async () => {
    newsForm.isPublish = 1;
    await submitForm();
};

const submitForm = async () => {
    if (!validate()) return;
    try {
        await upload("/adminApi/news/add", newsForm);
        showStatus('[SAVED]');
        setTimeout(() => {
            router.push('/news-management/NewsList');
        }, 800);
    } catch (e) {
        showStatus('[ERROR] 提交失败');
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

.add-page {
    font-family: 'Space Grotesk', system-ui, sans-serif;
    color: $g5;
    background: $black;
    min-height: 100vh;
    padding: 32px 40px 64px;
}

/* ── Hero ── */
.page-hero {
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

/* ── Form Card ── */
.form-card {
    background: $surface-1;
    border: 1px solid $border;
    border-radius: 12px;
    overflow: hidden;
    max-width: 800px;
    margin: 0 auto;
}

.form-header {
    padding: 20px 28px;
    border-bottom: 1px solid $border;
}

.form-tag {
    font-family: 'Space Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.1em;
    color: $g3;
}

.form-body {
    padding: 28px;
}

.form-group {
    margin-bottom: 24px;
}

.form-row {
    display: flex;
    gap: 24px;
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
    margin-bottom: 10px;
}

.form-input {
    width: 100%;
    background: $surface-2;
    border: 1px solid $border-hi;
    border-radius: 8px;
    padding: 12px 16px;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 15px;
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
    padding: 12px 16px;
    padding-right: 40px;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 15px;
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
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 12px;
    color: $g3;
    pointer-events: none;
}

.editor-wrap {
    border: 1px solid $border-hi;
    border-radius: 8px;
    overflow: hidden;
}

.form-actions {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 12px;
    padding-top: 32px;
    border-top: 1px solid $border;
}

.status-msg {
    font-family: 'Space Mono', monospace;
    font-size: 12px;
    letter-spacing: 0.04em;
    color: $g4;
    margin-right: auto;
}

.btn-draft {
    font-family: 'Space Mono', monospace;
    font-size: 13px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 12px 24px;
    border-radius: 999px;
    border: 1px solid $border-hi;
    background: transparent;
    color: $g4;
    cursor: pointer;
    transition: all 150ms ease-out;

    &:hover {
        border-color: $g4;
        color: $g5;
    }
}

.btn-publish {
    font-family: 'Space Mono', monospace;
    font-size: 13px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 12px 24px;
    border-radius: 999px;
    border: 1px solid $pure;
    background: transparent;
    color: $pure;
    cursor: pointer;
    transition: all 150ms ease-out;

    &:hover {
        background: $pure;
        color: $black;
    }
}
</style>
