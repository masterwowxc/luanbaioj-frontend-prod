import router from "@/router";
import store from "@/store";
import { ACCESS_ENUM } from "@/access/accessEnum";
import { checkAccess } from "@/access/checkAccess";

router.beforeEach(async (to, from, next) => {
  console.log("登录用户信息", store.state.user.loginUser);
  let loginUser = store.state.user.loginUser;
  console.log(loginUser.userRole);
  if (!loginUser || !loginUser.userRole) {
    await store.dispatch("getLoginUser");
    loginUser = store.state.user.loginUser;
  }

  const needAccess = (to.meta?.access ?? ACCESS_ENUM.NOT_LOGIN) as string;
  if (needAccess !== ACCESS_ENUM.NOT_LOGIN) {
    // 未登录
    if (!loginUser || !loginUser.userRole) {
      next(`/user/login?redirect=${to.fullPath}`);
      return;
    }
    // 已登录，权限不足
    if (!checkAccess(loginUser, needAccess)) {
      next("/noAuth");
    }
  }
  next();
});
