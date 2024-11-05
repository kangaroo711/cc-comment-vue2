<template>
  <view class="comment_item">
    <view class="top">
      <view class="top_left">
        <img class="user_avatar" :src="data.user_avatar" />
        <uni-tag v-if="data.author" class="tag" type="primary" :inverted="false" text="作者" size="mini" circle />
        <span class="user_name">{{ data.user_name }}</span>
        <span class="user_name">{{ cReplyName }}</span>
      </view>
      <view class="top_right" @click="likeClick(data)">
        <span :class="[data.is_like ? 'active' : '', 'like_count']">{{ cLikeCount }}</span>
        <uni-icons v-show="data.is_like" type="hand-up-filled" size="24" color="#007aff"></uni-icons>
        <uni-icons v-show="!data.is_like" type="hand-up" size="24" color="#999"></uni-icons>
      </view>
    </view>
    <view class="content" @click="replyClick(data)">
      {{ c_content }}
      <span class="shrink" v-if="isShrink" @click.stop="expandContentFun(data.user_content)">...展开</span>
      <span
        class="shrink"
        v-if="!isShrink && user_content.length > contentShowLength"
        @click.stop="shrinkContentFun(data.user_content)"
      >
        收起</span
      >
    </view>
    <view class="bottom">
      <span class="create_time">{{ data.create_time }}</span>
      <span v-if="data.owner" class="delete" @click="deleteClick(data)">删除</span>
      <!-- <span v-else class="reply" @click="replyClick(props.data)"
          >回复</span
        > -->
    </view>
  </view>
</template>

<script>
export default {
  props: {
    // 评论数据
    data: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      // 评论过长处理
      contentShowLength: 70, // 默认显示评论字符
      user_content: "",
      isShrink: false, // 是否收缩评论
      c_content: "",
    };
  },
  computed: {
    // 被回复人名称
    cReplyName: function () {
      return this.data?.reply_name ? ` ▸ ` + this.data?.reply_name : "";
    },
    // 点赞数显示
    cLikeCount: function () {
      return this.data.like_count === 0 ? "" : this.data.like_count > 99 ? `99+` : this.data.like_count;
    },
  },
  watch: {
    // 删除变更显示定制
    "data.user_content": function (newVal, oldVal) {
      if (newVal !== oldVal) {
        this.c_content = newVal;
      }
    },
    // 监听isShrink变化，更新c_content
    isShrink: function (newVal) {
      this.c_content = newVal ? this.user_content.slice(0, this.contentShowLength + 1) : this.user_content;
    },
  },
  methods: {
    // 展开文字
    expandContentFun() {
      this.isShrink = false;
    },
    // 收起文字
    shrinkContentFun() {
      this.isShrink = true;
    },
    // 点赞
    likeClick(item) {
      this.$emit("likeClick", item);
    },
    // 回复
    replyClick(item) {
      // 自己不能回复自己
      if (item.owner) return;
      this.$emit("replyClick", item);
    },
    // 删除
    deleteClick(item) {
      this.$emit("deleteClick", item);
    },
  },
  mounted() {
    this.user_content = this.data.user_content;
    this.isShrink = this.user_content.length > this.contentShowLength;
    this.c_content = this.isShrink ? this.user_content.slice(0, this.contentShowLength + 1) : this.user_content;
  },
};
</script>

<style lang="scss" scoped>
////////////////////
.center {
  display: flex;
  align-items: center;
}
.ellipsis {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
////////////////////
.comment_item {
  font-size: 28rpx;
  .top {
    @extend .center;
    justify-content: space-between;
    .top_left {
      display: flex;
      align-items: center;
      overflow: hidden;
      .user_avatar {
        width: 68rpx;
        height: 68rpx;
        border-radius: 50%;
        margin-right: 12rpx;
      }
      .tag {
        margin-right: 6rpx;
      }
      .user_name {
        @extend .ellipsis;
        max-width: 180rpx;
        color: #8c8c8c;
      }
    }
    .top_right {
      @extend .center;
      .like_count {
        color: #8c8c8c;
        &.active {
          color: #007aff;
        }
      }
    }
  }
  .content {
    padding: 10rpx;
    margin-left: 70rpx;
    color: #333;
    &:active {
      background-color: #f2f2f2;
    }
    .shrink {
      padding: 20rpx 20rpx 20rpx 0rpx;
      color: #007aff;
    }
  }
  .bottom {
    padding-left: 80rpx;
    font-size: 24rpx;
    .create_time {
      color: #8c8c8c;
    }
    .delete {
      padding: 20rpx 20rpx 0 20rpx;
      color: #c0c0c0;
    }
    .reply {
      color: #007aff;
    }
  }
}
</style>
