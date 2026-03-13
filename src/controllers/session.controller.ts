import { Elysia, t } from "elysia";
import { prisma } from "../db";

export const sessionController = new Elysia({ prefix: "/sessions" })
    // 1️⃣ Création d'une séance
    .post(
        "/",
        async ({ body }) => {
            const { title, description } = body as { title: string; description?: string };
            return prisma.session.create({
                data: {
                    title,
                    description,
                },
            });
        },
        {
            body: t.Object({
                title: t.String(),
                description: t.Optional(t.String()),
            }),
        }
    )

    // 1️⃣ Liste des séances
    .get("/", async () => {
        return prisma.session.findMany({
            orderBy: { date: "desc" },
        });
    })

    // 1️⃣ Détail d'une séance (optionnel mais pratique)
    .get("/:id", async ({ params: { id } }) => {
        return prisma.session.findUnique({
            where: { id },
            include: {
                programme: {
                    orderBy: { order: "asc" },
                    include: {
                        passage: true,
                    },
                },
            },
        });
    })

    // 1️⃣ Suppression d'une séance
    .delete("/:id", async ({ params: { id } }) => {
        return prisma.session.delete({
            where: { id },
        });
    })

    // 2️⃣ Création du programme de la séance
    .post(
        "/:id/programme",
        async ({ params: { id }, body }) => {
            const items = body as {
                label: string;
                role?: string;
                order: number;
                plannedTime: number;
                timeMin?: number;
                timeMed?: number;
                timeMax?: number;
            }[];

            // On supprime l'ancien programme si on en recrée un (pour simplifier la maj)
            await prisma.programmeItem.deleteMany({
                where: { sessionId: id },
            });

            // On crée les nouveaux items
            const createdItems = await prisma.programmeItem.createMany({
                data: items.map((item) => ({
                    ...item,
                    sessionId: id,
                })),
            });

            return {
                message: `${createdItems.count} items de programme créés`,
            };
        },
        {
            body: t.Array(
                t.Object({
                    label: t.String(),
                    role: t.Optional(t.String()),
                    order: t.Number(),
                    plannedTime: t.Number(), // en secondes
                    timeMin: t.Optional(t.Number()),
                    timeMed: t.Optional(t.Number()),
                    timeMax: t.Optional(t.Number()),
                })
            ),
        }
    )

    // 3️⃣ Démarrage de la séance
    .post("/:id/start", async ({ params: { id } }) => {
        return prisma.session.update({
            where: { id },
            data: { status: "RUNNING" },
        });
    })

    // 6️⃣ Fin de la séance (et 7️⃣ calcul global)
    .post("/:id/finish", async ({ params: { id } }) => {
        // Récupérer la session et ses passages
        const session = await prisma.session.findUnique({
            where: { id },
            include: { passages: true },
        });

        if (!session) {
            throw new Error("Session introuvable");
        }

        // Calculer les totaux de tous les passages
        const totalPlanned = session.passages.reduce((sum, p) => sum + p.plannedTime, 0);
        const totalActual = session.passages.reduce((sum, p) => sum + p.actualTime, 0);
        const totalDiff = totalActual - totalPlanned;

        // Mettre à jour la session avec le statut fini et les totaux
        return prisma.session.update({
            where: { id },
            data: {
                status: "FINISHED",
                totalPlanned,
                totalActual,
                totalDiff,
            },
        });
    })

    // 8️⃣ Génération du rapport
    .get("/:id/report", async ({ params: { id } }) => {
        const session = await prisma.session.findUnique({
            where: { id },
            include: {
                passages: {
                    orderBy: { order: "asc" },
                    include: {
                        programme: true,
                        intervenant: true,
                    },
                },
            },
        });

        if (!session) {
            throw new Error("Session introuvable");
        }

        // Formater le rapport pour plus de clarté
        const individualReports = session.passages.map((p) => {
            let zone = "inconnu";
            if (p.timeMin && p.timeMed && p.timeMax) {
                if (p.actualTime >= p.timeMax) zone = "Rouge";
                else if (p.actualTime >= p.timeMed) zone = "Orange";
                else if (p.actualTime >= p.timeMin) zone = "Vert";
                else zone = "Trop court";
            }

            return {
                order: p.order,
                label: p.programme?.label || p.intervenant?.name || "Inconnu",
                plannedTime: p.plannedTime,
                timeMin: p.timeMin,
                timeMed: p.timeMed,
                timeMax: p.timeMax,
                actualTime: p.actualTime,
                diffTime: p.diffTime,
                status: p.diffTime > 0 ? "retard" : p.diffTime < 0 ? "gain" : "pile à l'heure",
                zone,
            };
        });

        return {
            session: {
                title: session.title,
                status: session.status,
                date: session.date,
            },
            globalReport: {
                totalPlanned: session.totalPlanned,
                totalActual: session.totalActual,
                totalDiff: session.totalDiff,
                status: session.totalDiff && session.totalDiff > 0 ? "retard global" : "gain global",
            },
            individualReports,
        };
    });
