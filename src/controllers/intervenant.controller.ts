import { Elysia, t } from "elysia";
import { prisma } from "../db";

export const intervenantController = new Elysia({ prefix: "/intervenants" })
    .post(
        "/",
        async ({ body }) => {
            const { name, role } = body as { name: string; role?: string };
            return prisma.intervenant.create({
                data: {
                    name,
                    role,
                },
            });
        },
        {
            body: t.Object({
                name: t.String(),
                role: t.Optional(t.String()),
            }),
        }
    )
    .get("/", async () => {
        return prisma.intervenant.findMany({
            orderBy: { name: "asc" },
        });
    })
    .delete("/:id", async ({ params: { id } }) => {
        return prisma.intervenant.delete({
            where: { id },
        });
    });
