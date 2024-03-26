const nodemailer = require("nodemailer");
const asyncHandler = require("express-async-handler");
const dotenv = require('dotenv').config()

const sendEmail = asyncHandler(
  async (data, req, res) => {
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.MAIL_ID,
        pass: process.env.MP
      }
    });

    let info = await transporter.sendMail({
      from: '"Hey Fred Foo" <foo@gmail.com>',
      to: data.to,
      subject: data.subject,
      text: data.text,
      html: data.htm
    });

    console.log("message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  }
);

module.exports = { sendEmail };