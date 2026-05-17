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
        <input
            ref="inputRef"
            type="file"
            accept="image/*"
            class="upload-hidden"
            @change="handleChange"
        />
    </div>
</template>

<script setup>
import { defineEmits, defineProps, computed, ref } from 'vue'

const props = defineProps({
    avatar: String
})

const emit = defineEmits(['koleChange'])
const inputRef = ref(null)
const uploadAvatar = computed(() => props.avatar)

const triggerUpload = () => {
    inputRef.value?.click()
}

const handleChange = (e) => {
    const file = e.target.files[0]
    if (file) {
        emit('koleChange', file)
    }
}
</script>

<style scoped lang="scss">
.upload-zone {
    width: 120px;
    height: 120px;
    border: 1px dashed var(--border-visible);
    border-radius: 8px;
    cursor: pointer;
    overflow: hidden;
    transition: border-color 200ms ease-out;
    position: relative;

    &:hover {
        border-color: var(--text-disabled);
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
    color: var(--text-disabled);
    transition: color 200ms ease-out;

    .upload-zone:hover & {
        color: var(--text-secondary);
    }
}

.upload-label {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.1em;
}

.upload-hidden {
    position: absolute;
    opacity: 0;
    pointer-events: none;
}
</style>
