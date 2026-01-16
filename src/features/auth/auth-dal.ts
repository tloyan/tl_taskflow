import { cache } from "react";
import { getCurrentUser } from "./auth-service";
import { AuthError } from "./auth-errors";
import { notFound, redirect } from "next/navigation";

export const getCurrentUserDal = cache(async () => {
  try {
    const user = await getCurrentUser();
    return user;
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/login");
    }
    notFound();
  }
});
