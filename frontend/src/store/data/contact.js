export const contact = {
  phone: "+91 90000 00000",
  email: "support@teams24.com",
  hours: "Mon–Sat, 9 AM – 9 PM",
  instagram: "https://www.instagram.com/teams24",
  facebook: "https://www.facebook.com/teams24",
};

export const telHref = (phone) => `tel:${phone.replace(/[^\d+]/g, "")}`;
