import { createHash } from "crypto";
import { prisma } from "./store";

function getPinSecret() {
  return (
    process.env.CUSTOMER_PIN_SECRET ||
    process.env.ADMIN_PASSWORD ||
    "canteen-customer-pin"
  );
}

export function validatePin(pin?: string) {
  return typeof pin === "string" && /^\d{4}$/.test(pin.trim());
}

function hashPin(phone: string, pin: string) {
  return createHash("sha256")
    .update(`${phone}:${pin}:${getPinSecret()}`)
    .digest("hex");
}

export async function loginOrCreateCustomer({
  name,
  phone,
  pin,
}: {
  name: string;
  phone: string;
  pin: string;
}) {
  const existingCustomer = await prisma.customer.findUnique({
    where: { phone },
  });

  const pinHash = hashPin(phone, pin);

  if (existingCustomer) {
    if (existingCustomer.pinHash !== pinHash) {
      return null;
    }

    if (existingCustomer.name !== name) {
      throw new Error("INVALID_NAME");
    }

    return existingCustomer;
  }

  return prisma.customer.create({
    data: {
      name,
      phone,
      pinHash,
    },
  });
}
