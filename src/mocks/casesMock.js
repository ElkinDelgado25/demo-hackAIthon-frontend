export const mockCases = [
  {
    id: "SIN-2026-0148",
    claimNumber: "SIN-2026-0148",
    workshop: "Taller Norte",
    vehicle: "Toyota Corolla 2021",
    plate: "PBC-4821",
    reportedDamage: "Impacto frontal leve con reemplazo de faro y parachoques.",
    reportedDamages: ["Faro frontal", "Parachoques", "Pintura frontal"],
    invoiceTotal: 1840,
    tariffTotal: 1390,
    status: "alto",
    rawStatus: "PENDIENTE_DOCUMENTOS",
    confidence: 94,
    receivedAt: "2026-05-09 08:15",
    findings: [
      {
        id: "f-001",
        type: "tarifario",
        title: "Mano de obra fuera de tarifario",
        detail: "La factura registra 12 horas de enderezada; el tarifario permite 7 para este dano.",
        impact: 310
      },
      {
        id: "f-002",
        type: "duplicado",
        title: "Insumo duplicado",
        detail: "Se detectan dos cargos por sellador de parachoques en la misma orden.",
        impact: 140
      }
    ]
  },
  {
    id: "SIN-2026-0152",
    claimNumber: "SIN-2026-0152",
    workshop: "AutoExpress",
    vehicle: "Kia Sportage 2023",
    plate: "GSK-9021",
    reportedDamage: "Golpe lateral derecho con pintura y pulido.",
    reportedDamages: ["Puerta lateral derecha", "Pintura", "Pulido"],
    invoiceTotal: 920,
    tariffTotal: 870,
    status: "medio",
    rawStatus: "LISTO_PARA_AUDITORIA",
    confidence: 87,
    receivedAt: "2026-05-09 09:40",
    findings: [
      {
        id: "f-003",
        type: "documentacion",
        title: "Fotografia incompleta",
        detail: "Falta evidencia del panel posterior antes de aprobar pintura adicional.",
        impact: 50
      }
    ]
  },
  {
    id: "SIN-2026-0159",
    claimNumber: "SIN-2026-0159",
    workshop: "TecnoCar",
    vehicle: "Chevrolet Onix 2022",
    plate: "ABC-7734",
    reportedDamage: "Rotura de espejo izquierdo y rayones menores.",
    reportedDamages: ["Espejo izquierdo", "Rayones menores"],
    invoiceTotal: 360,
    tariffTotal: 355,
    status: "bajo",
    rawStatus: "NUEVO",
    confidence: 98,
    receivedAt: "2026-05-09 10:05",
    findings: []
  }
];
