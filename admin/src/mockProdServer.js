import { createProdMockServer } from 'vite-plugin-mock/client'
import loginMock from '../mock/auth'
import adminUserMock from '../mock/adminUser'
import menuMock from '../mock/menu'
import rechargePackageMock from '../mock/rechargePackage'
import bannerMock from '../mock/banner'
import categoryMock from '../mock/category'
import productMock from '../mock/product'
import permissionMock from '../mock/permission'
import permissionGroupMock from '../mock/permissionGroup'
import captchaMock from '../mock/captcha'

export function setupProdMockServer() {
  createProdMockServer([
    ...loginMock,
    ...adminUserMock,
    ...menuMock,
    ...rechargePackageMock,
    ...bannerMock,
    ...categoryMock,
    ...productMock,
    ...permissionMock,
    ...permissionGroupMock,
    ...captchaMock,
  ]);
}