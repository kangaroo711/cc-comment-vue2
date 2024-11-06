<template>
  <view>
    <view class="c_total">评论 {{ tableTotal }}</view>
    <template v-if="dataList && dataList.length">
      <view class="c_comment" v-for="(item1, index1) in dataList" :key="item1.id">
        <!-- 一级评论 -->
        <CommonComp
          :data="item1"
          @likeClick="() => likeClick({ item1, index1 })"
          @replyClick="() => replyClick({ item1, index1 })"
          @deleteClick="() => deleteClick({ item1, index1 })"
        />
        <view class="children_item" v-if="item1.children && item1.children.length">
          <!-- 二级评论 -->
          <CommonComp
            v-for="(item2, index2) in item1.childrenShow"
            :key="item2.id"
            :data="item2"
            :pData="item1"
            @likeClick="() => likeClick({ item1, index1, item2, index2 })"
            @replyClick="() => replyClick({ item1, index1, item2, index2 })"
            @deleteClick="() => deleteClick({ item1, index1, item2, index2 })"
          />
          <!-- 展开二级评论 -->
          <view
            class="expand_reply"
            v-if="expandTxtShow({ item1, index1 })"
            @tap="() => expandReplyFun({ item1, index1 })"
          >
            <span class="txt"> 展开{{ item1.children.length - item1.childrenShow.length }}条回复 </span>
            <uni-icons type="down" size="24" color="#007aff"></uni-icons>
          </view>
          <!-- 折叠二级评论 -->
          <view
            class="shrink_reply"
            v-if="shrinkTxtShow({ item1, index1 })"
            @tap="() => shrinkReplyFun({ item1, index1 })"
          >
            <span class="txt"> 收起回复内容 </span>
            <uni-icons type="up" size="24" color="#007aff"></uni-icons>
          </view>
        </view>
      </view>
    </template>
    <!-- 空盒子 -->
    <view class="empty_box" v-else>
      <uni-icons type="chatboxes" size="36" color="#c0c0c0"></uni-icons>
      <view>
        <span class="txt"> 这里是一片荒草地, </span>
        <span class="txt click" @click="() => newCommentFun()">说点什么...</span>
      </view>
    </view>
    <!-- 评论弹窗 -->
    <uni-popup ref="cPopupRef" type="bottom" @change="popChange">
      <view class="c_popup_box">
        <view class="reply_text">
          <template v-if="Object.keys(replyTemp).length">
            <span class="text_aid">回复给</span>
            <img
              class="user_avatar"
              :src="replyTemp.item2 ? replyTemp.item2.user_avatar : replyTemp.item1.user_avatar"
            />
            <span class="text_main">{{ replyTemp.item2 ? replyTemp.item2.user_name : replyTemp.item1.user_name }}</span>
          </template>
          <span v-else class="text_main">发表新评论</span>
        </view>
        <view class="content">
          <view class="text_area">
            <uni-easyinput
              class="text_area"
              type="textarea"
              v-model="commentValue"
              :placeholder="commentPlaceholder"
              :focus="focus"
              trim
              autoHeight
              maxlength="300"
            ></uni-easyinput>
          </view>
          <view class="send_btn" @tap="() => sendClick()">发送</view>
        </view>
      </view>
    </uni-popup>
    <!-- 删除弹窗 -->
    <uni-popup ref="delPopupRef" type="dialog">
      <uni-popup-dialog
        mode="base"
        title=""
        content="确定删除这条评论吗?"
        :before-close="true"
        @close="delCloseFun"
        @confirm="delConfirmFun"
      ></uni-popup-dialog>
    </uni-popup>
  </view>
</template>

