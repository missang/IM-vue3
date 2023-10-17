<script setup>
</script>
<template>
    <div class="app_contanier">
        <div class="welcome_box">
            <!-- <img class="tang" :src="tang" /> -->
            <h1 class="welcome_box_title">welcome IM</h1>
            <p class="welcome_box_text">
            </p>
        </div>
        <img class="maskGroup" src="/@/assets/chat_r.png" />
        <!-- <img class="maskGroup" :src="maskGroup" /> -->
        <!-- <div>welcome IM</div> -->
    </div>
</template>

<style type="scss" scoped>
.app_contanier {
    position: absolute;
    right: 0;
    bottom: 0;
    z-index: -1;
    width: 100%;
    height: 100%;
    /* background: url('../../assets/images/Mask_group.png') no-repeat; */
    background-size: 100% 100%;
    border-radius: 0 5px 5px 0;
    overflow: hidden;
}

.welcome_box {
    position: relative;
    margin-top: 140px;
    margin-left: 100px;
    width: 637px;
    height: 400px;
}

.tang {
    position: absolute;
    left: -30px;
    top: 0;
    width: 32px;
    height: 32px;
}

.welcome_box_title {
    font-family: 'PingFang SC';
    font-style: normal;
    font-weight: 500;
    font-size: 24px;
    line-height: 34px;
    letter-spacing: 1px;
    color: #333333;
}

.welcome_box_text {
    margin-top: 12px;
    font-family: 'PingFang SC';
    font-style: normal;
    font-weight: 300;
    font-size: 16px;
    line-height: 22px;
    letter-spacing: 1.5px;
    color: #A3A3A3;
}

.maskGroup {
    position: absolute;
    right: 0;
    bottom: 0;
}
</style>