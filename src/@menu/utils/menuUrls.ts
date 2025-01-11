export const menuUrls = {
  product_management: {
    attribute: {
      list: '/product-management/attribute/list',
      add: '/product-management/attribute/add',
      edit: '/product-management/attribute/edit'
    },
    attributesGroup: {
      list: '/product-management/attributes-group/list'
    },
    category: {
      list: '/product-management/category/list',
      add: '/product-management/category/add',
      edit: '/product-management/category/edit'
    },
    brand: {
      list: '/product-management/brand/list',
      add: '/product-management/brand/add',
      edit: '/product-management/brand/edit'
    },
    pricing_plans: {
      list: '/product-management/pricing-plans/list'
    },
    tag: {
      list: '/product-management/tag/list'
    },
    products: {
      list: '/product-management/products/list',
      edit: '/product-management/products/edit'
    }
  },
  financial_management: {
    tax: {
      list: '/financial-management/tax/list'
    },
    profit: {
      list: '/financial-management/profit/list'
    }
  },
  settings: {
    unit: {
      list: '/settings/unit/list'
    }
  },
  content_management: {
    story: {
      list: '/content-management/story/list',
      add: '/content-management/story/add',
      edit: '/content-management/story/edit/:id'
    },
    slider: {
      list: '/content-management/slider/list',
      slides: {
        list: '/content-management/slider/:id/slides/list',
        add: '/content-management/slider/:id/slides/add',
        edit: '/content-management/slider/:id/slides/edit/:slideId'
      }
    }
  },
  user_management: {
    user_groups: {
      list: '/user-management/user-groups/list',
      add: '/user-management/user-groups/add',
      edit: '/user-management/user-groups/edit/:id'
    }
  },
  messages_management: {
    comments: {
      list: '/messages-management/comments/list'
    }
  }
}
