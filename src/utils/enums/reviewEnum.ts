export enum ReviewStatus {
  PENDING  = 'pending',   // awaiting moderation
  APPROVED = 'approved',  // visible to public
  REJECTED = 'rejected',  // hidden by admin
}
