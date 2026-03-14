import Joi from 'joi';

export const createReviewValidator = Joi.object({
  product: Joi.string().required(),
  order:   Joi.string().required(),
  rating:  Joi.number().integer().min(1).max(5).required(),
  title:   Joi.string().trim().min(3).max(100).required(),
  body:    Joi.string().trim().min(10).max(1000).required(),
});

export const updateReviewValidator = Joi.object({
  rating: Joi.number().integer().min(1).max(5).optional(),
  title:  Joi.string().trim().min(3).max(100).optional(),
  body:   Joi.string().trim().min(10).max(1000).optional(),
});
