import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendMail = async (
  to: string | string[], 
  subject: string, 
  html: string, 
  attachments?: { filename: string; content: Buffer }[]
) => {
  try {
    const info = await transporter.sendMail({
      from: `"Gudang Gedong" <${process.env.EMAIL_USER}>`,
      to: Array.isArray(to) ? to.join(", ") : to,
      subject,
      html,
      attachments: attachments?.map(att => ({
        filename: att.filename,
        content: att.content, 
      })),
    });
    return { success: true };
  } catch (error) {
    console.error("Gagal mengirim email via Gmail:", error);
    throw new Error("Gagal mengirim email.");
  }
};