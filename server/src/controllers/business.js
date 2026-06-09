const bannerService = require('../services/bannerService');
const categoryService = require('../services/categoryService');
const productService = require('../services/productService');
const qiniuUploader = require('../utils/qiniu');
const { success } = require('../middleware/response');

/**
 * C端公开接口 - 轮播图/分类/产品（无需登录）
 */
class BusinessController {
  /**
   * 获取启用的轮播图列表
   * GET /api/v1/business/banners
   */
  async getBanners(ctx) {
    const list = await bannerService.getActiveList();
    const result = list.map(b => ({
      id: b.id,
      title: b.title,
      imageUrl: b.image_key ? qiniuUploader.getPublicUrl(b.image_key) : '',
      linkType: b.link_type,
      linkUrl: b.link_url,
    }));
    success(ctx, result);
  }

  /**
   * 获取启用的分类列表（含分类下的产品）
   * GET /api/v1/business/categories?withProducts=1
   */
  async getCategories(ctx) {
    const { withProducts } = ctx.query;
    const list = await categoryService.getActiveList();
    if (withProducts === '1') {
      for (const cat of list) {
        cat.products = await categoryService.getProductsByCategoryId(cat.id);
      }
    }
    success(ctx, list);
  }

  /**
   * 获取启用的产品列表
   * GET /api/v1/business/products?categoryId=1
   */
  async getProducts(ctx) {
    const { categoryId } = ctx.query;
    let list;
    if (categoryId) {
      list = await categoryService.getProductsByCategoryId(parseInt(categoryId));
    } else {
      list = await productService.getActiveList();
    }
    const result = list.map(p => ({
      id: p.id,
      name: p.name,
      type: p.type,
      defaultPrompt: p.default_prompt,
      description: p.description,
      coverUrl: p.cover_image ? qiniuUploader.getPublicUrl(p.cover_image) : '',
    }));
    success(ctx, result);
  }

  /**
   * 获取单个产品详情
   * GET /api/v1/business/products/:id
   */
  async getProductById(ctx) {
    const { id } = ctx.params;
    const product = await productService.findById(id);
    if (!product || !product.is_active) {
      return success(ctx, null);
    }
    const categoryIds = await productService.getCategoryIds(id);
    success(ctx, {
      id: product.id,
      name: product.name,
      type: product.type,
      defaultPrompt: product.default_prompt,
      description: product.description,
      coverUrl: product.cover_image ? qiniuUploader.getPublicUrl(product.cover_image) : '',
      categoryIds,
    });
  }
}

module.exports = new BusinessController();
