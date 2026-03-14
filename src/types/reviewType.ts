import { ReviewStatus } from '../utils/enums/reviewEnum';

export interface IReview {
  user:      any;
  product:   any;
  order:     any;
  rating:    number; // 1-5
  title:     string;
  body:      string;
  status:    ReviewStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICreateReviewDTO {
  product:  string;
  order:    string;
  rating:   number;
  title:    string;
  body:     string;
}

export interface IUpdateReviewDTO {
  rating?: number;
  title?:  string;
  body?:   string;
}

export interface IReviewServiceResponse {
  success:    boolean;
  data?:      any;
  message?:   string;
  pagination?: {
    total:      number;
    page:       number;
    limit:      number;
    totalPages: number;
  };
}
