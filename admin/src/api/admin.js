import http from '@/utils/http'

const ADMIN = '/api/v1/admin'

// ==================== 用户管理 ====================
export const getUserList = (params) => http.get(`${ADMIN}/user`, { params })
export const getUserById = (id) => http.get(`${ADMIN}/user/${id}`)
export const updateUser = (id, data) => http.put(`${ADMIN}/user/${id}`, data)
export const adjustUserPoints = (id, data) => http.post(`${ADMIN}/user/${id}/adjust-points`, data)
export const deleteUser = (id) => http.delete(`${ADMIN}/user/${id}`)

// ==================== 图片记录 ====================
export const getImageRecordList = (params) => http.get(`${ADMIN}/image-record`, { params })
export const getImageRecordById = (id) => http.get(`${ADMIN}/image-record/${id}`)
export const deleteImageRecord = (id) => http.delete(`${ADMIN}/image-record/${id}`)

// ==================== 积分记录 ====================
export const getPointLogList = (params) => http.get(`${ADMIN}/point-log`, { params })

// ==================== 签到配置 ====================
export const getSignInConfigList = () => http.get(`${ADMIN}/signin-config`)
export const addSignInConfig = (data) => http.post(`${ADMIN}/signin-config`, data)
export const updateSignInConfig = (id, data) => http.put(`${ADMIN}/signin-config/${id}`, data)
export const deleteSignInConfig = (id) => http.delete(`${ADMIN}/signin-config/${id}`)

// ==================== 签到记录 ====================
export const getSignInRecordList = (params) => http.get(`${ADMIN}/signin-record`, { params })
export const deleteSignInRecord = (id) => http.delete(`${ADMIN}/signin-record/${id}`)

// ==================== 充值订�?====================
export const getRechargeOrderList = (params) => http.get(`${ADMIN}/recharge-order`, { params })
export const getRechargeOrderById = (id) => http.get(`${ADMIN}/recharge-order/${id}`)
export const markRechargeOrderPaid = (id, data) => http.patch(`${ADMIN}/recharge-order/${id}/pay`, data)
export const refundRechargeOrder = (id, data) => http.patch(`${ADMIN}/recharge-order/${id}/refund`, data)

// ==================== 充值套�?====================
export const getRechargePackageList = () => http.get(`${ADMIN}/recharge-package`)
export const getRechargePackage = (id) => http.get(`${ADMIN}/recharge-package/${id}`)
export const addRechargePackage = (data) => http.post(`${ADMIN}/recharge-package`, data)
export const editRechargePackage = (id, data) => http.put(`${ADMIN}/recharge-package/${id}`, data)
export const deleteRechargePackage = (id) => http.delete(`${ADMIN}/recharge-package/${id}`)
export const toggleRechargePackage = (id) => http.patch(`${ADMIN}/recharge-package/${id}/toggle`)

// ==================== 轮播�?====================
export const getBannerList = () => http.get(`${ADMIN}/banner`)
export const getBannerById = (id) => http.get(`${ADMIN}/banner/${id}`)
export const addBanner = (data) => http.post(`${ADMIN}/banner`, data)
export const editBanner = (id, data) => http.put(`${ADMIN}/banner/${id}`, data)
export const deleteBanner = (id) => http.delete(`${ADMIN}/banner/${id}`)
export const toggleBanner = (id) => http.patch(`${ADMIN}/banner/${id}/toggle`)

// ==================== 分类 ====================
export const getCategoryList = () => http.get(`${ADMIN}/category`)
export const getCategoryById = (id) => http.get(`${ADMIN}/category/${id}`)
export const addCategory = (data) => http.post(`${ADMIN}/category`, data)
export const editCategory = (id, data) => http.put(`${ADMIN}/category/${id}`, data)
export const deleteCategory = (id) => http.delete(`${ADMIN}/category/${id}`)
export const toggleCategory = (id) => http.patch(`${ADMIN}/category/${id}/toggle`)

// ==================== 产品 ====================
export const getProductList = () => http.get(`${ADMIN}/product`)
export const getProductById = (id) => http.get(`${ADMIN}/product/${id}`)
export const addProduct = (data) => http.post(`${ADMIN}/product`, data)
export const editProduct = (id, data) => http.put(`${ADMIN}/product/${id}`, data)
export const deleteProduct = (id) => http.delete(`${ADMIN}/product/${id}`)
export const toggleProduct = (id) => http.patch(`${ADMIN}/product/${id}/toggle`)
