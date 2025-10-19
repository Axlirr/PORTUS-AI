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
    {
        id: 'CUSTOMS-CLEAR-15',
        title: 'Customs Clearance Protocol',
        text:
            'All vessels must submit manifest 24 hours before arrival. Hazardous cargo requires additional 48-hour notice. Customs inspection priority: high-risk cargo > delayed vessels > regular containers. Average clearance time: 2-4 hours.',
    },
    {
        id: 'ENV-REG-09',
        title: 'Environmental Regulations',
        text:
            'Ballast water exchange must occur 200nm from shore. Fuel switching to low-sulfur required within 12nm of port. Noise restrictions apply 24/7 within 500m of residential areas. Violations result in immediate berth suspension.',
    },
    {
        id: 'SECURITY-PROT-12',
        title: 'Port Security Protocol',
        text:
            'ISPS Level 1: Standard screening. Level 2: Enhanced screening + escort. Level 3: Maximum security + restricted access. All personnel must have valid port passes. Vehicle inspections mandatory at all gates.',
    },
    {
        id: 'PILOTAGE-REQ-06',
        title: 'Pilotage Requirements',
        text:
            'Mandatory pilotage for vessels >300GT or >50m LOA. Pilot boarding at designated stations: Inner Roads (1nm), Outer Roads (3nm). Weather limits: Max wind 25kt, visibility 1nm minimum. Emergency pilotage available 24/7.',
    },
    {
        id: 'TUG-ASSIST-18',
        title: 'Tug Assistance Guidelines',
        text:
            'Required for vessels >200m LOA or >50,000GT. Minimum 2 tugs for berthing/unberthing. Weather-dependent: add 1 tug per 10kt wind above 20kt. Emergency tug on standby during adverse weather.',
    },
    {
        id: 'CARGO-HANDLING-21',
        title: 'Cargo Handling Procedures',
        text:
            'Container handling rate: 25-35 moves/hour per crane. Breakbulk: 15-20 tons/hour. Hazardous cargo: special handling + additional time. Reefer containers: continuous power monitoring required.',
    },
    {
        id: 'WEATHER-CONTINGENCY-24',
        title: 'Weather Contingency Plans',
        text:
            'Wind >40kt: Suspend crane operations. Wind >50kt: Evacuate all personnel from quay. Storm surge >2m: Activate emergency protocols. Lightning: Suspend all outdoor operations within 5nm.',
    },
    {
        id: 'EMERGENCY-RESPONSE-27',
        title: 'Emergency Response Procedures',
        text:
            'Fire: Immediate alarm + evacuation + fire brigade. Medical: First aid station + ambulance on standby. Security breach: Lockdown + port police + coast guard. Oil spill: Containment + cleanup + reporting.',
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


