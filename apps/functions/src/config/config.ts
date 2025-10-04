import SMTPTransport from "nodemailer/lib/smtp-transport";
interface Config {
  common: ConfigCommon;
  development: ConfigEnvironment;
  production: ConfigEnvironment;
}

interface ConfigCommon {
  "node-mailer": SMTPTransport.Options;
  operatorDefault: {
    bgColor: string;
    logotipo: Image;
    name: string;
    phone: Phone;
    receptorEmail: string;
    receptorEmailsCopy: string;
  };
}

interface ConfigEnvironment {
  hosting: ConfigHosting;
}

interface ConfigHosting {
  domain: string;
  apiUrl: string;
}

export const config: Config = {
  common: {
    "node-mailer": {
      service: "gmail",
      auth: {
        user: "iubi.latam@gmail.com",
        pass: "lpyv vvlu igxy yjgx",
      },
    },
    operatorDefault: {
      bgColor: "rgb(2, 81, 235)",
      logotipo: {
        name: "-",
        thumbUrl: "-",
        uid: "-",
        url: "https://storage.googleapis.com/iubi-sales.appspot.com/resources/logo.webp",
      },
      name: "iubi CRM",
      phone: {
        countryCode: "+51",
        number: 913346183,
      },
      receptorEmail: "iubi.latam@gmail.com",
      receptorEmailsCopy: "nmoriano26@gmail.com",
    },
  },
  development: {
    hosting: {
      domain: "https://iubi-sales.web.app",
      apiUrl: "https://api-iubisales.web.app",
    },
  },
  production: {
    hosting: {
      domain: "https://iubi-sales.web.app",
      apiUrl: "https://api-iubisales.web.app",
    },
  },
};
