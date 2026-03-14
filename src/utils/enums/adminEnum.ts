export enum AdminRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MANAGER = 'manager',
}

export enum AdminStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

export enum AdminPermission {
  // Products
  CREATE_PRODUCT = 'create_product',
  UPDATE_PRODUCT = 'update_product',
  DELETE_PRODUCT = 'delete_product',
  VIEW_PRODUCTS  = 'view_products',

  // Orders
  VIEW_ORDERS   = 'view_orders',
  UPDATE_ORDER  = 'update_order',
  CANCEL_ORDER  = 'cancel_order',

  // Users
  VIEW_USERS    = 'view_users',
  SUSPEND_USER  = 'suspend_user',
  DELETE_USER   = 'delete_user',

  // Admins
  CREATE_ADMIN  = 'create_admin',
  UPDATE_ADMIN  = 'update_admin',
  DELETE_ADMIN  = 'delete_admin',
}
