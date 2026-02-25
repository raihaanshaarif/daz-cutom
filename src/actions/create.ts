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

  const res = await fetch(`http://localhost:5001/api/v1/post`, {
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
  const modifiedData = {
    ...contactInfo,
    authorId: parseInt(session?.user?.id as string),
    ...(contactInfo.countryId && {
      countryId: parseInt(contactInfo.countryId as string),
    }),
  };

  const res = await fetch(`http://localhost:5001/api/v1/contact`, {
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

  const res = await fetch(`http://localhost:5001/api/v1/country`, {
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
