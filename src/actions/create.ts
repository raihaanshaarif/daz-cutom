"use server";

import { getUserSession } from "@/helpers/getUserSession";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

export const create = async (data: FormData) => {
  const session = await getUserSession();
  const postInfo = Object.fromEntries(data.entries());
  const modifiedData = {
    ...postInfo,
    authorId: session?.user?.id,
  };

  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/post`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(modifiedData),
  });

  const result = await res.json();

  if (result?.id) {
    revalidateTag("POSTS");
    revalidatePath("/blogs");
    redirect("/blogs");
  }
  return result;
};

export const createContact = async (data: FormData) => {
  const session = await getUserSession();
  const contactInfo = Object.fromEntries(data.entries());

  // Convert string values to numbers where needed
  // sanitize form values: remove empty strings and parse dates
  const sanitized: Record<string, unknown> = {};
  Object.entries(contactInfo).forEach(([key, value]) => {
    if (typeof value === "string") {
      if (value.trim() === "") return; // skip empty
      // convert datetime-local values to ISO when detected
      if (
        /(LastContactedAt|LastRepliedAt|NextFollowUpAt|lastContactedAt|lastRepliedAt|nextFollowUpAt)/i.test(
          key,
        )
      ) {
        sanitized[key] = new Date(value).toISOString();
        return;
      }
    }
    sanitized[key] = value;
  });

  const modifiedData: Record<string, unknown> = {
    ...sanitized,
    authorId: parseInt(session?.user?.id as string),
  };

  if (sanitized.countryId) {
    modifiedData.countryId = parseInt(String(sanitized.countryId));
  }

  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/contact`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(modifiedData),
  });

  const result = await res.json();

  if (result?.id) {
    revalidateTag("CONTACTS");
    revalidatePath("/dashboard/my-contacts");
  }
  return result;
};

export const createCountry = async (data: FormData) => {
  const contactInfo = Object.fromEntries(data.entries());

  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/country`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(contactInfo),
  });

  const result = await res.json();

  if (result?.id) {
    revalidateTag("COUNTRY");
    revalidatePath("/dashboard/country-list");
  }
  return result;
};

export const createBuyer = async (data: FormData) => {
  const buyerInfo = Object.fromEntries(data.entries());

  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/order/buyers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(buyerInfo),
  });

  const result = await res.json();

  if (result?.id) {
    revalidateTag("BUYERS");
    revalidatePath("/dashboard/buyer/buyer-list");
  }
  return result;
};

export const createCourier = async (data: FormData) => {
  const courierInfo = Object.fromEntries(data.entries());

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_API}/parcel/courier-companies`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(courierInfo),
    },
  );

  const result = await res.json();

  if (result?.id) {
    revalidateTag("COURIERS");
    revalidatePath("/dashboard/courier");
  }
  return result;
};

export const updateCourier = async (id: number, data: FormData) => {
  const courierInfo = Object.fromEntries(data.entries());

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_API}/parcel/courier-companies/${id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(courierInfo),
    },
  );

  const result = await res.json();

  if (result?.data?.id || result?.id) {
    revalidateTag("COURIERS");
    revalidatePath("/dashboard/courier");
  }
  return result;
};

export const deleteCourier = async (id: number) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_API}/parcel/courier-companies/${id}`,
    {
      method: "DELETE",
    },
  );

  const result = await res.json();

  if (result?.data || result?.success || res.ok) {
    revalidateTag("COURIERS");
    revalidatePath("/dashboard/courier");
  }
  return result;
};

export const createParcel = async (data: FormData) => {
  const parcelInfo = Object.fromEntries(data.entries());

  const payload = {
    ...parcelInfo,
    buyerId: parseInt(parcelInfo.buyerId as string),
    courierCompanyId: parseInt(parcelInfo.courierCompanyId as string),
    createdById: parseInt(parcelInfo.createdById as string),
    weight: parseInt(parcelInfo.weight as string),
  };

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_API}/parcel/parcels`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  const result = await res.json();

  if (result?.data?.id || result?.id) {
    revalidateTag("PARCELS");
    revalidatePath("/dashboard/parcel");
  }
  return result;
};

export const updateParcel = async (id: number, data: FormData) => {
  const parcelInfo = Object.fromEntries(data.entries());

  const payload = {
    ...parcelInfo,
    buyerId: parseInt(parcelInfo.buyerId as string),
    courierCompanyId: parseInt(parcelInfo.courierCompanyId as string),
    weight: parseInt(parcelInfo.weight as string),
  };

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_API}/parcel/parcels/${id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  const result = await res.json();

  if (result?.data?.id || result?.id) {
    revalidateTag("PARCELS");
    revalidatePath("/dashboard/parcel");
  }
  return result;
};

export const deleteParcel = async (id: number) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_API}/parcel/parcels/${id}`,
    {
      method: "DELETE",
    },
  );

  const result = await res.json();

  if (result?.data || result?.success || res.ok) {
    revalidateTag("PARCELS");
    revalidatePath("/dashboard/parcel");
  }
  return result;
};

export const createFactory = async (data: FormData) => {
  const factoryInfo = Object.fromEntries(data.entries());

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_API}/order/factories`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(factoryInfo),
    },
  );

  const result = await res.json();

  if (result?.id) {
    revalidateTag("FACTORIES");
    revalidatePath("/dashboard/factory/factory-list");
  }
  return result;
};

