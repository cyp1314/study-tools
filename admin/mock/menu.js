export default [
    {
        url: '/api/v1/my-menu',
        method: 'get',
        response: () => menus(),
    },
    {
        url: '/api/v1/menu',
        method: 'get',
        response: () => menus(),
    },
    {
        url: '/api/v1/menu',
        method: 'post',
        statusCode: 201,
    },
    {
        url: '/api/v1/menu/:id',
        method: 'patch',
        statusCode: 204,
    },
    {
        url: '/api/v1/menu/:id',
        method: 'delete',
        statusCode: 204,
    }
]

const menus = () => {
    return {
        data: [
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
        ]
    }
}