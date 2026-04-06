import type { PrebuiltPlan } from "../types";

export const planRepriseLonguePause: PrebuiltPlan = {
  "id": "reprise-longue-pause",
  "slug": "reprise-longue-pause",
  "name": "Reprise après longue pause",
  "nameEn": "Return After Long Break",
  "description": "Plan de 10 semaines pour reprendre après plusieurs mois d'arrêt. Reconstruction progressive de l'endurance et des habitudes de course.",
  "descriptionEn": "10-week plan to resume running after months off. Progressive rebuilding of endurance and running habits.",
  "icon": "RotateCcw",
  "difficulty": "beginner",
  "raceDistance": "10K",
  "sessionsPerWeek": 3,
  "totalWeeks": 10,
  "phases": [
    {
      "phase": "base",
      "startWeek": 1,
      "endWeek": 6
    },
    {
      "phase": "build",
      "startWeek": 7,
      "endWeek": 9
    },
    {
      "phase": "peak",
      "startWeek": 10,
      "endWeek": 10
    }
  ],
  "weeks": [
    {
      "weekNumber": 1,
      "phase": "base",
      "isRecoveryWeek": false,
      "volumePercent": 40,
      "sessions": [
        {
          "dayOfWeek": 1,
          "workoutId": "REC-002",
          "sessionType": "recovery",
          "isKeySession": false,
          "estimatedDurationMin": 30,
          "notes": "Allure récupération : Z1, 30 min",
          "notesEn": "Recovery pace: Z1, 30 min",
          "targetDurationMin": 30,
          "loadScore": 20,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 8.0,
              "paceMaxKm": 9.5,
              "description": "Allure récupération",
              "descriptionEn": "Recovery pace"
            }
          ]
        },
        {
          "dayOfWeek": 3,
          "workoutId": "STR-008",
          "sessionType": "strength",
          "isKeySession": false,
          "estimatedDurationMin": 28,
          "notes": "Renforcement : Core stability coureur",
          "notesEn": "Strength: Runner Core Stability",
          "loadScore": 12
        },
        {
          "dayOfWeek": 4,
          "workoutId": "REC-001",
          "sessionType": "recovery",
          "isKeySession": false,
          "estimatedDurationMin": 30,
          "notes": "Allure récupération : Z1, 30 min",
          "notesEn": "Recovery pace: Z1, 30 min",
          "targetDurationMin": 30,
          "loadScore": 20,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 8.0,
              "paceMaxKm": 9.5,
              "description": "Allure récupération",
              "descriptionEn": "Recovery pace"
            }
          ]
        },
        {
          "dayOfWeek": 6,
          "workoutId": "END-001",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 45,
          "notes": "Allure endurance : 7:37 - 8:47/km\nSortie longue : 5 km (~45 min)",
          "notesEn": "Easy pace: 7:37 - 8:47/km\nLong run: 5 km (~45 min)",
          "targetDurationMin": 45,
          "loadScore": 25,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 7.62,
              "paceMaxKm": 8.79,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 5
        }
      ],
      "weekLabel": "S1",
      "weekLabelEn": "W1",
      "targetKm": 12,
      "targetLongRunKm": 5,
      "weeklyLoadScore": 50
    },
    {
      "weekNumber": 2,
      "phase": "base",
      "isRecoveryWeek": false,
      "volumePercent": 50,
      "sessions": [
        {
          "dayOfWeek": 1,
          "workoutId": "END-001",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 35,
          "notes": "Allure endurance : 7:37 - 8:47/km",
          "notesEn": "Easy pace: 7:37 - 8:47/km",
          "targetDurationMin": 35,
          "loadScore": 24.5,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 7.62,
              "paceMaxKm": 8.79,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ]
        },
        {
          "dayOfWeek": 3,
          "workoutId": "STR-008",
          "sessionType": "strength",
          "isKeySession": false,
          "estimatedDurationMin": 28,
          "notes": "Renforcement : Core stability coureur",
          "notesEn": "Strength: Runner Core Stability",
          "loadScore": 12
        },
        {
          "dayOfWeek": 4,
          "workoutId": "REC-004",
          "sessionType": "recovery",
          "isKeySession": false,
          "estimatedDurationMin": 30,
          "notes": "Allure récupération : Z1, 30 min",
          "notesEn": "Recovery pace: Z1, 30 min",
          "targetDurationMin": 30,
          "loadScore": 20,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 8.0,
              "paceMaxKm": 9.5,
              "description": "Allure récupération",
              "descriptionEn": "Recovery pace"
            }
          ]
        },
        {
          "dayOfWeek": 5,
          "workoutId": "STR-001",
          "sessionType": "strength",
          "isKeySession": false,
          "estimatedDurationMin": 35,
          "notes": "Renforcement : Renfo full body debutant",
          "notesEn": "Strength: Full Body Beginner",
          "loadScore": 15
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-008",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 50,
          "notes": "Allure endurance : 7:37 - 8:47/km\nSortie longue : 6 km (~50 min)",
          "notesEn": "Easy pace: 7:37 - 8:47/km\nLong run: 6 km (~50 min)",
          "targetDurationMin": 50,
          "loadScore": 30,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 7.62,
              "paceMaxKm": 8.79,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 6
        }
      ],
      "weekLabel": "S2",
      "weekLabelEn": "W2",
      "targetKm": 15,
      "targetLongRunKm": 6,
      "weeklyLoadScore": 65
    },
    {
      "weekNumber": 3,
      "phase": "base",
      "isRecoveryWeek": false,
      "volumePercent": 60,
      "sessions": [
        {
          "dayOfWeek": 1,
          "workoutId": "FAR-010",
          "sessionType": "fartlek",
          "isKeySession": true,
          "estimatedDurationMin": 40,
          "notes": "Allure seuil : 6:29 - 6:43/km",
          "notesEn": "Threshold pace: 6:29 - 6:43/km",
          "targetDurationMin": 40,
          "loadScore": 55,
          "paceNotes": [
            {
              "zone": "T",
              "paceMinKm": 6.49,
              "paceMaxKm": 6.72,
              "description": "Allure seuil",
              "descriptionEn": "Threshold pace"
            }
          ]
        },
        {
          "dayOfWeek": 3,
          "workoutId": "STR-008",
          "sessionType": "strength",
          "isKeySession": false,
          "estimatedDurationMin": 28,
          "notes": "Renforcement : Core stability coureur",
          "notesEn": "Strength: Runner Core Stability",
          "loadScore": 12
        },
        {
          "dayOfWeek": 4,
          "workoutId": "END-013",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 30,
          "notes": "Allure endurance : 7:37 - 8:47/km",
          "notesEn": "Easy pace: 7:37 - 8:47/km",
          "targetDurationMin": 30,
          "loadScore": 21,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 7.62,
              "paceMaxKm": 8.79,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ]
        },
        {
          "dayOfWeek": 6,
          "workoutId": "END-003",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 55,
          "notes": "Allure endurance : 7:37 - 8:47/km\nSortie longue : 7 km (~55 min)",
          "notesEn": "Easy pace: 7:37 - 8:47/km\nLong run: 7 km (~55 min)",
          "targetDurationMin": 55,
          "loadScore": 33,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 7.62,
              "paceMaxKm": 8.79,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 7
        }
      ],
      "weekLabel": "S3",
      "weekLabelEn": "W3",
      "targetKm": 18,
      "targetLongRunKm": 7,
      "weeklyLoadScore": 85
    },
    {
      "weekNumber": 4,
      "phase": "base",
      "isRecoveryWeek": true,
      "volumePercent": 35,
      "sessions": [
        {
          "dayOfWeek": 1,
          "workoutId": "REC-005",
          "sessionType": "recovery",
          "isKeySession": false,
          "estimatedDurationMin": 25,
          "notes": "Allure récupération : Z1, 25 min",
          "notesEn": "Recovery pace: Z1, 25 min",
          "targetDurationMin": 25,
          "loadScore": 15,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 8.0,
              "paceMaxKm": 9.5,
              "description": "Allure récupération",
              "descriptionEn": "Recovery pace"
            }
          ]
        },
        {
          "dayOfWeek": 3,
          "workoutId": "STR-015",
          "sessionType": "strength",
          "isKeySession": false,
          "estimatedDurationMin": 25,
          "notes": "Renforcement : Recup foam roller",
          "notesEn": "Strength: Foam Roller Recovery",
          "loadScore": 10
        },
        {
          "dayOfWeek": 4,
          "workoutId": "REC-001",
          "sessionType": "recovery",
          "isKeySession": false,
          "estimatedDurationMin": 25,
          "notes": "Allure récupération : Z1, 25 min",
          "notesEn": "Recovery pace: Z1, 25 min",
          "targetDurationMin": 25,
          "loadScore": 15,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 8.0,
              "paceMaxKm": 9.5,
              "description": "Allure récupération",
              "descriptionEn": "Recovery pace"
            }
          ]
        },
        {
          "dayOfWeek": 6,
          "workoutId": "END-013",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 30,
          "notes": "Allure endurance : 7:37 - 8:47/km",
          "notesEn": "Easy pace: 7:37 - 8:47/km",
          "targetDurationMin": 30,
          "loadScore": 21,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 7.62,
              "paceMaxKm": 8.79,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ]
        }
      ],
      "weekLabel": "Semaine de récupération",
      "weekLabelEn": "Recovery Week",
      "targetKm": 10,
      "targetLongRunKm": 0,
      "weeklyLoadScore": 40
    },
    {
      "weekNumber": 5,
      "phase": "base",
      "isRecoveryWeek": false,
      "volumePercent": 73,
      "sessions": [
        {
          "dayOfWeek": 1,
          "workoutId": "FAR-001",
          "sessionType": "fartlek",
          "isKeySession": true,
          "estimatedDurationMin": 40,
          "notes": "Allure seuil : 6:29 - 6:43/km",
          "notesEn": "Threshold pace: 6:29 - 6:43/km",
          "targetDurationMin": 40,
          "loadScore": 55,
          "paceNotes": [
            {
              "zone": "T",
              "paceMinKm": 6.49,
              "paceMaxKm": 6.72,
              "description": "Allure seuil",
              "descriptionEn": "Threshold pace"
            }
          ]
        },
        {
          "dayOfWeek": 3,
          "workoutId": "STR-008",
          "sessionType": "strength",
          "isKeySession": false,
          "estimatedDurationMin": 28,
          "notes": "Renforcement : Core stability coureur",
          "notesEn": "Strength: Runner Core Stability",
          "loadScore": 12
        },
        {
          "dayOfWeek": 4,
          "workoutId": "END-002",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 35,
          "notes": "Allure endurance : 7:37 - 8:47/km",
          "notesEn": "Easy pace: 7:37 - 8:47/km",
          "targetDurationMin": 35,
          "loadScore": 24.5,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 7.62,
              "paceMaxKm": 8.79,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ]
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-003",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 60,
          "notes": "Allure endurance : 7:37 - 8:47/km\nSortie longue : 9 km (~60 min)",
          "notesEn": "Easy pace: 7:37 - 8:47/km\nLong run: 9 km (~60 min)",
          "targetDurationMin": 60,
          "loadScore": 36,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 7.62,
              "paceMaxKm": 8.79,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 9
        }
      ],
      "weekLabel": "S5",
      "weekLabelEn": "W5",
      "targetKm": 22,
      "targetLongRunKm": 9,
      "weeklyLoadScore": 100
    },
    {
      "weekNumber": 6,
      "phase": "base",
      "isRecoveryWeek": false,
      "volumePercent": 83,
      "sessions": [
        {
          "dayOfWeek": 1,
          "workoutId": "END-005",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 40,
          "notes": "Allure endurance : 7:37 - 8:47/km",
          "notesEn": "Easy pace: 7:37 - 8:47/km",
          "targetDurationMin": 40,
          "loadScore": 28,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 7.62,
              "paceMaxKm": 8.79,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ]
        },
        {
          "dayOfWeek": 3,
          "workoutId": "STR-008",
          "sessionType": "strength",
          "isKeySession": false,
          "estimatedDurationMin": 28,
          "notes": "Renforcement : Core stability coureur",
          "notesEn": "Strength: Runner Core Stability",
          "loadScore": 12
        },
        {
          "dayOfWeek": 4,
          "workoutId": "END-001",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 35,
          "notes": "Allure endurance : 7:37 - 8:47/km",
          "notesEn": "Easy pace: 7:37 - 8:47/km",
          "targetDurationMin": 35,
          "loadScore": 24.5,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 7.62,
              "paceMaxKm": 8.79,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ]
        },
        {
          "dayOfWeek": 5,
          "workoutId": "STR-001",
          "sessionType": "strength",
          "isKeySession": false,
          "estimatedDurationMin": 35,
          "notes": "Renforcement : Renfo full body debutant",
          "notesEn": "Strength: Full Body Beginner",
          "loadScore": 15
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-001",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 65,
          "notes": "Allure endurance : 7:37 - 8:47/km\nSortie longue : 10 km (~65 min)",
          "notesEn": "Easy pace: 7:37 - 8:47/km\nLong run: 10 km (~65 min)",
          "targetDurationMin": 65,
          "loadScore": 39,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 7.62,
              "paceMaxKm": 8.79,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 10
        }
      ],
      "weekLabel": "S6",
      "weekLabelEn": "W6",
      "targetKm": 25,
      "targetLongRunKm": 10,
      "weeklyLoadScore": 115
    },
    {
      "weekNumber": 7,
      "phase": "build",
      "isRecoveryWeek": false,
      "volumePercent": 90,
      "sessions": [
        {
          "dayOfWeek": 1,
          "workoutId": "TMP-017",
          "sessionType": "tempo",
          "isKeySession": true,
          "estimatedDurationMin": 40,
          "notes": "Allure seuil : 6:29 - 6:43/km",
          "notesEn": "Threshold pace: 6:29 - 6:43/km",
          "targetDurationMin": 40,
          "loadScore": 52,
          "paceNotes": [
            {
              "zone": "T",
              "paceMinKm": 6.49,
              "paceMaxKm": 6.72,
              "description": "Allure seuil",
              "descriptionEn": "Threshold pace"
            }
          ]
        },
        {
          "dayOfWeek": 3,
          "workoutId": "STR-010",
          "sessionType": "strength",
          "isKeySession": false,
          "estimatedDurationMin": 23,
          "notes": "Renforcement : Core running-specific",
          "notesEn": "Strength: Running-Specific Core",
          "loadScore": 12
        },
        {
          "dayOfWeek": 4,
          "workoutId": "REC-004",
          "sessionType": "recovery",
          "isKeySession": false,
          "estimatedDurationMin": 30,
          "notes": "Allure récupération : Z1, 30 min",
          "notesEn": "Recovery pace: Z1, 30 min",
          "targetDurationMin": 30,
          "loadScore": 20,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 8.0,
              "paceMaxKm": 9.5,
              "description": "Allure récupération",
              "descriptionEn": "Recovery pace"
            }
          ]
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-003",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 70,
          "notes": "Allure endurance : 7:37 - 8:47/km\nSortie longue : 10 km (~70 min)",
          "notesEn": "Easy pace: 7:37 - 8:47/km\nLong run: 10 km (~70 min)",
          "targetDurationMin": 70,
          "loadScore": 42,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 7.62,
              "paceMaxKm": 8.79,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 10
        }
      ],
      "weekLabel": "S7",
      "weekLabelEn": "W7",
      "targetKm": 27,
      "targetLongRunKm": 10,
      "weeklyLoadScore": 125
    },
    {
      "weekNumber": 8,
      "phase": "build",
      "isRecoveryWeek": true,
      "volumePercent": 40,
      "sessions": [
        {
          "dayOfWeek": 1,
          "workoutId": "END-008",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 30,
          "notes": "Allure endurance : 7:37 - 8:47/km",
          "notesEn": "Easy pace: 7:37 - 8:47/km",
          "targetDurationMin": 30,
          "loadScore": 21,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 7.62,
              "paceMaxKm": 8.79,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ]
        },
        {
          "dayOfWeek": 3,
          "workoutId": "STR-016",
          "sessionType": "strength",
          "isKeySession": false,
          "estimatedDurationMin": 33,
          "notes": "Renforcement : Mobilite complete",
          "notesEn": "Strength: Full Mobility",
          "loadScore": 10
        },
        {
          "dayOfWeek": 4,
          "workoutId": "REC-005",
          "sessionType": "recovery",
          "isKeySession": false,
          "estimatedDurationMin": 25,
          "notes": "Allure récupération : Z1, 25 min",
          "notesEn": "Recovery pace: Z1, 25 min",
          "targetDurationMin": 25,
          "loadScore": 15,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 8.0,
              "paceMaxKm": 9.5,
              "description": "Allure récupération",
              "descriptionEn": "Recovery pace"
            }
          ]
        },
        {
          "dayOfWeek": 6,
          "workoutId": "END-007",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 35,
          "notes": "Allure endurance : 7:37 - 8:47/km",
          "notesEn": "Easy pace: 7:37 - 8:47/km",
          "targetDurationMin": 35,
          "loadScore": 24.5,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 7.62,
              "paceMaxKm": 8.79,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ]
        }
      ],
      "weekLabel": "Semaine de récupération",
      "weekLabelEn": "Recovery Week",
      "targetKm": 12,
      "targetLongRunKm": 0,
      "weeklyLoadScore": 50
    },
    {
      "weekNumber": 9,
      "phase": "build",
      "isRecoveryWeek": false,
      "volumePercent": 100,
      "sessions": [
        {
          "dayOfWeek": 1,
          "workoutId": "VMA-030",
          "sessionType": "vo2max",
          "isKeySession": true,
          "estimatedDurationMin": 35,
          "notes": "Allure VMA : 5:43 - 6:01/km\n6 répétitions",
          "notesEn": "VO2max pace: 5:43 - 6:01/km\n6 repetitions",
          "targetDurationMin": 35,
          "loadScore": 52.7,
          "paceNotes": [
            {
              "zone": "I",
              "paceMinKm": 5.71,
              "paceMaxKm": 6.02,
              "description": "Allure VMA",
              "descriptionEn": "VO2max pace"
            }
          ],
          "scaledRepetitions": 6
        },
        {
          "dayOfWeek": 3,
          "workoutId": "STR-010",
          "sessionType": "strength",
          "isKeySession": false,
          "estimatedDurationMin": 23,
          "notes": "Renforcement : Core running-specific",
          "notesEn": "Strength: Running-Specific Core",
          "loadScore": 12
        },
        {
          "dayOfWeek": 4,
          "workoutId": "TMP-002",
          "sessionType": "tempo",
          "isKeySession": true,
          "estimatedDurationMin": 35,
          "notes": "Allure seuil : 6:29 - 6:43/km",
          "notesEn": "Threshold pace: 6:29 - 6:43/km",
          "targetDurationMin": 35,
          "loadScore": 45.5,
          "paceNotes": [
            {
              "zone": "T",
              "paceMinKm": 6.49,
              "paceMaxKm": 6.72,
              "description": "Allure seuil",
              "descriptionEn": "Threshold pace"
            }
          ]
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-001",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 75,
          "notes": "Allure endurance : 7:37 - 8:47/km\nSortie longue : 12 km (~75 min)",
          "notesEn": "Easy pace: 7:37 - 8:47/km\nLong run: 12 km (~75 min)",
          "targetDurationMin": 75,
          "loadScore": 45,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 7.62,
              "paceMaxKm": 8.79,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 12
        }
      ],
      "weekLabel": "S9",
      "weekLabelEn": "W9",
      "targetKm": 30,
      "targetLongRunKm": 12,
      "weeklyLoadScore": 140
    },
    {
      "weekNumber": 10,
      "phase": "peak",
      "isRecoveryWeek": false,
      "volumePercent": 53,
      "sessions": [
        {
          "dayOfWeek": 1,
          "workoutId": "THR-019",
          "sessionType": "threshold",
          "isKeySession": true,
          "estimatedDurationMin": 30,
          "notes": "Allure seuil : 6:29 - 6:43/km",
          "notesEn": "Threshold pace: 6:29 - 6:43/km",
          "targetDurationMin": 30,
          "loadScore": 39,
          "paceNotes": [
            {
              "zone": "T",
              "paceMinKm": 6.49,
              "paceMaxKm": 6.72,
              "description": "Allure seuil",
              "descriptionEn": "Threshold pace"
            }
          ]
        },
        {
          "dayOfWeek": 3,
          "workoutId": "STR-010",
          "sessionType": "strength",
          "isKeySession": false,
          "estimatedDurationMin": 23,
          "notes": "Renforcement : Core running-specific",
          "notesEn": "Strength: Running-Specific Core",
          "loadScore": 12
        },
        {
          "dayOfWeek": 4,
          "workoutId": "REC-001",
          "sessionType": "recovery",
          "isKeySession": false,
          "estimatedDurationMin": 20,
          "notes": "Allure récupération : Z1, 20 min",
          "notesEn": "Recovery pace: Z1, 20 min",
          "targetDurationMin": 20,
          "loadScore": 7.7,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 8.0,
              "paceMaxKm": 9.5,
              "description": "Allure récupération",
              "descriptionEn": "Recovery pace"
            }
          ]
        },
        {
          "dayOfWeek": 6,
          "workoutId": "ASS-003",
          "sessionType": "threshold",
          "isKeySession": true,
          "estimatedDurationMin": 30,
          "notes": "Allure seuil : 6:29 - 6:43/km",
          "notesEn": "Threshold pace: 6:29 - 6:43/km",
          "targetDurationMin": 30,
          "loadScore": 39,
          "paceNotes": [
            {
              "zone": "T",
              "paceMinKm": 6.49,
              "paceMaxKm": 6.72,
              "description": "Allure seuil",
              "descriptionEn": "Threshold pace"
            }
          ]
        }
      ],
      "weekLabel": "Semaine de course",
      "weekLabelEn": "Race Week",
      "targetKm": 16,
      "targetLongRunKm": 0,
      "weeklyLoadScore": 75
    }
  ],
  "tags": [
    "reprise",
    "comeback",
    "pause",
    "deconditioning",
    "beginner",
    "habit"
  ],
  "version": 2,
  "planPurpose": "return_from_injury",
  "trainingGoal": "finish",
  "peakWeeklyKm": 30,
  "peakLongRunKm": 12
};
