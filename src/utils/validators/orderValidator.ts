import Joi from 'joi';
import { DeliveryMethod, OrderStatus, PaymentStatus } from '../enums/oderEnum';

export const createOrderValidator = Joi.object({
  orderItems: Joi.array()
    .items(
      Joi.object({
        product:  Joi.string().required(),
        quantity: Joi.number().integer().min(1).required(),
        size:     Joi.string().optional(),
        color:    Joi.string().optional(),
      })
    )
    .min(1)
    .required(),

  shippingAddress: Joi.object({
    fullName: Joi.string().trim().min(2).required(),
    phone:    Joi.string().trim().min(7).required(),
    address:  Joi.string().trim().min(5).required(),
    city:     Joi.string().trim().required(),
    state:    Joi.string().trim().required(),
    country:  Joi.string().trim().default('Nigeria'),
  }).required(),

  deliveryMethod: Joi.string()
    .valid(...Object.values(DeliveryMethod))
    .default(DeliveryMethod.STANDARD),

  notes: Joi.string().max(500).optional(),
});

export const updateOrderStatusValidator = Joi.object({
  orderStatus: Joi.string()
    .valid(...Object.values(OrderStatus))
    .required(),
  cancellationReason: Joi.when('orderStatus', {
    is:   OrderStatus.CANCELLED,
    then: Joi.string().min(5).required(),
    otherwise: Joi.optional(),
  }),
});

export const updatePaymentStatusValidator = Joi.object({
  paymentStatus: Joi.string()
    .valid(...Object.values(PaymentStatus))
    .required(),
});

export const orderQueryValidator = Joi.object({
  page:          Joi.number().integer().min(1).default(1),
  limit:         Joi.number().integer().min(1).max(50).default(10),
  orderStatus:   Joi.string().valid(...Object.values(OrderStatus)).optional(),
  paymentStatus: Joi.string().valid(...Object.values(PaymentStatus)).optional(),
  search:        Joi.string().optional(),
});
