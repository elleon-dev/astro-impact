import { capitalize } from "lodash";

export interface MessageMustacheView {
  theme: string;
  client: {
    name: string;
    logotipoUrl: string;
    textColor: string;
    bgColor: string;
  };
  message: string;
}

export const mapTemplateMessageMailMustache = (
  client: Client,
  emailMessage: EmailMessage,
): MessageMustacheView => {
  return {
    theme: client.theme,
    client: {
      name: client.name,
      logotipoUrl: client.logotipo.thumbUrl,
      textColor: client.textColor,
      bgColor: client.bgColor,
    },
    message: capitalize(emailMessage.message),
  };
};
