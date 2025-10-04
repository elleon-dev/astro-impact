import { Templates } from "../index";

export const createSubject = <T extends ObjectType>(
  template: Templates,
  view: T,
): string => {
  switch (template) {
    case Templates.RESERVATION_CREATED:
      return `[${view.purchaseNumber}] - ${view.tour.name} - ${view.startDate}`;
    case Templates.RESERVATION_UPDATED:
      return `[${view.purchaseNumber}] - ${view.tour.name} - ${view.startDate}`;
    case Templates.RESERVATION_CANCELLED:
      return `[${view.purchaseNumber}] - ${view.tour.name} - ${view.startDate}`;
    case Templates.RESERVATION_REFUNDED:
      return `[${view.purchaseNumber}] - ${view.tour.name} - ${view.startDate}`;
    case Templates.RESERVATION_CONTACT:
      return `${view.translation.payment_request} - ${view.tour.name} - ${view.startDate}`;
    default:
      return "";
  }
};
