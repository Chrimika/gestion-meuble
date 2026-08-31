import { Transaction } from "@/types/finance";

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: "tx-1",
    date: "2026-07-29",
    pieceNo: "16",
    libelle: "LOCATION APPART  4 DU 29/07/2026 AU 01/08/2026",
    unit: "Appartement 4",
    category: "Loyers & Réservations",
    recettes: 45000,
    depenses: 0
  },
  {
    id: "tx-2",
    date: "2026-08-02",
    pieceNo: "17",
    libelle: "LOCATION APPART 3 DU 02/08/2026 AU 08/08/2026",
    unit: "Appartement 3",
    category: "Loyers & Réservations",
    recettes: 130000,
    depenses: 0
  },
  {
    id: "tx-3",
    date: "2026-08-03",
    pieceNo: "18",
    libelle: "LOCATION APPRT 4 DU 07/08/2026 AU 09/08/2026 (AVANCE )",
    unit: "Appartement 4",
    category: "Loyers & Réservations",
    recettes: 15000,
    depenses: 0
  },
  {
    id: "tx-4",
    date: "2026-08-03",
    pieceNo: "19",
    libelle: "LOCATION APPART 1 ET 2 DU 05/08/2026 AU 09/08/2026 (AVANCE)",
    unit: "Appartement 1",
    category: "Loyers & Réservations",
    recettes: 50000,
    depenses: 0
  },
  {
    id: "tx-5",
    date: "2026-08-03",
    pieceNo: "1",
    libelle: "PLOMBIER (NETTOYAGE CUBITENAIRE ET ACHAT MATERIEL)",
    unit: "Général / Communs",
    category: "Entretien & Travaux",
    recettes: 0,
    depenses: 47000
  },
  {
    id: "tx-6",
    date: "2026-08-03",
    pieceNo: "2",
    libelle: "MENUISIER(CONFECTION TABLE ET REPARATION SERURE)",
    unit: "Général / Communs",
    category: "Entretien & Travaux",
    recettes: 0,
    depenses: 48000
  },
  {
    id: "tx-7",
    date: "2026-08-03",
    pieceNo: '001""',
    libelle: "PAPIER HYGYENIQUE",
    unit: "Général / Communs",
    category: "Fournitures & Linge",
    recettes: 0,
    depenses: 2000
  },
  {
    id: "tx-8",
    date: "2026-08-03",
    pieceNo: "007*",
    libelle: "ACIDE HYDROLYQUE",
    unit: "Général / Communs",
    category: "Fournitures & Linge",
    recettes: 0,
    depenses: 2550
  },
  {
    id: "tx-9",
    date: "2026-08-03",
    pieceNo: "007*",
    libelle: "CALCULATRICE",
    unit: "Général / Communs",
    category: "Fournitures & Linge",
    recettes: 0,
    depenses: 4500
  },
  {
    id: "tx-10",
    date: "2026-08-03",
    pieceNo: "007*",
    libelle: "NETTOYAGE CHAISE",
    unit: "Général / Communs",
    category: "Entretien & Travaux",
    recettes: 0,
    depenses: 5000
  },
  {
    id: "tx-11",
    date: "2026-08-03",
    pieceNo: "007*",
    libelle: "CAHIER RECETTE DEPENSE",
    unit: "Général / Communs",
    category: "Fournitures & Linge",
    recettes: 0,
    depenses: 2500
  },
  {
    id: "tx-12",
    date: "2026-08-03",
    pieceNo: "007*",
    libelle: "3 BLOC RECU",
    unit: "Général / Communs",
    category: "Fournitures & Linge",
    recettes: 0,
    depenses: 4500
  },
  {
    id: "tx-13",
    date: "2026-08-03",
    pieceNo: "007*",
    libelle: "10 STYLOTS",
    unit: "Général / Communs",
    category: "Fournitures & Linge",
    recettes: 0,
    depenses: 1000
  },
  {
    id: "tx-14",
    date: "2026-08-04",
    pieceNo: "007*",
    libelle: "8 OREILLERS",
    unit: "Général / Communs",
    category: "Fournitures & Linge",
    recettes: 0,
    depenses: 48000
  },
  {
    id: "tx-15",
    date: "2026-08-04",
    pieceNo: "007*",
    libelle: "06 PAIRES DE DRAP",
    unit: "Général / Communs",
    category: "Fournitures & Linge",
    recettes: 0,
    depenses: 64500
  },
  {
    id: "tx-16",
    date: "2026-08-04",
    pieceNo: "004*",
    libelle: "SALAIRE KASSOUMBOU ESTELLE",
    unit: "Général / Communs",
    category: "Salaires & Personnel",
    recettes: 0,
    depenses: 40000
  },
  {
    id: "tx-17",
    date: "2026-08-04",
    pieceNo: "005*",
    libelle: "SALAIRE MME JOLIE",
    unit: "Général / Communs",
    category: "Salaires & Personnel",
    recettes: 0,
    depenses: 40000
  },
  {
    id: "tx-18",
    date: "2026-08-05",
    pieceNo: "003*",
    libelle: "FRAIS DE STAGE NGONGUEMDJE FRANCOISE",
    unit: "Général / Communs",
    category: "Salaires & Personnel",
    recettes: 0,
    depenses: 30000
  },
  {
    id: "tx-19",
    date: "2026-08-05",
    pieceNo: "002*",
    libelle: "FRAIS DE TRANSPORT MENAGER",
    unit: "Général / Communs",
    category: "Transport & Com",
    recettes: 0,
    depenses: 6000
  },
  {
    id: "tx-20",
    date: "2026-08-05",
    pieceNo: "001*",
    libelle: "FRAIS DE CREDIT DE COMMUNICATION FRANCOISE",
    unit: "Général / Communs",
    category: "Transport & Com",
    recettes: 0,
    depenses: 1500
  },
  {
    id: "tx-21",
    date: "2026-08-05",
    pieceNo: "007*",
    libelle: "ELECTRICITE",
    unit: "Général / Communs",
    category: "Charges & Énergie",
    recettes: 0,
    depenses: 20000
  },
  {
    id: "tx-22",
    date: "2026-08-05",
    pieceNo: '001"',
    libelle: "FRAIS TRANSPORT FRANCOISE POUR ENEO",
    unit: "Général / Communs",
    category: "Transport & Com",
    recettes: 0,
    depenses: 1000
  },
  {
    id: "tx-23",
    date: "2026-08-05",
    pieceNo: '001"',
    libelle: "FRAIS TRANSPORT ET CREDIT DE COMMUNICATION",
    unit: "Général / Communs",
    category: "Transport & Com",
    recettes: 0,
    depenses: 1000
  },
  {
    id: "tx-24",
    date: "2026-07-29",
    pieceNo: "008*",
    libelle: "8 OREILLERS",
    unit: "Général / Communs",
    category: "Fournitures & Linge",
    recettes: 0,
    depenses: 48000
  },
  {
    id: "tx-25",
    date: "2026-07-29",
    pieceNo: "008*",
    libelle: "03 PAIRES DE DRAP",
    unit: "Général / Communs",
    category: "Fournitures & Linge",
    recettes: 0,
    depenses: 41000
  },
  {
    id: "tx-26",
    date: "2026-07-29",
    pieceNo: "008*",
    libelle: "04 LONG OREILLERS",
    unit: "Général / Communs",
    category: "Fournitures & Linge",
    recettes: 0,
    depenses: 18000
  },
  {
    id: "tx-27",
    date: "2026-07-29",
    pieceNo: "008*",
    libelle: "04 TE POUR LES LONGS OREILLERS",
    unit: "Général / Communs",
    category: "Fournitures & Linge",
    recettes: 0,
    depenses: 14000
  },
  {
    id: "tx-28",
    date: "2026-08-05",
    pieceNo: "006*",
    libelle: "ACHAT DETERGENT",
    unit: "Général / Communs",
    category: "Fournitures & Linge",
    recettes: 0,
    depenses: 2000
  },
  {
    id: "tx-29",
    date: "2026-08-06",
    pieceNo: "009*",
    libelle: "ACHAT MATERIEL POUR EVIER ET MAIN D'ŒUVRE APPART 4",
    unit: "Appartement 4",
    category: "Entretien & Travaux",
    recettes: 0,
    depenses: 15000
  },
  {
    id: "tx-30",
    date: "2026-08-06",
    pieceNo: "011*",
    libelle: "TECHNICIEN CANAL SAT APPART 2",
    unit: "Appartement 2",
    category: "Charges & Énergie",
    recettes: 0,
    depenses: 5000
  },
  {
    id: "tx-31",
    date: "2026-08-06",
    pieceNo: "19",
    libelle: "APPART 1 ET 2 SOLDE PAR MR NLOGA",
    unit: "Appartement 1",
    category: "Loyers & Réservations",
    recettes: 37500,
    depenses: 0
  },
  {
    id: "tx-32",
    date: "2026-08-06",
    pieceNo: "012*",
    libelle: "ACHAT AMPOULE",
    unit: "Général / Communs",
    category: "Fournitures & Linge",
    recettes: 0,
    depenses: 6000
  },
  {
    id: "tx-33",
    date: "2026-08-06",
    pieceNo: "013*",
    libelle: "ACHAT PARPAINGS, SABLE FIN ET SANAGA CIMENT POUR LA DEVANTURE DE LA RECEPTION",
    unit: "Général / Communs",
    category: "Entretien & Travaux",
    recettes: 0,
    depenses: 33600
  },
  {
    id: "tx-34",
    date: "2026-08-06",
    pieceNo: "014*",
    libelle: "ACHAT COLONNE D'EAU APPART 3, PORTE SERVIETTE A4 02 FLOTTEURS A4 ET COULOIR",
    unit: "Général / Communs",
    category: "Entretien & Travaux",
    recettes: 0,
    depenses: 46000
  },
  {
    id: "tx-35",
    date: "2026-08-06",
    pieceNo: "015*",
    libelle: "ACHAT GAZ A1",
    unit: "Appartement 1",
    category: "Charges & Énergie",
    recettes: 0,
    depenses: 6500
  }
];