<script>
import CommonComp from "./componets/common";
export default {
  components: { CommonComp },
  props: {
    /** 登陆用户信息
     *    id: number // 登陆用户id
     *    user_name: number // 登陆用户名
     *    user_avatar: string // 登陆用户头像地址
     */
    myInfo: {
      type: Object,
      default: () => {},
    },
    /** 文章作者信息
     *    id: number // 文章作者id
     *    user_name: number // 文章作者名
     *    user_avatar: string // 文章作者头像地址
     */
    userInfo: {
      type: Object,
      default: () => {},
    },
    /** 评论列表
     *    id: number // 评论id
     *    parent_id: number // 父级评论id
     *    reply_id: number // 被回复人评论id
     *    reply_name: string // 被回复人名称
     *    user_name: string // 用户名
     *    user_avatar: string // 评论者头像地址
     *    user_content: string // 评论内容
     *    is_like: boolean // 是否点赞
     *    like_count: number // 点赞数统计
     *    create_time: string // 创建时间
     */
    tableData: {
      type: Array,
      default: () => [],
    },
    // 评论总数
    tableTotal: {
      type: Number,
      default: 0,
    },
    // 评论删除模式
    // bind - 当被删除的一级评论存在回复评论, 那么该评论内容变更显示为[当前评论内容已被移除]
    // only - 仅删除当前评论(后端删除相关联的回复评论, 否则总数显示不对)
    // all - 删除所有评论包括回复评论
    deleteMode: {
      type: String,
      default: "all",
    },
  },
  data() {
    return {
      dataList: [], // 渲染数据(前端的格式)
      replyTemp: {}, // 回复临时数据
      isNewComment: false, // 是否为新评论
      focus: false, // 评论弹窗
      commentValue: "", // 输入框值
      commentPlaceholder: "说点什么...", // 输入框占位符
      delTemp: {}, // 删除临时数据
    };
  },
  watch: {
    tableData: {
      handler(newVal) {
        if (newVal.length !== this.dataList.length) {
          this.dataList = this.treeTransForm(newVal);
        }
      },
      deep: true,
      immediate: true,
    },
  },
  mounted() {},
  methods: {
    // 数据转换
    treeTransForm(data) {
      let newData = JSON.parse(JSON.stringify(data));
      let result = [];
      let map = {};
      newData.forEach((item, i) => {
        item.owner = item.user_id === this.myInfo.user_id; // 是否为当前登陆用户 可以对自己的评论进行删除 不能回复
        item.author = item.user_id === this.userInfo.user_id; // 是否为作者 显示标记
        map[item.id] = item;
      });
      newData.forEach((item) => {
        let parent = map[item.parent_id];
        if (parent) {
          (parent.children || (parent.children = [])).push(item); // 所有回复
          if (parent.children.length === 1) {
            (parent.childrenShow = []).push(item); // 显示的回复
          }
        } else {
          result.push(item);
        }
      });
      return result;
    },
    // 点赞
    setLike(item) {
      item.is_like = !item.is_like;
      item.like_count = item.is_like ? item.like_count + 1 : item.like_count - 1;
    },
    likeClick({ item1, index1, item2, index2 }) {
      let item = item2 || item1;
      this.setLike(item);
      this.$emit("likeFun", { params: item }, (res) => {
        // 请求后端失败, 重置点赞
        setLike(item);
      });
    },
    // 回复
    replyClick({ item1, index1, item2, index2 }) {
      this.replyTemp = JSON.parse(JSON.stringify({ item1, index1, item2, index2 }));
      this.$refs["cPopupRef"].open();
    },
    // 发起新评论
    newCommentFun() {
      this.isNewComment = true;
      this.$refs["cPopupRef"].open();
    },
    // 评论弹窗
    popChange(e) {
      // 关闭弹窗
      if (!e.show) {
        this.commentValue = ""; // 清空输入框值
        this.replyTemp = {}; // 清空被回复人信息
        this.isNewComment = false; // 恢复是否为新评论默认值
      }
      this.focus = e.show;
    },
    // 发送评论
    sendClick({ item1, index1, item2, index2 } = this.replyTemp) {
      let item = item2 || item1;
      let params = {};
      // 新评论
      if (this.isNewComment) {
        params = {
          id: Math.random(), // 评论id
          parent_id: null, // 父级评论id
          reply_id: null, // 被回复评论id
          reply_name: null, // 被回复人名称
        };
      } else {
        // 回复评论
        params = {
          id: Math.random(), // 评论id
          parent_id: item?.parent_id ?? item.id, // 父级评论id
          reply_id: item.id, // 被回复评论id
          reply_name: item.user_name, // 被回复人名称
        };
      }
      params = {
        ...params,
        user_id: this.myInfo.user_id, // 当前登陆账号用户名
        user_name: this.myInfo.user_name, // 当前登陆账号用户名
        user_avatar: this.myInfo.user_avatar, //  当前登陆账号用户头像地址
        user_content: this.commentValue, //  用户评论内容
        is_like: false, // 是否点赞
        like_count: 0, // 点赞数统计
        create_time: "刚刚", // 创建时间
        owner: true, // 是否为所有者 所有者可以进行删除 管理员默认true
      };

      uni.showLoading({
        title: "正在发送",
        mask: true,
      });
      this.$emit("replyFun", { params }, (res) => {
        uni.hideLoading();
        // 拿到后端返回的id赋值, 因为删除要用到id
        params = { ...params, id: res.id };
        // 新评论
        if (this.isNewComment) {
          this.dataList.push(params);
        } else {
          // 回复
          let c_data = this.dataList[index1];
          (c_data.children || (c_data.children = [])).push(params);
          // 如果已展开所有回复, 那么此时插入children长度会大于childrenShow长度1, 所以就直接展开显示即可
          if (c_data.children.length === (c_data.childrenShow || (c_data.childrenShow = [])).length + 1) {
            c_data.childrenShow.push(params);
          }
        }
        this.$emit("update:tableTotal", this.tableTotal + 1);
        this.$refs["cPopupRef"].close();
      });
    },
    //删除
    deleteClick({ item1, index1, item2, index2 }) {
      this.delTemp = JSON.parse(JSON.stringify({ item1, index1, item2, index2 }));
      this.$refs["delPopupRef"].open();
    },
    // 关闭删除弹窗
    delCloseFun() {
      this.delTemp = {};
      this.$refs["delPopupRef"].close();
    },
    // 确定删除
    delConfirmFun({ item1, index1, item2, index2 } = this.delTemp) {
      const deleteMode = this.deleteMode;
      let c_data = this.dataList[index1];
      uni.showLoading({
        title: "正在删除",
        mask: true,
      });
      // 删除二级评论
      if (index2 >= 0) {
        this.$emit("deleteFun", { params: [c_data.children[index2].id], mode: deleteMode }, (res) => {
          uni.hideLoading();
          this.$emit("update:tableTotal", this.tableTotal - 1);
          c_data.children.splice(index2, 1);
          c_data.childrenShow.splice(index2, 1);
        });
      } else {
        // 删除一级评论
        if (c_data?.children?.length) {
          // 如果一级评论包含回复评论
          switch (deleteMode) {
            case "bind":
              // 一级评论内容展示修改为: 当前评论内容已被移除
              c_data.user_content = "当前评论内容已被移除";
              break;
            case "only":
              // 后端自行根据删除的一级评论id, 查找关联的子评论进行删除
              this.$emit(
                "deleteFun",
                {
                  params: [c_data.id],
                  mode: deleteMode,
                },
                (res) => {
                  uni.hideLoading();
                  this.$emit("update:tableTotal", this.tableTotal - c_data.children.length + 1);
                  this.dataList.splice(index1, 1);
                }
              );
              break;
            default:
              // all
              // 收集子评论id, 提交给后端统一删除
              let delIdArr = [c_data.id];
              c_data.children.forEach((_, i) => {
                delIdArr.push(_.id);
              });
              this.$emit("deleteFun", { params: delIdArr, mode: deleteMode }, (res) => {
                uni.hideLoading();
                this.$emit("update:tableTotal", this.tableTotal - c_data.children.length + 1);
                this.dataList.splice(index1, 1);
              });
              break;
          }
        } else {
          // 一级评论无回复, 直接删除
          this.$emit("deleteFun", { params: [c_data.id], mode: deleteMode }, (res) => {
            uni.hideLoading();
            this.$emit("update:tableTotal", this.tableTotal - 1);
            this.dataList.splice(index1, 1);
          });
        }
      }
      this.delCloseFun();
    },
    // 展开评论if
    expandTxtShow({ item1, index1 }) {
      return item1.childrenShow?.length && item1.children.length - item1.childrenShow.length;
    },
    // 展开更多评论
    expandReplyFun({ item1, index1 }) {
      let csLen = this.dataList[index1].childrenShow.length;
      this.dataList[index1].childrenShow.push(
        ...this.dataList[index1].children.slice(csLen, csLen + 6) // 截取5条评论
      );
    },

    // 收起评论if
    shrinkTxtShow({ item1, index1 }) {
      return item1.childrenShow?.length >= 2 && item1.children.length - item1.childrenShow.length === 0;
    },
    // 收起更多评论
    shrinkReplyFun({ item1, index1 }) {
      this.dataList[index1].childrenShow = [];
      this.dataList[index1].childrenShow.push(
        ...this.dataList[index1].children.slice(0, 1) // 截取1条评论
      );
    },
  },
};
</script>

