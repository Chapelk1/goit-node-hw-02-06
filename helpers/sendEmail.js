const nodemailer = require('nodemailer');

const { SECRET_PASSWORD } = process.env;

const nodemailerConfig = {
  host: "smtp.meta.ua",
  port: 465,
  secure: true,
  auth: {
    pass: SECRET_PASSWORD,
    user: "klepach154789@meta.ua",
  },
};

const transport = nodemailer.createTransport(nodemailerConfig);

const sendEmail = async (data) => {
  const emailT = { ...data, from: "klepach154789@meta.ua" };
  await transport.sendMail(emailT);
  return true;
}

module.exports = sendEmail;

