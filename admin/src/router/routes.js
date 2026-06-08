import MainPage from '@/views/main/index.vue'
import dashboard from '@/views/dashboard/routes'
import auth from '@/views/auth/routes'
import ChangePasswordPage from "@/views/auth/changePassword.vue"
import PageNotFound from "@/components/ErrorPage/PageNotFound.vue"
import adminUser from '@/views/admin-user/routes'
import menu from '@/views/menu/routes'
import role from '@/views/role/routes'
import permission from '@/views/permission/routes'
import rechargePackage from '@/views/recharge-package/routes'
import userManage from '@/views/user-manage/routes'
import imageRecord from '@/views/image-record/routes'
import pointLog from '@/views/point-log/routes'
import signinConfig from '@/views/signin-config/routes'
import signinRecord from '@/views/signin-record/routes'
import rechargeOrder from '@/views/recharge-order/routes'
import banner from '@/views/banner/routes'
import category from '@/views/category/routes'
import product from '@/views/product/routes'

export default [
  {
    name: 'main',
    path: '/',
    meta: {
      title: 'home'
    },
    redirect: {
      name: 'dashboard',
    },
    component: MainPage,
    children: [
      ...dashboard,
      {
        name: 'changePasswordPage',
        path: '/change-password',
        meta: {
          title: "changePassword"
        },
        component: ChangePasswordPage,
      },
      ...adminUser,
      ...menu,
      ...permission,
      ...role,
      ...rechargePackage,
      ...userManage,
      ...imageRecord,
      ...pointLog,
      ...signinConfig,
      ...signinRecord,
      ...rechargeOrder,
      ...banner,
      ...category,
      ...product,
    ]
  },
  ...auth,
  {
    path: "/:pathMatch(.*)*", component: PageNotFound, name: 'notFound'
  }
]