export const createOrder = async (data: FormData) => {
  const session = await getUserSession();
  const o = Object.fromEntries(data.entries());

  const toFloat = (v: unknown) => {
    const n = parseFloat(v as string);
    return isNaN(n) ? undefined : n;
  };
  const toInt = (v: unknown) => {
    const n = parseInt(v as string);
    return isNaN(n) ? undefined : n;
  };

  const quantity = toInt(o.quantity) ?? 0;
  const price = toFloat(o.price) ?? 0;
  const factoryUnitPrice = toFloat(o.factoryUnitPrice);

  const processedData = {
    orderNumber: o.orderNumber,
    shipDate: o.shipDate
      ? new Date(o.shipDate as string).toISOString()
      : undefined,
    dept: o.dept || undefined,
    style: o.style || undefined,
    color: o.color || undefined,
    lot: o.lot || undefined,
    quantity,
    price,
    totalPrice: quantity * price,
    factoryUnitPrice,
    totalFactoryPrice:
      factoryUnitPrice != null ? quantity * factoryUnitPrice : undefined,
    dazCommission: toFloat(o.dazCommission),
    discountFactory: toFloat(o.discountFactory),
    discountFromDaz: toFloat(o.discountFromDaz),
    discountRemark: o.discountRemark || undefined,
    finalDazCommission: toFloat(o.finalDazCommission),
    paymentTerm: o.paymentTerm || undefined,
    overallRemarks: o.overallRemarks || undefined,
    commissionStatus: o.commissionStatus || "PENDING",
    commissionAmount: toFloat(o.commissionAmount),
    buyerId: toInt(o.buyerId),
    factoryId: toInt(o.factoryId),
    createdById: toInt(session?.user?.id as string),
  };

  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/order/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(processedData),
  });

  const result = await res.json();

  if (result?.id) {
    revalidateTag("ORDERS");
    revalidatePath("/dashboard/order/order-list");
  }
  return result;
};

export const updateOrder = async (id: number, data: FormData) => {
  const o = Object.fromEntries(data.entries());

  const toFloat = (v: unknown) => {
    const n = parseFloat(v as string);
    return isNaN(n) ? undefined : n;
  };
  const toInt = (v: unknown) => {
    const n = parseInt(v as string);
    return isNaN(n) ? undefined : n;
  };
  const quantity = toInt(o.quantity) ?? 0;
  const price = toFloat(o.price) ?? 0;
  const factoryUnitPrice = toFloat(o.factoryUnitPrice);

  const processedData = {
    orderNumber: o.orderNumber,
    shipDate: o.shipDate
      ? new Date(o.shipDate as string).toISOString()
      : undefined,
    dept: o.dept || undefined,
    style: o.style || undefined,
    color: o.color || undefined,
    lot: o.lot || undefined,
    quantity,
    price,
    totalPrice: quantity * price,
    factoryUnitPrice,
    totalFactoryPrice:
      factoryUnitPrice != null ? quantity * factoryUnitPrice : undefined,
    dazCommission: toFloat(o.dazCommission),
    discountFactory: toFloat(o.discountFactory),
    discountFromDaz: toFloat(o.discountFromDaz),
    discountRemark: o.discountRemark || undefined,
    finalDazCommission: toFloat(o.finalDazCommission),
    paymentTerm: o.paymentTerm || undefined,
    buyerId: toInt(o.buyerId),
    factoryId: toInt(o.factoryId),
    commissionStatus: o.commissionStatus || undefined,
    commissionAmount: toFloat(o.commissionAmount),
    overallRemarks: o.overallRemarks || undefined,
    yarnBooking: o.yarnBooking
      ? new Date(o.yarnBooking as string).toISOString()
      : null,
    labdipYarndip: o.labdipYarndip
      ? new Date(o.labdipYarndip as string).toISOString()
      : null,
    printStrikeOff: o.printStrikeOff
      ? new Date(o.printStrikeOff as string).toISOString()
      : null,
    ppSample: o.ppSample ? new Date(o.ppSample as string).toISOString() : null,
    bulkFabric: o.bulkFabric
      ? new Date(o.bulkFabric as string).toISOString()
      : null,
    cutting: o.cutting ? new Date(o.cutting as string).toISOString() : null,
    printing: o.printing ? new Date(o.printing as string).toISOString() : null,
    swing: o.swing ? new Date(o.swing as string).toISOString() : null,
    finishing: o.finishing
      ? new Date(o.finishing as string).toISOString()
      : null,
    shipmentSample: o.shipmentSample
      ? new Date(o.shipmentSample as string).toISOString()
      : null,
    inspection: o.inspection
      ? new Date(o.inspection as string).toISOString()
      : null,
    exFactory: o.exFactory
      ? new Date(o.exFactory as string).toISOString()
      : null,
  };

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_API}/order/orders/${id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(processedData),
    },
  );

  const result = await res.json();

  if (result?.id) {
    revalidateTag("ORDERS");
    revalidatePath("/dashboard/order/order-list");
  }
  return result;
};

export const deleteOrder = async (id: number) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_API}/order/orders/${id}`,
    {
      method: "DELETE",
    },
  );

  const result = await res.json();

  if (result?.success || res.ok) {
    revalidateTag("ORDERS");
    revalidatePath("/dashboard/order/order-list");
  }
  return result;
};

export const deleteContact = async (id: number) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/contact/${id}`, {
    method: "DELETE",
  });

  const result = await res.json();

  if (result?.success || res.ok) {
    revalidateTag("CONTACTS");
    revalidatePath("/dashboard/my-contacts");
  }
  return result;
};
