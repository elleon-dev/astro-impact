import { Templates } from "../index";
import { capitalize } from "lodash";

export const createSubject = <T extends ObjectType>(
  template: Templates,
  view: T,
): string => {
  switch (template) {
    case Templates.EMAIL_CONTACT:
      return `[${capitalize(view.client.name)}] - Contacto 🤗`;
    case Templates.EMAIL_REQUEST:
      return `[${capitalize(view.client.name)}] - Solicitud 🤩`;
    case Templates.EMAIL_CLAIM:
      return `[${capitalize(view.client.name)}] - Reclamo 😡`;
    case Templates.EMAIL_MESSAGE:
      return `[${capitalize(view.client.name)}] - Mensaje ✉️`;
    case Templates.EMAIL_QUOTATION:
      return `[${capitalize(view.client.name)}] - Cotización 💵`;
    default:
      return "";
  }
};
