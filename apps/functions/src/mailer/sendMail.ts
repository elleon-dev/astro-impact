import { createTransport } from "nodemailer";
import { common } from "../config";
import Mail from "nodemailer/lib/mailer";
import { capitalize } from "lodash";

export const sendMail = async (
  operator: Partial<Client>,
  mailOptions: Mail.Options,
): Promise<void> => {
  try {
    const _operator = operator || common.operatorDefault;

    await createTransport(
      operator?.smtpConfig || common["node-mailer"],
    ).sendMail({
      ...mailOptions,
      from: `${capitalize(_operator.name)} <no-reply@${
        operator?.smtpConfig?.auth?.user || common["node-mailer"].auth?.user
      }>`,
      replyTo: `${capitalize(_operator.name)} <no-reply@${_operator.hostname}>`,
    });
  } catch (error) {
    throw new Error(
      `Error enviando correo: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
};
