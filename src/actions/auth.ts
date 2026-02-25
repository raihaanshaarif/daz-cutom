"use server";
import { FieldValues } from "react-hook-form";

export const register = async (data: FieldValues) => {
  const res = await fetch(`http://localhost:5001/api/v1/user`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res?.ok) {
    console.error("User Registration Failed", await res.text());
  }
  return await res.json();
};

export const login = async (data: FieldValues) => {
  const res = await fetch(`http://localhost:5001/api/v1/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res?.ok) {
    console.error("Login Failed", await res.text());
  }
  return await res.json();
};
