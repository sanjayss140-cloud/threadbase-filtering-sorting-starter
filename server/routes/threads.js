import { Router } from "express";
import prisma from "../prisma/client.js";

const router = Router();

// GET /api/threads?search=<term>&sort=<newest|oldest>
// Builds Prisma `where` and `orderBy` clauses from query parameters so the
// database executes filtering and sorting directly.
router.get("/", async (req, res, next) => {
  try {
    const { search, sort } = req.query;
    const searchTerm = typeof search === "string" ? search.trim() : "";

    const where = searchTerm
      ? { title: { contains: searchTerm, mode: "insensitive" } }
      : {};

    const orderBy =
      sort === "oldest" ? { createdAt: "asc" } : { createdAt: "desc" };

    const threads = await prisma.thread.findMany({
      where,
      orderBy,
      include: {
        author: { select: { name: true, avatarUrl: true } },
        _count: { select: { comments: true } },
      },
    });

    res.json({ threads });
  } catch (error) {
    next(error);
  }
});

export default router;
