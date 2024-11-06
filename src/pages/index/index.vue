// 复制整页代码配合下载的插件, 可正常运作(提示: 注意uni-ui版本, 可能uni-ui不同版本的$变量不一致, 自行配置颜色即可)
<template>
  <view>
    <CComment
      ref="ccRef"
      :myInfo="myInfo"
      :userInfo="userInfo"
      :tableData="tableData"
      :tableTotal.sync="tableTotal"
      :deleteMode="deleteMode"
      @likeFun="likeFun"
      @replyFun="replyFun"
      @deleteFun="deleteFun"
    ></CComment>
    <view class="btn" @tap="openComment">发表新评论</view>
  </view>
</template>

<script>
import CComment from "@/components/cc-comment/cc-comment.vue";
export default {
  components: {
    CComment,
  },
  // ----模拟数据------模拟数据------模拟数据----
  data() {
    return {
      // 当前登录用户信息(提示: 一般来自localstorage, 如果是实时获取的话, 那么获取到数据后再v-if显示评论组件)
      myInfo: {
        user_id: 1, // 用户id
        user_name: "cc", // 用户名
        user_avatar: "https://img0.baidu.com/it/u=2836960144,3650263035&fm=253&fmt=auto&app=138&f=JPEG?w=474&h=474", // 用户头像
      },
      // 文章作者信息(提示: 一般来自localstorage, 如果是实时获取的话, 那么获取到数据后再v-if显示评论组件)
      userInfo: {
        user_id: 2, // 用户id
        user_name: "ikun", // 用户名
        user_avatar: "https://pic1.zhimg.com/80/v2-a79071a705f55c5d88f6c74e6111fe84_720w.webp", // 用户头像
      },
      deleteMode: "all", //删除模式
      // 评论总数
      tableTotal: 4,
      // 评论表
      tableData: [
        {
          id: 120, // 评论id
          parent_id: null, // 评论父级的id
          reply_id: null, // 被回复评论的id
          reply_name: null, // 被回复人的名称
          user_id: 2, // 评论者id
          user_name: "ikun", // 评论者用户名
          user_avatar: "https://pic1.zhimg.com/80/v2-a79071a705f55c5d88f6c74e6111fe84_720w.webp", // 评论者头像地址
          user_content: "唱,跳,rap,篮球", // 评论者评论内容
          is_like: false, // 评论者是否点赞
          like_count: 120, // 点赞数统计
          create_time: "2025-02-19 09:16", // 创建时间
        },
        {
          id: 130, // 评论id
          parent_id: 120, // 评论父级的id
          reply_id: 120, // 被回复评论的id
          reply_name: "ikun", // 被回复人的名称
          user_id: 3, // 评论者id
          user_name: "小黑子", // 评论者用户名
          user_avatar: "https://pic2.zhimg.com/80/v2-06eade66ec837713d765b1557bf20b25_720w.webp", // 评论者头像地址
          user_content: "姬霓太美~祝自己生日快乐~~", // 评论者评论内容
          is_like: false, // 评论者是否点赞
          like_count: 67, // 点赞数统计
          create_time: "2025-03-07 00:06", // 创建时间
        },
        {
          id: 140, // 评论id
          parent_id: 120, // 评论父级的id
          reply_id: 130, // 被回复评论的id
          reply_name: "小黑子", // 被回复人的名称
          user_id: 4, // 评论者id
          user_name: "守护宗主维护宗门", // 评论者用户名
          user_avatar: "https://pic3.zhimg.com/80/v2-244696a62fa750b8570cf56bfaa5b26a_720w.webp", // 评论者头像地址
          user_content: "你露出鸡脚了", // 评论者评论内容
          is_like: false, // 评论者是否点赞
          like_count: 16, // 点赞数统计
          create_time: "2025-05-10 17:08", // 创建时间
        },
        {
          id: 150, // 评论id
          parent_id: null, // 评论父级的id
          reply_id: null, // 被回复评论的id
          reply_name: null, // 被回复人的名称
          user_id: 5, // 评论者id
          user_name: "音乐制作人", // 评论者用户名
          user_avatar: "https://pic2.zhimg.com/80/v2-88ec6f8c6d3305122664dd18a28730e5_720w.webp", // 评论者头像地址
          user_content:
            "只因你太美baby 只因你太美baby 只因你实在是太美baby 只因你太美baby 迎面走来的你让我如此蠢蠢欲动 这种感觉我从未有 Cause I got a crush on you who you 你是我的 我是你的 谁 再多一眼看一眼就会爆炸 再近一点靠近点快被融化", // 评论者评论内容
          is_like: true, // 评论者是否点赞
          like_count: 8, // 点赞数统计
          create_time: "2025-12-21 00:45", // 创建时间
        },
      ],
    };
  },
  created() {},
  mounted() {},
  methods: {
    // 唤起新评论弹框
    openComment() {
      let ccRef = this.$refs["ccRef"];
      ccRef.newCommentFun();
    },
    // 点赞回调事件
    likeFun({ params }, callback) {
      console.log("likeFun", params);
      // 当请求失败, 调用callback重置点赞效果;
      // Demo如下:
      // axios.post("http://xxx/like", { id: params }).then((res) => {
      //   if (res.code !== 0) {
      //     callback(res);
      //   }
      // });
    },
    // 评论回调事件
    replyFun({ params }, callback) {
      console.log("replyFun", params);
      // 当请求成功, 调用callback执行评论插入;
      // Demo如下:
      // axios.post("http://xxx/reply", { ...params }).then((res) => {
      //   if (res.code === 0) {
      //     callback(res);
      //   }
      // });
      const res = { id: Math.random() }; // 很重要的回参! 必须拿到后端返回评论id! 删除需要!
      setTimeout(() => callback(res), 500); // 目前为了展示效果, 直接执行callback
    },
    /** 删除回调事件
     * mode 删除模式
     * -- bind: 当被删除的一级评论存在回复评论, 那么该评论内容变更显示为[当前评论内容已被移除]
     * -- only: 仅删除当前评论(后端删除相关联的回复评论, 否则总数显示不对)
     * -- all : 删除所有评论包括回复评论 前端遍历子评论上报
     */

    deleteFun({ params, mode }, callback) {
      console.log("deleteFun", { params, mode });
      // 当请求成功, 调用callback执行评论删除;
      // Demo如下:
      // axios.post("http://xxx/delete", { ids: params, mode }).then((res) => {
      //   if (res.code === 0) {
      //     callback(res);
      //   }
      // });
      switch (mode) {
        case "bind":
          // 逻辑: 调用接口进行评论内容修改 update
          setTimeout(() => callback(), 500); // 目前为了展示效果, 直接执行callback
          break;
        case "only":
          // 逻辑: 调用接口删除一个评论 delete
          setTimeout(() => callback(), 500); // 目前为了展示效果, 直接执行callback
          break;
        default:
          // all
          // 逻辑: 调用接口删除多个评论 [delete]
          setTimeout(() => callback(), 500); // 目前为了展示效果, 直接执行callback
          break;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.btn {
  text-align: center;
  color: #fff;
  padding: 20rpx;
  margin: 50rpx;
  border-radius: 20rpx;
  background-color: #2979ff;
}
</style>
