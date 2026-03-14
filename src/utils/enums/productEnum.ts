export enum ProductCategory {
  KITS = 'kits',
  GYM_GEAR = 'gym-gear',
  TRAINING_EQUIPMENT = 'training-equipment',
}

export enum KitSubCategory {
  HOME = 'home',
  AWAY = 'away',
  THIRD = 'third',
  GOALKEEPER = 'goalkeeper',
  TRAINING_KIT = 'training-kit',
}

export enum TrainingEquipmentSubCategory {
  CONES = 'cones',
  NETS = 'nets',
  BIBS = 'bibs',
  BOOTS = 'boots',
  CANVAS = 'canvas',
}

export enum GymGearSubCategory {
  COMPRESSION = 'compression',
  SHORTS = 'shorts',
  TOPS = 'tops',
  HOODIES = 'hoodies',
  ACCESSORIES = 'accessories',
}

export enum ProductSize {
  XS = 'XS',
  S = 'S',
  M = 'M',
  L = 'L',
  XL = 'XL',
  XXL = 'XXL',
  XXXL = 'XXXL',
}

export enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  OUT_OF_STOCK = 'out-of-stock',
  DISCONTINUED = 'discontinued',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export enum SortBy {
  PRICE = 'price',
  NAME = 'name',
  CREATED_AT = 'createdAt',
  FEATURED = 'featured',
}
