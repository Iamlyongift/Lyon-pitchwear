import { Request, Response } from "express";
import {
  createOrderService,
  getMyOrdersService,
  getMyOrderByIdService,
  getAllOrdersService,
  getOrderByIdService,
  updateOrderStatusService,
  updatePaymentStatusService,
  cancelMyOrderService,
} from "../service/orderService";
import {
  createOrderValidator,
  updateOrderStatusValidator,
  updatePaymentStatusValidator,
  orderQueryValidator,
} from "../utils/validators/orderValidator";
import { IAuthRequest } from "../types/userType";
import { IAdminRequest } from "../types/adminType";
import { getParam } from "../library/helpers/requestHelper";

// ─── POST /api/orders ──────────────────────────────────────────────────────────
export const createOrder = async (req: any, res: Response): Promise<void> => {
  const { error, value } = createOrderValidator.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    res
      .status(400)
      .json({ success: false, message: error.details.map((d) => d.message) });
    return;
  }
  const result = await createOrderService(req.user!.id, value);
  res.status(result.success ? 201 : 400).json(result);
};

// ─── GET /api/orders/my-orders ─────────────────────────────────────────────────
export const getMyOrders = async (req: any, res: Response): Promise<void> => {
  const { error, value } = orderQueryValidator.validate(req.query, {
    abortEarly: false,
  });
  if (error) {
    res
      .status(400)
      .json({ success: false, message: error.details.map((d) => d.message) });
    return;
  }
  const result = await getMyOrdersService(req.user!.id, value);
  res.status(result.success ? 200 : 400).json(result);
};

// ─── GET /api/orders/my-orders/:id ────────────────────────────────────────────
export const getMyOrderById = async (
  req: any,
  res: Response,
): Promise<void> => {
  const result = await getMyOrderByIdService(req.user!.id, getParam(req, "id"));
  res.status(result.success ? 200 : 404).json(result);
};

// ─── PATCH /api/orders/my-orders/:id/cancel ───────────────────────────────────
export const cancelMyOrder = async (req: any, res: Response): Promise<void> => {
  const result = await cancelMyOrderService(req.user!.id, getParam(req, "id"));
  res.status(result.success ? 200 : 400).json(result);
};

// ─── GET /api/admin/orders ─────────────────────────────────────────────────────
export const getAllOrders = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { error, value } = orderQueryValidator.validate(req.query, {
    abortEarly: false,
  });
  if (error) {
    res
      .status(400)
      .json({ success: false, message: error.details.map((d) => d.message) });
    return;
  }
  const result = await getAllOrdersService(value);
  res.status(result.success ? 200 : 400).json(result);
};

// ─── GET /api/admin/orders/:id ─────────────────────────────────────────────────
export const getOrderById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const result = await getOrderByIdService(getParam(req, "id"));
  res.status(result.success ? 200 : 404).json(result);
};

// ─── PATCH /api/admin/orders/:id/status ───────────────────────────────────────
export const updateOrderStatus = async (
  req: IAdminRequest,
  res: Response,
): Promise<void> => {
  const { error, value } = updateOrderStatusValidator.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    res
      .status(400)
      .json({ success: false, message: error.details.map((d) => d.message) });
    return;
  }
  const result = await updateOrderStatusService(getParam(req, "id"), value);
  res.status(result.success ? 200 : 400).json(result);
};

// ─── PATCH /api/admin/orders/:id/payment ──────────────────────────────────────
export const updatePaymentStatus = async (
  req: IAdminRequest,
  res: Response,
): Promise<void> => {
  const { error, value } = updatePaymentStatusValidator.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    res
      .status(400)
      .json({ success: false, message: error.details.map((d) => d.message) });
    return;
  }
  const result = await updatePaymentStatusService(getParam(req, "id"), value);
  res.status(result.success ? 200 : 400).json(result);
};
