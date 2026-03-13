import { Elysia, t } from "elysia";
import { prisma } from "../db";

export const passageController = new Elysia({ prefix: "/passages" })
    // 4️⃣ Démarrer le chrono d'un passage
    // On passe un body avec le programmeId ou de façon minimale les infos
    .post(
        "/start",
        async ({ body }) => {
            const { sessionId, programmeId, intervenantId } = body as {
                sessionId: string;
                programmeId: string;
                intervenantId?: string;
            };

            // 1. On cherche l'item de programme pour récupérer son "plannedTime" et "order"
            const item = await prisma.programmeItem.findUnique({
                where: { id: programmeId },
            });

            if (!item) {
                throw new Error("Item de programme introuvable");
            }

            // 2. On crée le passage et on lance le chrono (startedAt)
            return prisma.passage.create({
                data: {
                    sessionId,
                    programmeId,
                    intervenantId,
                    order: item.order,
                    plannedTime: item.plannedTime,
                    timeMin: item.timeMin,
                    timeMed: item.timeMed,
                    timeMax: item.timeMax,
                    startedAt: new Date(),
                },
            });
        },
        {
            body: t.Object({
                sessionId: t.String(),
                programmeId: t.String(),
                intervenantId: t.Optional(t.String()),
            }),
        }
    )

    // 4️⃣ Arrêter le chrono et calculer les temps
    .post(
        "/stop",
        async ({ body }) => {
            const { passageId } = body as { passageId: string };

            // 1. Récupérer le passage en cours
            const passage = await prisma.passage.findUnique({
                where: { id: passageId },
            });

            if (!passage || !passage.startedAt) {
                throw new Error("Passage introuvable ou non démarré");
            }

            // 2. Calculer les temps
            const endedAt = new Date();
            // Différence en secondes entre fin et début
            const actualTime = Math.floor(
                (endedAt.getTime() - passage.startedAt.getTime()) / 1000
            );
            // Différence entre prévu et réel. Si positif => en retard, si négatif => a gagné du temps
            const diffTime = actualTime - passage.plannedTime;

            // 3. Sauvegarder les temps dans le passage
            return prisma.passage.update({
                where: { id: passageId },
                data: {
                    endedAt,
                    actualTime,
                    diffTime,
                },
            });
        },
        {
            body: t.Object({
                passageId: t.String(),
            }),
        }
    );
