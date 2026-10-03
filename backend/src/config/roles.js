const PERMISSIONS = {
  PROFILE_MANAGE: "profile:manage",
  ADDRESS_MANAGE: "address:manage",
  CART_MANAGE: "cart:manage",
  WISHLIST_MANAGE: "wishlist:manage",
  ORDER_CREATE: "order:create",
  ORDER_READ_OWN: "order:read:own",
  ORDER_CANCEL_OWN: "order:cancel:own",
  REVIEW_CREATE: "review:create",
  REVIEW_MANAGE_OWN: "review:manage:own",

  CATEGORY_MANAGE: "category:manage",
  PRODUCT_MANAGE: "product:manage",
  ORDER_READ_ALL: "order:read:all",
  ORDER_MANAGE: "order:manage",
  USER_READ: "user:read",
  USER_MANAGE: "user:manage",
  REVIEW_MANAGE_ALL: "review:manage:all",
  DASHBOARD_VIEW: "dashboard:view",
};

const customerPermissions = [
  PERMISSIONS.PROFILE_MANAGE,
  PERMISSIONS.ADDRESS_MANAGE,
  PERMISSIONS.CART_MANAGE,
  PERMISSIONS.WISHLIST_MANAGE,
  PERMISSIONS.ORDER_CREATE,
  PERMISSIONS.ORDER_READ_OWN,
  PERMISSIONS.ORDER_CANCEL_OWN,
  PERMISSIONS.REVIEW_CREATE,
  PERMISSIONS.REVIEW_MANAGE_OWN,
];

const ROLE_PERMISSIONS = {
  customer: customerPermissions,
  admin: [...new Set([...customerPermissions, ...Object.values(PERMISSIONS)])],
};

const hasPermission = (role, permission) =>
  (ROLE_PERMISSIONS[role] || []).includes(permission);

module.exports = { PERMISSIONS, ROLE_PERMISSIONS, hasPermission };
