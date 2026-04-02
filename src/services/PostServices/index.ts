import { authenticatedFetch } from "@/lib/apiClient";

export const getBlogById = async (blogId: string) => {
  const res = await authenticatedFetch(
    `${process.env.NEXT_PUBLIC_BASE_API}/post/${blogId}`,
  );
  return await res.json();
};
