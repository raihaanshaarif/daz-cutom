import { NextResponse } from "next/server";

export const blogs = [
  {
    id: 13,
    title: "abc",
    content: "abc",
    thumbnail: "https://teamraft.com/wp-content/uploads/nextjs.jpg",
    isFeatured: true,
    tags: ["Next.js"],
    views: 0,
    authorId: 1,
    createdAt: "2025-09-21T04:33:08.406Z",
    updatedAt: "2025-09-21T04:33:08.406Z",
    author: {
      id: 1,
      name: "Tanmoy Parvez",
      email: "tanmoy@gmail.com",
      password: "tanmoy1234",
      role: "USER",
      phone: "01234567890",
      picture: null,
      status: "ACTIVE",
      isVerified: false,
      createdAt: "2025-09-19T18:39:44.582Z",
      updatedAt: "2025-09-19T18:39:44.582Z",
    },
  },
  {
    id: 12,
    title: "Getting Started with Server Actions",
    content:
      "Next.js introduces new features for building fast and scalable web applications. Learn how to set up your first project and explore its App Router",
    thumbnail: "https://teamraft.com/wp-content/uploads/nextjs.jpg",
    isFeatured: true,
    tags: ["Next.js", "Actions"],
    views: 0,
    authorId: 1,
    createdAt: "2025-09-21T04:29:49.359Z",
    updatedAt: "2025-09-21T04:29:49.359Z",
    author: {
      id: 1,
      name: "Tanmoy Parvez",
      email: "tanmoy@gmail.com",
      password: "tanmoy1234",
      role: "USER",
      phone: "01234567890",
      picture: null,
      status: "ACTIVE",
      isVerified: false,
      createdAt: "2025-09-19T18:39:44.582Z",
      updatedAt: "2025-09-19T18:39:44.582Z",
    },
  },
  {
    id: 3,
    title: "A Beginner’s Guide to Tailwind CSS",
    content:
      "Tailwind CSS helps you design modern websites quickly with utility-first classes. Learn how to set it up and start styling your first project.",
    thumbnail: "https://miro.medium.com/v2/1*tHpUU_Z2pTMt5G1KfY0ulg.jpeg",
    isFeatured: true,
    tags: ["CSS", "Tailwind", "Frontend"],
    views: 78,
    authorId: 1,
    createdAt: "2025-09-20T13:57:27.855Z",
    updatedAt: "2025-09-21T02:19:49.934Z",
    author: {
      id: 1,
      name: "Tanmoy Parvez",
      email: "tanmoy@gmail.com",
      password: "tanmoy1234",
      role: "USER",
      phone: "01234567890",
      picture: null,
      status: "ACTIVE",
      isVerified: false,
      createdAt: "2025-09-19T18:39:44.582Z",
      updatedAt: "2025-09-19T18:39:44.582Z",
    },
  },
  {
    id: 2,
    title: "Understanding Server Components in React",
    content:
      "React Server Components let you build faster apps by splitting work between the client and server. This guide covers how they work and why they matter.",
    thumbnail:
      "https://images.ctfassets.net/e5382hct74si/2cwYB0NTfhKcwLjwOoAXS/0f8fc9f08fe8e1e4e79795fee16a1d99/OG_Card_V1.png",
    isFeatured: true,
    tags: ["React", "Server Components", "Performance"],
    views: 18,
    authorId: 1,
    createdAt: "2025-09-20T13:56:06.685Z",
    updatedAt: "2025-09-20T19:46:11.383Z",
    author: {
      id: 1,
      name: "Tanmoy Parvez",
      email: "tanmoy@gmail.com",
      password: "tanmoy1234",
      role: "USER",
      phone: "01234567890",
      picture: null,
      status: "ACTIVE",
      isVerified: false,
      createdAt: "2025-09-19T18:39:44.582Z",
      updatedAt: "2025-09-19T18:39:44.582Z",
    },
  },
  {
    id: 1,
    title: "Getting Started with Next.js",
    content:
      "Next.js introduces new features for building fast and scalable web applications. Learn how to set up your first project and explore its App Router.",
    thumbnail: "https://teamraft.com/wp-content/uploads/nextjs.jpg",
    isFeatured: true,
    tags: ["Next.js", "React", "Web Development"],
    views: 8,
    authorId: 1,
    createdAt: "2025-09-19T18:44:36.805Z",
    updatedAt: "2025-09-20T19:18:11.897Z",
    author: {
      id: 1,
      name: "Tanmoy Parvez",
      email: "tanmoy@gmail.com",
      password: "tanmoy1234",
      role: "USER",
      phone: "01234567890",
      picture: null,
      status: "ACTIVE",
      isVerified: false,
      createdAt: "2025-09-19T18:39:44.582Z",
      updatedAt: "2025-09-19T18:39:44.582Z",
    },
  },
];

export async function GET() {
  return Response.json(blogs);
}

export const POST = async (request: Request) => {
  const blog = await request.json();
  const newBlog = {
    ...blog,
    id: blogs.length + 1,
  };
  blogs.push(newBlog);

  return new NextResponse(JSON.stringify(newBlog), {
    status: 201,
    headers: {
      "Content-type": "application/json",
    },
  });
};
