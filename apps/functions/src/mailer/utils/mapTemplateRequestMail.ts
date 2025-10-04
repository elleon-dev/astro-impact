import { capitalize, toLower } from "lodash";
import moment from "moment-timezone";

export interface RequestMustacheView {
  theme: string;
  client: {
    name: string;
    logotipoUrl: string;
    textColor: string;
    bgColor: string;
    hostname: string;
  };
  request: {
    fullName: string;
    email: string;
    phoneNumber: string;
    message?: string;
    dateToMeet: string;
    timeToMeet: string;
    meetingType: string;
    product?: {
      id: string;
      name: string;
      type: string;
      price: string;
      discount: {
        type: string;
        value: number;
      };
      totalNeto: number;
    };
  };
}

export const mapTemplateRequestMailMustache = (
  contact: EmailRequest,
  client: Client,
): RequestMustacheView => {
  return {
    theme: client.theme,
    client: {
      name: client.name,
      logotipoUrl: client.logotipo.thumbUrl,
      textColor: client.textColor,
      bgColor: client.bgColor,
      hostname: client.hostname,
    },
    request: {
      fullName: contact?.fullName
        ? contact.fullName
        : `${capitalize(contact.firstName)} ${capitalize(contact.lastName)}`,
      email: toLower(contact.email),
      phoneNumber: `${contact.phone.countryCode} ${contact.phone.number}`,
      message: contact.message,
      dateToMeet: moment(contact.dateToMeet, "DD/MM/YYYY").format("DD/MM/YYYY"),
      timeToMeet: moment(contact.timeToMeet, "HH:mm").format("HH:mm a"),
      meetingType: contact.meetingType,
      ...(contact?.product && {
        product: contact.product,
      }),
    },
  };
};
