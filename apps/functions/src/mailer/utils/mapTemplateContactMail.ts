import { capitalize, toLower } from "lodash";

export interface ContactMustacheView {
  theme: string;
  client: {
    name: string;
    logotipoUrl: string;
    textColor: string;
    bgColor: string;
    hostname: string;
  };
  contact: {
    fullName?: string;
    email?: string;
    phoneNumber?: string;
    issue?: string;
    message?: string;
    service?: string;
    contactPreference?: string;
  };
}

export const mapTemplateContactMailMustache = (
  contact: EmailContact,
  client: Client,
): ContactMustacheView => {
  return {
    theme: client.theme,
    client: {
      name: client.name,
      logotipoUrl: client.logotipo.thumbUrl,
      textColor: client.textColor,
      bgColor: client.bgColor,
      hostname: client.hostname,
    },
    contact: {
      fullName: contact?.fullName
        ? contact.fullName
        : `${capitalize(contact.firstName)} ${capitalize(contact.lastName)}`,
      email: toLower(contact.email),
      phoneNumber: `${contact.phone.countryCode} ${contact.phone.number}`,
      ...(contact.issue && {
        issue: capitalize(contact.issue),
      }),
      ...(contact.message && {
        message: contact.message,
      }),
      ...(contact?.service && { service: contact.service }),
      ...(contact?.contactPreference && {
        contactPreference: contact.contactPreference,
      }),
    },
  };
};
