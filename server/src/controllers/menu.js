const { success } = require('../middleware/response');

// 内存菜单数据（后续可替换为数据库）
const menus = [
  {
    id: 1,
    parent_id: 0,
    icon: "Orange",
    uri: "/dashboard",
    is_link: 0,
    permission_name: null,
    name: "Dashboard",
    guard_name: "admin",
    sequence: 0,
    created_at: null,
    updated_at: "2021-07-04T23:13:57.000000Z"
  },
  {
    id: 10,
    parent_id: 0,
    icon: "Goods",
    uri: "/business",
    is_link: 0,
    permission_name: null,
    name: "业务管理",
    guard_name: "admin",
    sequence: 1,
    created_at: null,
    updated_at: "2026-06-05T00:00:00.000000Z",
    children: [
      {
        id: 11,
        parent_id: 10,
        icon: null,
        uri: "/user-manage",
        is_link: 0,
        permission_name: null,
        name: "用户管理",
        guard_name: "admin",
        sequence: 0
      },
      {
        id: 12,
        parent_id: 10,
        icon: null,
        uri: "/image-record",
        is_link: 0,
        permission_name: null,
        name: "图片记录",
        guard_name: "admin",
        sequence: 1
      },
      {
        id: 13,
        parent_id: 10,
        icon: null,
        uri: "/point-log",
        is_link: 0,
        permission_name: null,
        name: "积分记录",
        guard_name: "admin",
        sequence: 2
      },
      {
        id: 14,
        parent_id: 10,
        icon: null,
        uri: "/signin-config",
        is_link: 0,
        permission_name: null,
        name: "签到配置",
        guard_name: "admin",
        sequence: 3
      },
      {
        id: 15,
        parent_id: 10,
        icon: null,
        uri: "/signin-record",
        is_link: 0,
        permission_name: null,
        name: "签到记录",
        guard_name: "admin",
        sequence: 4
      },
      {
        id: 16,
        parent_id: 10,
        icon: null,
        uri: "/recharge-package",
        is_link: 0,
        permission_name: null,
        name: "充值套餐",
        guard_name: "admin",
        sequence: 5
      },
      {
        id: 17,
        parent_id: 10,
        icon: null,
        uri: "/recharge-order",
        is_link: 0,
        permission_name: null,
        name: "充值订单",
        guard_name: "admin",
        sequence: 6
      }
    ]
  },
  {
    id: 20,
    parent_id: 0,
    icon: "Picture",
    uri: "/content",
    is_link: 0,
    permission_name: null,
    name: "内容管理",
    guard_name: "admin",
    sequence: 2,
    created_at: null,
    updated_at: "2026-06-05T00:00:00.000000Z",
    children: [
      {
        id: 21,
        parent_id: 20,
        icon: null,
        uri: "/banner",
        is_link: 0,
        permission_name: null,
        name: "轮播图",
        guard_name: "admin",
        sequence: 0
      },
      {
        id: 22,
        parent_id: 20,
        icon: null,
        uri: "/category",
        is_link: 0,
        permission_name: null,
        name: "分类管理",
        guard_name: "admin",
        sequence: 1
      },
      {
        id: 23,
        parent_id: 20,
        icon: null,
        uri: "/product",
        is_link: 0,
        permission_name: null,
        name: "产品管理",
        guard_name: "admin",
        sequence: 2
      }
    ]
  }
];

class MenuController {
  // 获取用户菜单
  async getMyMenu(ctx) {
    success(ctx, menus);
  }

  // 获取所有菜单
  async getMenuList(ctx) {
    success(ctx, menus);
  }

  // 创建菜单
  async create(ctx) {
    const menu = ctx.request.body;
    menu.id = Date.now();
    menus.push(menu);
    success(ctx, { id: menu.id }, '创建成功');
  }

  // 更新菜单
  async update(ctx) {
    const { id } = ctx.params;
    const menu = menus.find(m => m.id === parseInt(id));
    if (menu) {
      Object.assign(menu, ctx.request.body);
    }
    success(ctx, null, '更新成功');
  }

  // 删除菜单
  async delete(ctx) {
    const { id } = ctx.params;
    const index = menus.findIndex(m => m.id === parseInt(id));
    if (index > -1) {
      menus.splice(index, 1);
    }
    success(ctx, null, '删除成功');
  }
}

module.exports = new MenuController();