<style lang="scss" scoped>
////////////////////////
.center {
  display: flex;
  align-items: center;
}
////////////////////////
.c_total {
  padding: 20rpx 30rpx 0 30rpx;
  font-size: 28rpx;
}
.empty_box {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  padding: 150rpx 10rpx;
  font-size: 28rpx;
  .txt {
    color: $uni-text-color-disable;
  }
  .click {
    color: $uni-color-primary;
  }
}
.c_comment {
  padding: 20rpx 30rpx;
  font-size: 28rpx;

  .children_item {
    padding: 20rpx 30rpx;
    margin-top: 10rpx;
    margin-left: 80rpx;
    background-color: $uni-bg-color-grey;
    .expand_reply,
    .shrink_reply {
      margin-top: 10rpx;
      margin-left: 80rpx;
      .txt {
        font-weight: 600;
        color: $uni-color-primary;
      }
    }
  }
}
.c_popup_box {
  background-color: #fff;
  .reply_text {
    @extend .center;
    padding: 20rpx 20rpx 0 20rpx;
    font-size: 26rpx;
    .text_aid {
      color: $uni-text-color-grey;
      margin-right: 5rpx;
    }
    .user_avatar {
      width: 48rpx;
      height: 48rpx;
      border-radius: 50%;
      margin-right: 6rpx;
      margin-left: 12rpx;
    }
    .text_main {
    }
  }
  .content {
    @extend .center;
    .text_area {
      flex: 1;
      padding: 20rpx;
    }
    .send_btn {
      @extend .center;
      justify-content: center;
      width: 120rpx;
      height: 60rpx;
      border-radius: 20rpx;
      font-size: 28rpx;
      color: #fff;
      background-color: $uni-color-primary;
      margin-right: 20rpx;
      margin-left: 5rpx;
    }
  }
}
</style>
