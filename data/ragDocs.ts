export interface RagDoc {
    id: string;
    title: string;
    text: string;
}

export const ragDocs: RagDoc[] = [
    {
        id: 'OPS-HAZMAT-11B',
        title: 'Tuas Port Operational Safety Manual – Hazmat Spill Procedure',
        text:
            'In the event of a hazardous material spill: immediately isolate the area, notify the Port Master, and deploy the Hazmat Response Unit. Do not use water-based suppressants on Class 4 materials. Evacuate non-essential personnel and establish a safety perimeter of at least 50 meters.',
    },
    {
        id: 'BERTHING-ALGO-02',
        title: 'Berth Allocation Guidelines',
        text:
            'Berth assignment must consider vessel LOA, draft, hazardous cargo flags, crane availability, and tidal windows. Priority is given to delayed vessels when throughput impact exceeds 5%.',
    },
    {
        id: 'CRANE-MAINT-07',
        title: 'Predictive Maintenance – Quay Cranes',
        text:
            'Use vibration, temperature, and cycle counts to predict failure risk. A risk score above 0.7 requires preemptive inspection within 12 hours and potential reassignment of workload to adjacent cranes.',
    },
    {
        id: 'INCIDENT-COMMS-03',
        title: 'Incident Communication Template',
        text:
            'Subject: Operational Update. Body: Outline the event, impact, actions taken, ETA to resolution, and safety notes. Keep it under 150 words and include a clear call to action if required.',
    },
];

export function retrieveDocs(query: string, k: number = 3): RagDoc[] {
    const tokens = new Set(
        query
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, ' ')
            .split(/\s+/)
            .filter(Boolean)
    );
    return [...ragDocs]
        .map((d) => ({
            doc: d,
            score: d.text
                .toLowerCase()
                .split(/\s+/)
                .reduce((acc, t) => acc + (tokens.has(t) ? 1 : 0), 0),
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, k)
        .map((x) => x.doc);
}


