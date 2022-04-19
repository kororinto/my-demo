import Vue from "vue";
import message from "./index.vue";
let MessageConstructor = Vue.extend(message);

let instance;

const Message = function(options) {
  // 调用this.$message时传递进来的参数
  options = options || {};
  // 如果参数是个string，直接赋值给message
  if (typeof options === "string") {
    options = {
      message: options,
    };
  }
  // 构造message实例
  instance = new MessageConstructor({
    data: options,
  });
  instance.$mount();
  // 将dom添加到网页上
  document.body.appendChild(instance.$el);

  instance.visible = true;

  return instance;
};
const status = ["success", "warning", "info", "error"];
status.forEach((type) => {
  Message[type] = (options) => {
    if (typeof options === "string") {
      options = {
        message: options,
      };
    }
    options.type = type;
    return Message(options);
  };
});
Object.assign(Message, status.reduce((prev, type) => {
  prev[type] = (options) => {
    if (typeof options === "string") {
      options = {
        message: options,
      };
    }
    options.type = type
    return prev(options)
  }
}, {}))
export default Message;
