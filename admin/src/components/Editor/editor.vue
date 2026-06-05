<template>
    <div class="nd-editor">
        <Toolbar
            class="nd-editor-toolbar"
            :editor="editorRef"
            :defaultConfig="toolbarConfig"
            :mode="mode"
        />
        <Editor
            class="nd-editor-body"
            v-model="valueHtml"
            :defaultConfig="editorConfig"
            :mode="mode"
            @onCreated="handleCreated"
        />
    </div>
</template>

<script setup>
import '@wangeditor/editor/dist/css/style.css'

import { onBeforeUnmount, ref, shallowRef, onMounted, defineEmits, watch } from 'vue'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
const emit = defineEmits(['event'])

const editorRef = shallowRef()
const valueHtml = ref('<p></p>')

onMounted(() => {
    setTimeout(() => {
        valueHtml.value = '<p></p>'
        emit('event', valueHtml.value)
    }, 500)
})

watch(valueHtml, (newValue) => {
    emit('event', newValue)
})

const toolbarConfig = {}
const editorConfig = { placeholder: '请输入内容...' }

onBeforeUnmount(() => {
    const editor = editorRef.value
    if (editor == null) return
    editor.destroy()
})

const handleCreated = (editor) => {
    editorRef.value = editor
}
const mode = ref('default')
</script>

<style lang="scss">
/* ── WangEditor Light Override ── */

.nd-editor {
    border: 1px solid #D0D5DD;
    border-radius: 8px;
    overflow: hidden;
}

/* ── Toolbar ── */
.nd-editor-toolbar {
    border-bottom: 1px solid #E4E7EB !important;
    background: #FFFFFF !important;

    .w-e-bar {
        background: #FFFFFF !important;
        border: none !important;
        color: #667085 !important;
        padding: 4px 8px !important;
    }

    .w-e-bar-divider {
        background: #E4E7EB !important;
    }

    .w-e-bar-item {
        .btn-text {
            color: #667085 !important;
            fill: #667085 !important;
        }

        &:hover {
            .btn-text {
                color: #344054 !important;
                fill: #344054 !important;
            }
        }

        button {
            background: transparent !important;
            color: #667085 !important;

            &:hover {
                background: #F2F4F7 !important;
                color: #344054 !important;
            }
        }

        svg {
            fill: #667085 !important;
            color: #667085 !important;
        }

        &:hover svg {
            fill: #344054 !important;
            color: #344054 !important;
        }
    }

    .w-e-bar-item-active {
        background: #F2F4F7 !important;

        .btn-text,
        svg {
            color: #101828 !important;
            fill: #101828 !important;
        }
    }

    /* Dropdown menus in toolbar */
    .w-e-drop-panel {
        background: #F2F4F7 !important;
        border: 1px solid #D0D5DD !important;
        border-radius: 8px !important;
        box-shadow: none !important;

        .w-e-drop-panel-item {
            color: #667085 !important;

            &:hover {
                background: #E4E7EB !important;
                color: #344054 !important;
            }
        }
    }

    /* Select / combobox */
    .w-e-select-list {
        background: #F2F4F7 !important;
        border: 1px solid #D0D5DD !important;
        border-radius: 8px !important;

        .w-e-select-item {
            color: #667085 !important;

            &:hover {
                background: #E4E7EB !important;
                color: #344054 !important;
            }
        }
    }
}

/* ── Editor Body ── */
.nd-editor-body {
    background: #FFFFFF !important;
    min-height: 400px;

    .w-e-text-container {
        background: #FFFFFF !important;
        color: #344054 !important;

        * {
            color: #344054 !important;
        }

        [data-slate-editor] {
            padding: 20px 24px !important;
            min-height: 400px !important;
        }

        /* Placeholder */
        .w-e-placeholder {
            color: #98A2B3 !important;
            font-style: normal !important;
            padding-left: 24px !important;
        }

        /* Selection */
        ::selection {
            background: rgba(37, 99, 235, 0.15) !important;
        }

        /* Links */
        a {
            color: #2563EB !important;
        }

        /* Code blocks */
        pre {
            background: #FFFFFF !important;
            border: 1px solid #E4E7EB !important;
            border-radius: 4px !important;
            padding: 12px 16px !important;

            code {
                color: #344054 !important;
                background: transparent !important;
            }
        }

        code {
            background: #F2F4F7 !important;
            color: #344054 !important;
            padding: 2px 6px !important;
            border-radius: 4px !important;
        }

        /* Blockquote */
        blockquote {
            border-left: 3px solid #D0D5DD !important;
            color: #667085 !important;
            padding-left: 16px !important;
        }

        /* Table */
        table {
            border: 1px solid #D0D5DD !important;

            th {
                background: #FFFFFF !important;
                border: 1px solid #D0D5DD !important;
                color: #344054 !important;
            }

            td {
                border: 1px solid #E4E7EB !important;
                color: #344054 !important;
            }
        }

        /* Images */
        img {
            border: 1px solid #D0D5DD !important;
            border-radius: 4px !important;
        }

        /* HR */
        hr {
            border: none !important;
            border-top: 1px solid #E4E7EB !important;
        }

        /* Lists */
        ul, ol {
            padding-left: 24px !important;
        }
    }

    /* Scrollbar */
    .w-e-scroll {
        scrollbar-width: thin;
        scrollbar-color: #D0D5DD transparent;

        &::-webkit-scrollbar {
            width: 4px;
        }

        &::-webkit-scrollbar-track {
            background: transparent;
        }

        &::-webkit-scrollbar-thumb {
            background: #D0D5DD;
            border-radius: 2px;
        }
    }
}

/* ── Modal / Dialog overrides (image, link, video) ── */
.w-e-modal {
    background: #FFFFFF !important;
    border: 1px solid #D0D5DD !important;
    border-radius: 12px !important;
    box-shadow: none !important;

    .w-e-modal-header {
        color: #344054 !important;
        border-bottom: 1px solid #E4E7EB !important;
    }

    input, textarea {
        background: #FFFFFF !important;
        border: 1px solid #D0D5DD !important;
        border-radius: 6px !important;
        color: #344054 !important;
        padding: 8px 12px !important;

        &:focus {
            border-color: #98A2B3 !important;
            outline: none !important;
        }

        &::placeholder {
            color: #98A2B3 !important;
        }
    }

    button {
        background: transparent !important;
        border: 1px solid #D0D5DD !important;
        color: #344054 !important;
        border-radius: 999px !important;
        padding: 6px 16px !important;

        &:hover {
            border-color: #344054 !important;
        }
    }
}

/* ── Tooltip ── */
.w-e-tooltip {
    background: #F2F4F7 !important;
    border: 1px solid #D0D5DD !important;
    border-radius: 6px !important;
    box-shadow: none !important;

    .w-e-tooltip-item-wrapper {
        color: #344054 !important;
    }
}

/* ── Fullscreen ── */
.w-e-full-screen-container {
    background: #F7F8FA !important;
    z-index: 9999 !important;
}
</style>
