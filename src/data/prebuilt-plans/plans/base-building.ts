import type { PrebuiltPlan } from "../types";

export const planBaseBuilding: PrebuiltPlan = {
  "id": "base-building",
  "slug": "base-building",
  "name": "Construction de base",
  "nameEn": "Base Building",
  "description": "Plan de 12 semaines pour construire une base aérobie solide. Pas d'objectif de course.",
  "descriptionEn": "12-week plan to build a solid aerobic base. No race target.",
  "icon": "TrendingUp",
  "difficulty": "intermediate",
  "raceDistance": "10K",
  "sessionsPerWeek": 4,
  "totalWeeks": 12,
  "phases": [
    {
      "phase": "base",
      "startWeek": 1,
      "endWeek": 7
    },
    {
      "phase": "build",
      "startWeek": 8,
      "endWeek": 11
    },
    {
      "phase": "peak",
      "startWeek": 12,
      "endWeek": 12
    }
  ],
  "weeks": [
    {
      "weekNumber": 1,
      "phase": "base",
      "isRecoveryWeek": false,
      "volumePercent": 64,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "END-005",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 33,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 33,
          "loadScore": 29.2,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 5
        },
        {
          "dayOfWeek": 2,
          "workoutId": "TMP-002",
          "sessionType": "tempo",
          "isKeySession": true,
          "estimatedDurationMin": 35,
          "notes": "Allure marathon : 5:46 - 5:55/km",
          "notesEn": "Marathon pace: 5:46 - 5:55/km",
          "targetDurationMin": 40,
          "loadScore": 40,
          "paceNotes": [
            {
              "zone": "M",
              "paceMinKm": 5.77,
              "paceMaxKm": 5.92,
              "description": "Allure marathon",
              "descriptionEn": "Marathon pace"
            }
          ],
          "targetDistanceKm": 5.5
        },
        {
          "dayOfWeek": 4,
          "workoutId": "HIL-001",
          "sessionType": "hills",
          "isKeySession": true,
          "estimatedDurationMin": 49,
          "notes": "Allure seuil : 5:14 - 5:26/km",
          "notesEn": "Threshold pace: 5:14 - 5:26/km",
          "targetDurationMin": 59,
          "loadScore": 76.7,
          "paceNotes": [],
          "targetDistanceKm": 7.5
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-005",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 68,
          "notes": "Allure endurance : 6:09 - 7:06/km\nSortie longue : 10 km (~66 min)",
          "notesEn": "Easy pace: 6:09 - 7:06/km\nLong run: 10 km (~66 min)",
          "targetDurationMin": 66,
          "loadScore": 66.5,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 10
        },
        {
          "dayOfWeek": 1,
          "workoutId": "STR-008",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 28,
          "loadScore": 14
        }
      ],
      "weekLabel": "S1",
      "weekLabelEn": "W1",
      "targetKm": 28,
      "targetLongRunKm": 10,
      "weeklyLoadScore": 226
    },
    {
      "weekNumber": 2,
      "phase": "base",
      "isRecoveryWeek": false,
      "volumePercent": 70,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "END-004",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 40,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 40,
          "loadScore": 36,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 6
        },
        {
          "dayOfWeek": 2,
          "workoutId": "HIL-001",
          "sessionType": "hills",
          "isKeySession": true,
          "estimatedDurationMin": 51,
          "notes": "Allure seuil : 5:14 - 5:26/km",
          "notesEn": "Threshold pace: 5:14 - 5:26/km",
          "targetDurationMin": 59,
          "loadScore": 76.7,
          "paceNotes": [],
          "targetDistanceKm": 7.5
        },
        {
          "dayOfWeek": 4,
          "workoutId": "FAR-007",
          "sessionType": "fartlek",
          "isKeySession": true,
          "estimatedDurationMin": 46,
          "notes": "Allure seuil : 5:14 - 5:26/km",
          "notesEn": "Threshold pace: 5:14 - 5:26/km",
          "targetDurationMin": 55,
          "loadScore": 93.5,
          "paceNotes": [
            {
              "zone": "T",
              "paceMinKm": 5.24,
              "paceMaxKm": 5.43,
              "description": "Allure seuil",
              "descriptionEn": "Threshold pace"
            }
          ],
          "targetDistanceKm": 7.5
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-001",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 76,
          "notes": "Allure marathon : 5:46 - 5:55/km\nSortie longue : 11 km (~73 min)",
          "notesEn": "Marathon pace: 5:46 - 5:55/km\nLong run: 11 km (~73 min)",
          "targetDurationMin": 73,
          "loadScore": 70,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            },
            {
              "zone": "M",
              "paceMinKm": 5.77,
              "paceMaxKm": 5.92,
              "description": "Allure marathon",
              "descriptionEn": "Marathon pace"
            }
          ],
          "targetDistanceKm": 11
        },
        {
          "dayOfWeek": 1,
          "workoutId": "STR-016",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 33,
          "loadScore": 10
        }
      ],
      "weekLabel": "S2",
      "weekLabelEn": "W2",
      "targetKm": 32,
      "targetLongRunKm": 11,
      "weeklyLoadScore": 286
    },
    {
      "weekNumber": 3,
      "phase": "base",
      "isRecoveryWeek": false,
      "volumePercent": 77,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "END-012",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 70,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 70,
          "loadScore": 56.5,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 10.5
        },
        {
          "dayOfWeek": 2,
          "workoutId": "FAR-002",
          "sessionType": "fartlek",
          "isKeySession": true,
          "estimatedDurationMin": 47,
          "notes": "Allure VMA : 4:37 - 4:52/km",
          "notesEn": "VO2max pace: 4:37 - 4:52/km",
          "targetDurationMin": 55,
          "loadScore": 93.5,
          "paceNotes": [
            {
              "zone": "I",
              "paceMinKm": 4.62,
              "paceMaxKm": 4.86,
              "description": "Allure VMA",
              "descriptionEn": "VO2max pace"
            }
          ],
          "targetDistanceKm": 8.5
        },
        {
          "dayOfWeek": 4,
          "workoutId": "TMP-002",
          "sessionType": "tempo",
          "isKeySession": true,
          "estimatedDurationMin": 37,
          "notes": "Allure marathon : 5:46 - 5:55/km",
          "notesEn": "Marathon pace: 5:46 - 5:55/km",
          "targetDurationMin": 40,
          "loadScore": 40,
          "paceNotes": [
            {
              "zone": "M",
              "paceMinKm": 5.77,
              "paceMaxKm": 5.92,
              "description": "Allure marathon",
              "descriptionEn": "Marathon pace"
            }
          ],
          "targetDistanceKm": 5.5
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-005",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 78,
          "notes": "Allure endurance : 6:09 - 7:06/km\nSortie longue : 9.5 km (~63 min)",
          "notesEn": "Easy pace: 6:09 - 7:06/km\nLong run: 9.5 km (~63 min)",
          "targetDurationMin": 63,
          "loadScore": 66.5,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 9.5
        },
        {
          "dayOfWeek": 1,
          "workoutId": "STR-001",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 35,
          "loadScore": 18
        }
      ],
      "weekLabel": "S3",
      "weekLabelEn": "W3",
      "targetKm": 34,
      "targetLongRunKm": 9.5,
      "weeklyLoadScore": 275
    },
    {
      "weekNumber": 4,
      "phase": "base",
      "isRecoveryWeek": true,
      "volumePercent": 50,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "END-004",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 40,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 40,
          "loadScore": 42,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 6
        },
        {
          "dayOfWeek": 2,
          "workoutId": "END-012",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 33,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 33,
          "loadScore": 35,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 5
        },
        {
          "dayOfWeek": 4,
          "workoutId": "END-005",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 33,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 33,
          "loadScore": 31.8,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 5
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-001",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 60,
          "notes": "Allure marathon : 5:46 - 5:55/km\nSortie longue : 7.5 km (~50 min)",
          "notesEn": "Marathon pace: 5:46 - 5:55/km\nLong run: 7.5 km (~50 min)",
          "targetDurationMin": 50,
          "loadScore": 70,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            },
            {
              "zone": "M",
              "paceMinKm": 5.77,
              "paceMaxKm": 5.92,
              "description": "Allure marathon",
              "descriptionEn": "Marathon pace"
            }
          ],
          "targetDistanceKm": 7.5
        },
        {
          "dayOfWeek": 1,
          "workoutId": "STR-014",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 23,
          "loadScore": 7
        }
      ],
      "weekLabel": "Semaine de récupération",
      "weekLabelEn": "Recovery Week",
      "targetKm": 24,
      "targetLongRunKm": 7.5,
      "weeklyLoadScore": 186
    },
    {
      "weekNumber": 5,
      "phase": "base",
      "isRecoveryWeek": false,
      "volumePercent": 84,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "END-005",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 46,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 46,
          "loadScore": 35,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 7
        },
        {
          "dayOfWeek": 2,
          "workoutId": "HIL-001",
          "sessionType": "hills",
          "isKeySession": true,
          "estimatedDurationMin": 55,
          "notes": "Allure seuil : 5:14 - 5:26/km",
          "notesEn": "Threshold pace: 5:14 - 5:26/km",
          "targetDurationMin": 59,
          "loadScore": 76.7,
          "paceNotes": [],
          "targetDistanceKm": 8
        },
        {
          "dayOfWeek": 4,
          "workoutId": "FAR-002",
          "sessionType": "fartlek",
          "isKeySession": true,
          "estimatedDurationMin": 49,
          "notes": "Allure VMA : 4:37 - 4:52/km",
          "notesEn": "VO2max pace: 4:37 - 4:52/km",
          "targetDurationMin": 55,
          "loadScore": 93.5,
          "paceNotes": [
            {
              "zone": "I",
              "paceMinKm": 4.62,
              "paceMaxKm": 4.86,
              "description": "Allure VMA",
              "descriptionEn": "VO2max pace"
            }
          ],
          "targetDistanceKm": 9
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-005",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 86,
          "notes": "Allure endurance : 6:09 - 7:06/km\nSortie longue : 13 km (~86 min)",
          "notesEn": "Easy pace: 6:09 - 7:06/km\nLong run: 13 km (~86 min)",
          "targetDurationMin": 86,
          "loadScore": 66.5,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 13
        },
        {
          "dayOfWeek": 1,
          "workoutId": "STR-015",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 25,
          "loadScore": 8
        }
      ],
      "weekLabel": "S5",
      "weekLabelEn": "W5",
      "targetKm": 37,
      "targetLongRunKm": 13,
      "weeklyLoadScore": 280
    },
    {
      "weekNumber": 6,
      "phase": "base",
      "isRecoveryWeek": false,
      "volumePercent": 93,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "END-012",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 73,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 73,
          "loadScore": 55,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 11
        },
        {
          "dayOfWeek": 2,
          "workoutId": "FAR-007",
          "sessionType": "fartlek",
          "isKeySession": true,
          "estimatedDurationMin": 53,
          "notes": "Allure seuil : 5:14 - 5:26/km",
          "notesEn": "Threshold pace: 5:14 - 5:26/km",
          "targetDurationMin": 55,
          "loadScore": 93.5,
          "paceNotes": [
            {
              "zone": "T",
              "paceMinKm": 5.24,
              "paceMaxKm": 5.43,
              "description": "Allure seuil",
              "descriptionEn": "Threshold pace"
            }
          ],
          "targetDistanceKm": 9
        },
        {
          "dayOfWeek": 4,
          "workoutId": "TMP-002",
          "sessionType": "tempo",
          "isKeySession": true,
          "estimatedDurationMin": 39,
          "notes": "Allure marathon : 5:46 - 5:55/km",
          "notesEn": "Marathon pace: 5:46 - 5:55/km",
          "targetDurationMin": 40,
          "loadScore": 40,
          "paceNotes": [
            {
              "zone": "M",
              "paceMinKm": 5.77,
              "paceMaxKm": 5.92,
              "description": "Allure marathon",
              "descriptionEn": "Marathon pace"
            }
          ],
          "targetDistanceKm": 6
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-001",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 94,
          "notes": "Allure marathon : 5:46 - 5:55/km\nSortie longue : 12 km (~80 min)",
          "notesEn": "Marathon pace: 5:46 - 5:55/km\nLong run: 12 km (~80 min)",
          "targetDurationMin": 80,
          "loadScore": 70,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            },
            {
              "zone": "M",
              "paceMinKm": 5.77,
              "paceMaxKm": 5.92,
              "description": "Allure marathon",
              "descriptionEn": "Marathon pace"
            }
          ],
          "targetDistanceKm": 12
        },
        {
          "dayOfWeek": 1,
          "workoutId": "STR-002",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 45,
          "loadScore": 31
        }
      ],
      "weekLabel": "S6",
      "weekLabelEn": "W6",
      "targetKm": 38,
      "targetLongRunKm": 12,
      "weeklyLoadScore": 290
    },
    {
      "weekNumber": 7,
      "phase": "base",
      "isRecoveryWeek": false,
      "volumePercent": 100,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "END-004",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 73,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 73,
          "loadScore": 51.3,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 11
        },
        {
          "dayOfWeek": 2,
          "workoutId": "TMP-002",
          "sessionType": "tempo",
          "isKeySession": true,
          "estimatedDurationMin": 40,
          "notes": "Allure marathon : 5:46 - 5:55/km",
          "notesEn": "Marathon pace: 5:46 - 5:55/km",
          "targetDurationMin": 40,
          "loadScore": 40,
          "paceNotes": [
            {
              "zone": "M",
              "paceMinKm": 5.77,
              "paceMaxKm": 5.92,
              "description": "Allure marathon",
              "descriptionEn": "Marathon pace"
            }
          ],
          "targetDistanceKm": 6.5
        },
        {
          "dayOfWeek": 4,
          "workoutId": "HIL-001",
          "sessionType": "hills",
          "isKeySession": true,
          "estimatedDurationMin": 59,
          "notes": "Allure seuil : 5:14 - 5:26/km",
          "notesEn": "Threshold pace: 5:14 - 5:26/km",
          "targetDurationMin": 59,
          "loadScore": 76.7,
          "paceNotes": [],
          "targetDistanceKm": 9
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-001",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 103,
          "notes": "Allure marathon : 5:46 - 5:55/km\nSortie longue : 15.5 km (~103 min)",
          "notesEn": "Marathon pace: 5:46 - 5:55/km\nLong run: 15.5 km (~103 min)",
          "targetDurationMin": 103,
          "loadScore": 70,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            },
            {
              "zone": "M",
              "paceMinKm": 5.77,
              "paceMaxKm": 5.92,
              "description": "Allure marathon",
              "descriptionEn": "Marathon pace"
            }
          ],
          "targetDistanceKm": 15.5
        },
        {
          "dayOfWeek": 1,
          "workoutId": "STR-009",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 35,
          "loadScore": 25
        }
      ],
      "weekLabel": "S7",
      "weekLabelEn": "W7",
      "targetKm": 42,
      "targetLongRunKm": 15.5,
      "weeklyLoadScore": 263
    },
    {
      "weekNumber": 8,
      "phase": "build",
      "isRecoveryWeek": true,
      "volumePercent": 66,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "REC-006",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 23,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 23,
          "loadScore": 16.3,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 3.5
        },
        {
          "dayOfWeek": 2,
          "workoutId": "END-005",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 53,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 53,
          "loadScore": 43.1,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 8
        },
        {
          "dayOfWeek": 4,
          "workoutId": "END-012",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 50,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 50,
          "loadScore": 43.8,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 7.5
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-005",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 70,
          "notes": "Allure endurance : 6:09 - 7:06/km\nSortie longue : 10 km (~66 min)",
          "notesEn": "Easy pace: 6:09 - 7:06/km\nLong run: 10 km (~66 min)",
          "targetDurationMin": 66,
          "loadScore": 66.5,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 10
        },
        {
          "dayOfWeek": 1,
          "workoutId": "STR-016",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 33,
          "loadScore": 10
        }
      ],
      "weekLabel": "Semaine de récupération",
      "weekLabelEn": "Recovery Week",
      "targetKm": 29,
      "targetLongRunKm": 10,
      "weeklyLoadScore": 180
    },
    {
      "weekNumber": 9,
      "phase": "build",
      "isRecoveryWeek": false,
      "volumePercent": 100,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "REC-006",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 33,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 33,
          "loadScore": 23.3,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 5
        },
        {
          "dayOfWeek": 2,
          "workoutId": "FAR-006",
          "sessionType": "fartlek",
          "isKeySession": true,
          "estimatedDurationMin": 52,
          "notes": "Allure marathon : 5:46 - 5:55/km",
          "notesEn": "Marathon pace: 5:46 - 5:55/km",
          "targetDurationMin": 52,
          "loadScore": 88.8,
          "paceNotes": [
            {
              "zone": "M",
              "paceMinKm": 5.77,
              "paceMaxKm": 5.92,
              "description": "Allure marathon",
              "descriptionEn": "Marathon pace"
            }
          ],
          "targetDistanceKm": 8.5
        },
        {
          "dayOfWeek": 4,
          "workoutId": "TMP-019",
          "sessionType": "tempo",
          "isKeySession": true,
          "estimatedDurationMin": 72,
          "notes": "Allure marathon : 5:46 - 5:55/km",
          "notesEn": "Marathon pace: 5:46 - 5:55/km",
          "targetDurationMin": 72,
          "loadScore": 72,
          "paceNotes": [
            {
              "zone": "M",
              "paceMinKm": 5.77,
              "paceMaxKm": 5.92,
              "description": "Allure marathon",
              "descriptionEn": "Marathon pace"
            }
          ],
          "targetDistanceKm": 12
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-001",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 100,
          "notes": "Allure marathon : 5:46 - 5:55/km\nSortie longue : 14 km (~93 min)",
          "notesEn": "Marathon pace: 5:46 - 5:55/km\nLong run: 14 km (~93 min)",
          "targetDurationMin": 93,
          "loadScore": 70,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            },
            {
              "zone": "M",
              "paceMinKm": 5.77,
              "paceMaxKm": 5.92,
              "description": "Allure marathon",
              "descriptionEn": "Marathon pace"
            }
          ],
          "targetDistanceKm": 14
        },
        {
          "dayOfWeek": 1,
          "workoutId": "STR-005",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 45,
          "loadScore": 41
        }
      ],
      "weekLabel": "S9",
      "weekLabelEn": "W9",
      "targetKm": 40,
      "targetLongRunKm": 14,
      "weeklyLoadScore": 295
    },
    {
      "weekNumber": 10,
      "phase": "build",
      "isRecoveryWeek": false,
      "volumePercent": 93,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "END-004",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 70,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 70,
          "loadScore": 51.9,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 10.5
        },
        {
          "dayOfWeek": 2,
          "workoutId": "TMP-005",
          "sessionType": "tempo",
          "isKeySession": true,
          "estimatedDurationMin": 48,
          "notes": "Allure marathon : 5:46 - 5:55/km",
          "notesEn": "Marathon pace: 5:46 - 5:55/km",
          "targetDurationMin": 50,
          "loadScore": 50,
          "paceNotes": [
            {
              "zone": "M",
              "paceMinKm": 5.77,
              "paceMaxKm": 5.92,
              "description": "Allure marathon",
              "descriptionEn": "Marathon pace"
            }
          ],
          "targetDistanceKm": 8
        },
        {
          "dayOfWeek": 4,
          "workoutId": "HIL-013",
          "sessionType": "hills",
          "isKeySession": true,
          "estimatedDurationMin": 50,
          "notes": "Allure VMA : 4:37 - 4:52/km",
          "notesEn": "VO2max pace: 4:37 - 4:52/km",
          "targetDurationMin": 52,
          "loadScore": 67.6,
          "paceNotes": [
            {
              "zone": "M",
              "paceMinKm": 5.77,
              "paceMaxKm": 5.92,
              "description": "Allure marathon",
              "descriptionEn": "Marathon pace"
            },
            {
              "zone": "T",
              "paceMinKm": 5.24,
              "paceMaxKm": 5.43,
              "description": "Allure seuil",
              "descriptionEn": "Threshold pace"
            },
            {
              "zone": "I",
              "paceMinKm": 4.62,
              "paceMaxKm": 4.86,
              "description": "Allure VMA",
              "descriptionEn": "VO2max pace"
            }
          ],
          "targetDistanceKm": 8
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-005",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 96,
          "notes": "Allure endurance : 6:09 - 7:06/km\nSortie longue : 14.5 km (~96 min)",
          "notesEn": "Easy pace: 6:09 - 7:06/km\nLong run: 14.5 km (~96 min)",
          "targetDurationMin": 96,
          "loadScore": 66.5,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 14.5
        },
        {
          "dayOfWeek": 1,
          "workoutId": "STR-010",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 23,
          "loadScore": 12
        }
      ],
      "weekLabel": "S10",
      "weekLabelEn": "W10",
      "targetKm": 41,
      "targetLongRunKm": 14.5,
      "weeklyLoadScore": 248
    },
    {
      "weekNumber": 11,
      "phase": "build",
      "isRecoveryWeek": true,
      "volumePercent": 66,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "END-004",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 53,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 53,
          "loadScore": 48,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 8
        },
        {
          "dayOfWeek": 2,
          "workoutId": "REC-006",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 23,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 23,
          "loadScore": 16.3,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 3.5
        },
        {
          "dayOfWeek": 4,
          "workoutId": "END-005",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 50,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 50,
          "loadScore": 40.4,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 7.5
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-005",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 70,
          "notes": "Allure endurance : 6:09 - 7:06/km\nSortie longue : 10 km (~66 min)",
          "notesEn": "Easy pace: 6:09 - 7:06/km\nLong run: 10 km (~66 min)",
          "targetDurationMin": 66,
          "loadScore": 66.5,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 10
        },
        {
          "dayOfWeek": 1,
          "workoutId": "STR-015",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 25,
          "loadScore": 8
        }
      ],
      "weekLabel": "Semaine de récupération",
      "weekLabelEn": "Recovery Week",
      "targetKm": 29,
      "targetLongRunKm": 10,
      "weeklyLoadScore": 179
    },
    {
      "weekNumber": 12,
      "phase": "peak",
      "isRecoveryWeek": false,
      "volumePercent": 100,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "END-008",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 66,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 66,
          "loadScore": 45,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 10
        },
        {
          "dayOfWeek": 2,
          "workoutId": "FAR-009",
          "sessionType": "fartlek",
          "isKeySession": true,
          "estimatedDurationMin": 45,
          "notes": "Allure VMA : 4:37 - 4:52/km",
          "notesEn": "VO2max pace: 4:37 - 4:52/km",
          "targetDurationMin": 45,
          "loadScore": 76.5,
          "paceNotes": [
            {
              "zone": "I",
              "paceMinKm": 4.62,
              "paceMaxKm": 4.86,
              "description": "Allure VMA",
              "descriptionEn": "VO2max pace"
            }
          ],
          "targetDistanceKm": 7.5
        },
        {
          "dayOfWeek": 4,
          "workoutId": "TMP-008",
          "sessionType": "tempo",
          "isKeySession": true,
          "estimatedDurationMin": 50,
          "notes": "Allure marathon : 5:46 - 5:55/km",
          "notesEn": "Marathon pace: 5:46 - 5:55/km",
          "targetDurationMin": 50,
          "loadScore": 50,
          "paceNotes": [
            {
              "zone": "M",
              "paceMinKm": 5.77,
              "paceMaxKm": 5.92,
              "description": "Allure marathon",
              "descriptionEn": "Marathon pace"
            }
          ],
          "targetDistanceKm": 8
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-007",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 103,
          "notes": "Allure marathon : 5:46 - 5:55/km\nSortie longue : 15.5 km (~103 min)",
          "notesEn": "Marathon pace: 5:46 - 5:55/km\nLong run: 15.5 km (~103 min)",
          "targetDurationMin": 103,
          "loadScore": 70,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            },
            {
              "zone": "M",
              "paceMinKm": 5.77,
              "paceMaxKm": 5.92,
              "description": "Allure marathon",
              "descriptionEn": "Marathon pace"
            }
          ],
          "targetDistanceKm": 15.5
        },
        {
          "dayOfWeek": 1,
          "workoutId": "STR-012",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 38,
          "loadScore": 32
        }
      ],
      "weekLabel": "Semaine de course",
      "weekLabelEn": "Race Week",
      "targetKm": 41,
      "targetLongRunKm": 15.5,
      "weeklyLoadScore": 274
    }
  ],
  "tags": [
    "base",
    "aerobic",
    "foundation"
  ],
  "version": 2,
  "planPurpose": "base_building",
  "trainingGoal": "time",
  "peakWeeklyKm": 42,
  "peakLongRunKm": 15.5
};
