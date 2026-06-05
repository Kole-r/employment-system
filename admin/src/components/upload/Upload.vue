<template>
    <div class="upload-zone" @click="triggerUpload">
        <img v-if="props.avatar" :src="uploadAvatar" class="upload-preview" />
        <div v-else class="upload-placeholder">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span class="upload-label">UPLOAD</span>
        </div>
        <el-upload
            ref="uploadRef"
            class="upload-hidden"
            action=""
            :show-file-list="false"
            :auto-upload="false"
            :on-change="handChange"
        >
            <span></span>
        </el-upload>
    </div>
</template>

<script setup>
import { defineEmits, defineProps, computed, ref } from 'vue';

const props = defineProps({
    avatar: String
});

const emit = defineEmits(["koleChange"]);
const uploadRef = ref(null);
const uploadAvatar = computed(() => props.avatar);

const triggerUpload = () => {
    uploadRef.value?.$el?.querySelector('input')?.click();
};

const handChange = (file) => {
    emit("koleChange", file.raw);
};
</script>

<style scoped lang="scss">
.upload-zone {
    width: 120px;
    height: 120px;
    border: 1px dashed #D0D5DD;
    border-radius: 8px;
    cursor: pointer;
    overflow: hidden;
    transition: border-color 200ms ease-out;
    position: relative;

    &:hover {
        border-color: #98A2B3;
    }
}

.upload-preview {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

.upload-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: #98A2B3;
    transition: color 200ms ease-out;

    .upload-zone:hover & {
        color: #667085;
    }
}

.upload-label {
    font-family: 'Space Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.1em;
}

.upload-hidden {
    position: absolute;
    opacity: 0;
    pointer-events: none;
}
</style>
