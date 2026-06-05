<template>
    <div class="notfound-page">
        <div class="dot-grid-bg"></div>
        <div class="notfound-content">
            <span class="notfound-label">ERROR 404</span>
            <h1 class="notfound-hero">NOT FOUND</h1>
            <p class="notfound-desc">页面不存在或已被移除</p>
            <router-link to="/" class="notfound-link">BACK TO HOME</router-link>
        </div>
    </div>
</template>

<style scoped lang="scss">
.notfound-page {
    width: 100%;
    height: 100%;
    min-height: 60vh;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
}

.dot-grid-bg {
    position: absolute;
    inset: 0;
    background-image: radial-gradient(circle, #E4E7EB 0.8px, transparent 0.8px);
    background-size: 24px 24px;
    opacity: 0.3;
}

.notfound-content {
    position: relative;
    text-align: center;
    padding: 64px 40px;
}

.notfound-label {
    font-family: 'Space Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.1em;
    color: #2563EB;
    display: block;
    margin-bottom: 16px;
}

.notfound-hero {
    font-family: 'Doto', 'Space Mono', monospace;
    font-size: 72px;
    font-weight: 700;
    color: #101828;
    letter-spacing: -0.03em;
    line-height: 1;
    margin: 0 0 16px 0;
}

.notfound-desc {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 16px;
    color: #667085;
    margin: 0 0 40px 0;
}

.notfound-link {
    font-family: 'Space Mono', monospace;
    font-size: 13px;
    letter-spacing: 0.06em;
    padding: 12px 28px;
    border: 1px solid #D0D5DD;
    border-radius: 999px;
    color: #667085;
    text-decoration: none;
    transition: all 200ms ease-out;

    &:hover {
        border-color: #101828;
        color: #101828;
    }
}
</style>
