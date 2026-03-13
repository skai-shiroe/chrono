import { Elysia } from "elysia";
import { treaty } from "@elysiajs/eden";
import { sessionController } from "./src/controllers/session.controller";
import { passageController } from "./src/controllers/passage.controller";
import { intervenantController } from "./src/controllers/intervenant.controller";

const app = new Elysia()
    .use(sessionController)
    .use(passageController)
    .use(intervenantController);

const api = treaty(app);

async function run() {
    console.log("=== Début du test Flow Chrono ===\n");

    // 1. Création Session
    console.log("1️⃣ Création Session...");
    const { data: session } = await api.sessions.post({
        title: "Réunion Hebdo Test",
        description: "Test automatisé du flow",
    });
    console.log("Session créée:", session?.id);

    if (!session) return;

    // 2. Création Programme
    console.log("\n2️⃣ Ajout du Programme...");
    const programme = [
        { label: "Alpha", order: 1, plannedTime: 5 }, // 5 secondes pour test rapide
        { label: "Beta", order: 2, plannedTime: 3 },
    ];
    await api.sessions({ id: session.id }).programme.post(programme);

    // 3. Start Session
    console.log("\n3️⃣ Démarrage de la Session...");
    await api.sessions({ id: session.id }).start.post();

    // On récupère le détail pour avoir les IDs du programme
    const { data: sessionDetails } = await api.sessions({ id: session.id }).get();
    const progItems = sessionDetails?.programme;

    if (!progItems) return;

    // 4. Chronométrage (Simulation)
    console.log("\n4️⃣ Chronométrage - Passage 1 (Alpha attendu 5s, réel ~2s => Gain de 3s)");
    let { data: passage1 } = await api.passages.start.post({
        sessionId: session.id,
        programmeId: progItems[0].id,
    });

    await new Promise(r => setTimeout(r, 2000)); // Attend 2s

    const { data: p1Stopped } = await api.passages.stop.post({
        passageId: passage1!.id,
    });
    console.log("Passage 1 terminé:", Object.assign(p1Stopped, { startedAt: undefined, endedAt: undefined }));

    console.log("\n4️⃣ Chronométrage - Passage 2 (Beta attendu 3s, réel ~5s => Retard de 2s)");
    let { data: passage2 } = await api.passages.start.post({
        sessionId: session.id,
        programmeId: progItems[1].id,
    });

    await new Promise(r => setTimeout(r, 5000)); // Attend 5s

    const { data: p2Stopped } = await api.passages.stop.post({
        passageId: passage2!.id,
    });
    console.log("Passage 2 terminé:", Object.assign(p2Stopped, { startedAt: undefined, endedAt: undefined }));

    // 5. Fin de Session
    console.log("\n5️⃣ Fin de la Session...");
    await api.sessions({ id: session.id }).finish.post();

    // 6. Rapport
    console.log("\n6️⃣ Rapport Global...");
    const { data: report } = await api.sessions({ id: session.id }).report.get();
    console.dir(report, { depth: null });

    console.log("\n=== Fin du test ===");
}

run().catch(console.error);
