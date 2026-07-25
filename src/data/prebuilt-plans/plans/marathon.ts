import type { PrebuiltPlan } from "../types";

export const planMarathon: PrebuiltPlan = {
  "id": "marathon",
  "slug": "marathon",
  "name": "Marathon",
  "nameEn": "Marathon",
  "description": "Plan de 18 semaines pour le marathon, 5 séances par semaine. Sorties longues progressives et travail à allure spécifique.",
  "descriptionEn": "18-week marathon plan, 5 sessions per week. Progressive long runs and race-pace work.",
  "icon": "Trophy",
  "difficulty": "intermediate",
  "raceDistance": "marathon",
  "sessionsPerWeek": 5,
  "totalWeeks": 18,
  "phases": [
    {
      "phase": "base",
      "startWeek": 1,
      "endWeek": 8
    },
    {
      "phase": "build",
      "startWeek": 9,
      "endWeek": 13
    },
    {
      "phase": "peak",
      "startWeek": 14,
      "endWeek": 15
    },
    {
      "phase": "taper",
      "startWeek": 16,
      "endWeek": 18
    }
  ],
  "weeks": [
    {
      "weekNumber": 1,
      "phase": "base",
      "isRecoveryWeek": false,
      "volumePercent": 65,
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
          "loadScore": 64.2,
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
          "dayOfWeek": 1,
          "workoutId": "HIL-001",
          "sessionType": "hills",
          "isKeySession": true,
          "estimatedDurationMin": 50,
          "notes": "Allure seuil : 5:14 - 5:26/km",
          "notesEn": "Threshold pace: 5:14 - 5:26/km",
          "targetDurationMin": 59,
          "loadScore": 76.7,
          "paceNotes": [],
          "targetDistanceKm": 7.5
        },
        {
          "dayOfWeek": 3,
          "workoutId": "FAR-002",
          "sessionType": "fartlek",
          "isKeySession": true,
          "estimatedDurationMin": 44,
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
          "targetDistanceKm": 8
        },
        {
          "dayOfWeek": 4,
          "workoutId": "END-005",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 73,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 73,
          "loadScore": 59.2,
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
          "dayOfWeek": 6,
          "workoutId": "SL-001",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 93,
          "notes": "Allure marathon : 5:46 - 5:55/km\nSortie longue : 14 km (~93 min)",
          "notesEn": "Marathon pace: 5:46 - 5:55/km\nLong run: 14 km (~93 min)",
          "targetDurationMin": 93,
          "loadScore": 65.1,
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
          "dayOfWeek": 2,
          "workoutId": "STR-010",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 23,
          "loadScore": 12
        }
      ],
      "weekLabel": "S1",
      "weekLabelEn": "W1",
      "targetKm": 52,
      "targetLongRunKm": 14,
      "weeklyLoadScore": 371
    },
    {
      "weekNumber": 2,
      "phase": "base",
      "isRecoveryWeek": false,
      "volumePercent": 70,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "END-017",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 89,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 89,
          "loadScore": 76.8,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 13.5
        },
        {
          "dayOfWeek": 1,
          "workoutId": "TMP-002",
          "sessionType": "tempo",
          "isKeySession": true,
          "estimatedDurationMin": 36,
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
          "dayOfWeek": 3,
          "workoutId": "HIL-001",
          "sessionType": "hills",
          "isKeySession": true,
          "estimatedDurationMin": 52,
          "notes": "Allure seuil : 5:14 - 5:26/km",
          "notesEn": "Threshold pace: 5:14 - 5:26/km",
          "targetDurationMin": 59,
          "loadScore": 76.7,
          "paceNotes": [],
          "targetDistanceKm": 8
        },
        {
          "dayOfWeek": 4,
          "workoutId": "END-004",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 86,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 86,
          "loadScore": 72.8,
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
          "dayOfWeek": 6,
          "workoutId": "SL-005",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 106,
          "notes": "Allure endurance : 6:09 - 7:06/km\nSortie longue : 16 km (~106 min)",
          "notesEn": "Easy pace: 6:09 - 7:06/km\nLong run: 16 km (~106 min)",
          "targetDurationMin": 106,
          "loadScore": 74.2,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 16
        },
        {
          "dayOfWeek": 2,
          "workoutId": "STR-001",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 35,
          "loadScore": 18
        }
      ],
      "weekLabel": "S2",
      "weekLabelEn": "W2",
      "targetKm": 56,
      "targetLongRunKm": 16,
      "weeklyLoadScore": 359
    },
    {
      "weekNumber": 3,
      "phase": "base",
      "isRecoveryWeek": false,
      "volumePercent": 78,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "END-010",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 109,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 109,
          "loadScore": 86.6,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 16.5
        },
        {
          "dayOfWeek": 1,
          "workoutId": "FAR-015",
          "sessionType": "fartlek",
          "isKeySession": true,
          "estimatedDurationMin": 46,
          "notes": "Allure seuil : 5:14 - 5:26/km",
          "notesEn": "Threshold pace: 5:14 - 5:26/km",
          "targetDurationMin": 50,
          "loadScore": 85,
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
          "dayOfWeek": 3,
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
          "targetDistanceKm": 6
        },
        {
          "dayOfWeek": 4,
          "workoutId": "REC-009",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 119,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 119,
          "loadScore": 99,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 18
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-005",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 89,
          "notes": "Allure endurance : 6:09 - 7:06/km\nSortie longue : 13.5 km (~89 min)",
          "notesEn": "Easy pace: 6:09 - 7:06/km\nLong run: 13.5 km (~89 min)",
          "targetDurationMin": 89,
          "loadScore": 62.3,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 13.5
        },
        {
          "dayOfWeek": 2,
          "workoutId": "STR-016",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 33,
          "loadScore": 10
        }
      ],
      "weekLabel": "S3",
      "weekLabelEn": "W3",
      "targetKm": 62,
      "targetLongRunKm": 13.5,
      "weeklyLoadScore": 383
    },
    {
      "weekNumber": 4,
      "phase": "base",
      "isRecoveryWeek": true,
      "volumePercent": 55,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "END-021",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 56,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 56,
          "loadScore": 57.7,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 8.5
        },
        {
          "dayOfWeek": 1,
          "workoutId": "END-005",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 53,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 53,
          "loadScore": 46.7,
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
          "dayOfWeek": 3,
          "workoutId": "END-012",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 43,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 43,
          "loadScore": 45.5,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 6.5
        },
        {
          "dayOfWeek": 4,
          "workoutId": "END-002",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 56,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 56,
          "loadScore": 59.5,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 8.5
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-001",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 83,
          "notes": "Allure marathon : 5:46 - 5:55/km\nSortie longue : 12.5 km (~83 min)",
          "notesEn": "Marathon pace: 5:46 - 5:55/km\nLong run: 12.5 km (~83 min)",
          "targetDurationMin": 83,
          "loadScore": 58.1,
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
          "targetDistanceKm": 12.5
        },
        {
          "dayOfWeek": 2,
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
      "targetKm": 44,
      "targetLongRunKm": 12.5,
      "weeklyLoadScore": 276
    },
    {
      "weekNumber": 5,
      "phase": "base",
      "isRecoveryWeek": false,
      "volumePercent": 81,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "END-010",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 109,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 109,
          "loadScore": 82.5,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 16.5
        },
        {
          "dayOfWeek": 1,
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
          "dayOfWeek": 3,
          "workoutId": "HIL-001",
          "sessionType": "hills",
          "isKeySession": true,
          "estimatedDurationMin": 57,
          "notes": "Allure seuil : 5:14 - 5:26/km",
          "notesEn": "Threshold pace: 5:14 - 5:26/km",
          "targetDurationMin": 59,
          "loadScore": 76.7,
          "paceNotes": [],
          "targetDistanceKm": 8.5
        },
        {
          "dayOfWeek": 4,
          "workoutId": "END-021",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 89,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 89,
          "loadScore": 66.2,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 13.5
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-001",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 136,
          "notes": "Allure marathon : 5:46 - 5:55/km\nSortie longue : 20.5 km (~136 min)",
          "notesEn": "Marathon pace: 5:46 - 5:55/km\nLong run: 20.5 km (~136 min)",
          "targetDurationMin": 136,
          "loadScore": 95.2,
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
          "targetDistanceKm": 20.5
        },
        {
          "dayOfWeek": 2,
          "workoutId": "STR-002",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 45,
          "loadScore": 31
        }
      ],
      "weekLabel": "S5",
      "weekLabelEn": "W5",
      "targetKm": 65,
      "targetLongRunKm": 20.5,
      "weeklyLoadScore": 392
    },
    {
      "weekNumber": 6,
      "phase": "base",
      "isRecoveryWeek": false,
      "volumePercent": 81,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "REC-009",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 119,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 119,
          "loadScore": 89.4,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 18
        },
        {
          "dayOfWeek": 1,
          "workoutId": "FAR-015",
          "sessionType": "fartlek",
          "isKeySession": true,
          "estimatedDurationMin": 57,
          "notes": "Allure seuil : 5:14 - 5:26/km",
          "notesEn": "Threshold pace: 5:14 - 5:26/km",
          "targetDurationMin": 59,
          "loadScore": 100.9,
          "paceNotes": [
            {
              "zone": "T",
              "paceMinKm": 5.24,
              "paceMaxKm": 5.43,
              "description": "Allure seuil",
              "descriptionEn": "Threshold pace"
            }
          ],
          "targetDistanceKm": 9.5
        },
        {
          "dayOfWeek": 3,
          "workoutId": "TMP-002",
          "sessionType": "tempo",
          "isKeySession": true,
          "estimatedDurationMin": 46,
          "notes": "Allure marathon : 5:46 - 5:55/km",
          "notesEn": "Marathon pace: 5:46 - 5:55/km",
          "targetDurationMin": 47,
          "loadScore": 46.7,
          "paceNotes": [
            {
              "zone": "M",
              "paceMinKm": 5.77,
              "paceMaxKm": 5.92,
              "description": "Allure marathon",
              "descriptionEn": "Marathon pace"
            }
          ],
          "targetDistanceKm": 7
        },
        {
          "dayOfWeek": 4,
          "workoutId": "END-004",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 86,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 86,
          "loadScore": 64.2,
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
          "dayOfWeek": 6,
          "workoutId": "SL-005",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 116,
          "notes": "Allure endurance : 6:09 - 7:06/km\nSortie longue : 17.5 km (~116 min)",
          "notesEn": "Easy pace: 6:09 - 7:06/km\nLong run: 17.5 km (~116 min)",
          "targetDurationMin": 116,
          "loadScore": 81.2,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 17.5
        },
        {
          "dayOfWeek": 2,
          "workoutId": "STR-014",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 23,
          "loadScore": 7
        }
      ],
      "weekLabel": "S6",
      "weekLabelEn": "W6",
      "targetKm": 65,
      "targetLongRunKm": 17.5,
      "weeklyLoadScore": 389
    },
    {
      "weekNumber": 7,
      "phase": "base",
      "isRecoveryWeek": false,
      "volumePercent": 86,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "END-002",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 89,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 89,
          "loadScore": 61.4,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 13.5
        },
        {
          "dayOfWeek": 1,
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
          "dayOfWeek": 3,
          "workoutId": "FAR-002",
          "sessionType": "fartlek",
          "isKeySession": true,
          "estimatedDurationMin": 55,
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
          "targetDistanceKm": 10.5
        },
        {
          "dayOfWeek": 4,
          "workoutId": "END-017",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 89,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 89,
          "loadScore": 61.4,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 13.5
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-001",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 149,
          "notes": "Allure marathon : 5:46 - 5:55/km\nSortie longue : 22.5 km (~149 min)",
          "notesEn": "Marathon pace: 5:46 - 5:55/km\nLong run: 22.5 km (~149 min)",
          "targetDurationMin": 149,
          "loadScore": 104.3,
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
          "targetDistanceKm": 22.5
        },
        {
          "dayOfWeek": 2,
          "workoutId": "STR-008",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 28,
          "loadScore": 14
        }
      ],
      "weekLabel": "S7",
      "weekLabelEn": "W7",
      "targetKm": 69,
      "targetLongRunKm": 22.5,
      "weeklyLoadScore": 411
    },
    {
      "weekNumber": 8,
      "phase": "base",
      "isRecoveryWeek": true,
      "volumePercent": 68,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "END-005",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 60,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 60,
          "loadScore": 52.5,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 9
        },
        {
          "dayOfWeek": 1,
          "workoutId": "END-012",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 56,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 56,
          "loadScore": 54.1,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 8.5
        },
        {
          "dayOfWeek": 3,
          "workoutId": "END-015",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 76,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 76,
          "loadScore": 75.1,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 11.5
        },
        {
          "dayOfWeek": 4,
          "workoutId": "END-014",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 50,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 50,
          "loadScore": 47.3,
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
          "estimatedDurationMin": 113,
          "notes": "Allure endurance : 6:09 - 7:06/km\nSortie longue : 17 km (~113 min)",
          "notesEn": "Easy pace: 6:09 - 7:06/km\nLong run: 17 km (~113 min)",
          "targetDurationMin": 113,
          "loadScore": 79.1,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 17
        },
        {
          "dayOfWeek": 2,
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
      "targetKm": 54,
      "targetLongRunKm": 17,
      "weeklyLoadScore": 315
    },
    {
      "weekNumber": 9,
      "phase": "build",
      "isRecoveryWeek": false,
      "volumePercent": 93,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "REC-009",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 126,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 126,
          "loadScore": 88.7,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 19
        },
        {
          "dayOfWeek": 1,
          "workoutId": "TMP-012",
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
          "dayOfWeek": 3,
          "workoutId": "THR-020",
          "sessionType": "threshold",
          "isKeySession": true,
          "estimatedDurationMin": 71,
          "notes": "Allure seuil : 5:14 - 5:26/km",
          "notesEn": "Threshold pace: 5:14 - 5:26/km",
          "targetDurationMin": 71,
          "loadScore": 92.3,
          "paceNotes": [
            {
              "zone": "T",
              "paceMinKm": 5.24,
              "paceMaxKm": 5.43,
              "description": "Allure seuil",
              "descriptionEn": "Threshold pace"
            }
          ],
          "targetDistanceKm": 12
        },
        {
          "dayOfWeek": 4,
          "workoutId": "END-002",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 89,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 89,
          "loadScore": 61.4,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 13.5
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-005",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 139,
          "notes": "Allure endurance : 6:09 - 7:06/km\nSortie longue : 21 km (~139 min)",
          "notesEn": "Easy pace: 6:09 - 7:06/km\nLong run: 21 km (~139 min)",
          "targetDurationMin": 139,
          "loadScore": 97.3,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 21
        },
        {
          "dayOfWeek": 2,
          "workoutId": "STR-009",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 35,
          "loadScore": 25
        }
      ],
      "weekLabel": "S9",
      "weekLabelEn": "W9",
      "targetKm": 74,
      "targetLongRunKm": 21,
      "weeklyLoadScore": 415
    },
    {
      "weekNumber": 10,
      "phase": "build",
      "isRecoveryWeek": false,
      "volumePercent": 90,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "END-021",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 89,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 89,
          "loadScore": 66.2,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 13.5
        },
        {
          "dayOfWeek": 1,
          "workoutId": "TMP-008",
          "sessionType": "race_specific",
          "isKeySession": true,
          "estimatedDurationMin": 57,
          "notes": "Allure marathon : 5:46 - 5:55/km",
          "notesEn": "Marathon pace: 5:46 - 5:55/km",
          "targetDurationMin": 59,
          "loadScore": 59.4,
          "paceNotes": [
            {
              "zone": "M",
              "paceMinKm": 5.77,
              "paceMaxKm": 5.92,
              "description": "Allure marathon",
              "descriptionEn": "Marathon pace"
            }
          ],
          "targetDistanceKm": 9.5
        },
        {
          "dayOfWeek": 3,
          "workoutId": "TMP-009",
          "sessionType": "tempo",
          "isKeySession": true,
          "estimatedDurationMin": 53,
          "notes": "Allure seuil : 5:14 - 5:26/km",
          "notesEn": "Threshold pace: 5:14 - 5:26/km",
          "targetDurationMin": 54,
          "loadScore": 54,
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
          "workoutId": "END-004",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 86,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 86,
          "loadScore": 64.2,
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
          "dayOfWeek": 6,
          "workoutId": "SL-001",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 176,
          "notes": "Allure marathon : 5:46 - 5:55/km\nSortie longue : 26.5 km (~176 min)",
          "notesEn": "Marathon pace: 5:46 - 5:55/km\nLong run: 26.5 km (~176 min)",
          "targetDurationMin": 176,
          "loadScore": 123.2,
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
          "targetDistanceKm": 26.5
        },
        {
          "dayOfWeek": 2,
          "workoutId": "STR-003",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 50,
          "loadScore": 45
        }
      ],
      "weekLabel": "S10",
      "weekLabelEn": "W10",
      "targetKm": 72,
      "targetLongRunKm": 26.5,
      "weeklyLoadScore": 412
    },
    {
      "weekNumber": 11,
      "phase": "build",
      "isRecoveryWeek": false,
      "volumePercent": 99,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "END-002",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 89,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 89,
          "loadScore": 61.4,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 13.5
        },
        {
          "dayOfWeek": 1,
          "workoutId": "THR-007",
          "sessionType": "threshold",
          "isKeySession": true,
          "estimatedDurationMin": 69,
          "notes": "Allure seuil : 5:14 - 5:26/km\n3 répétitions",
          "notesEn": "Threshold pace: 5:14 - 5:26/km\n3 repetitions",
          "targetDurationMin": 69,
          "loadScore": 89.7,
          "paceNotes": [
            {
              "zone": "T",
              "paceMinKm": 5.24,
              "paceMaxKm": 5.43,
              "description": "Allure seuil",
              "descriptionEn": "Threshold pace"
            }
          ],
          "scaledRepetitions": 3,
          "targetDistanceKm": 11.5
        },
        {
          "dayOfWeek": 3,
          "workoutId": "TMP-019",
          "sessionType": "race_specific",
          "isKeySession": true,
          "estimatedDurationMin": 60,
          "notes": "Allure marathon : 5:46 - 5:55/km",
          "notesEn": "Marathon pace: 5:46 - 5:55/km",
          "targetDurationMin": 60,
          "loadScore": 60,
          "paceNotes": [
            {
              "zone": "M",
              "paceMinKm": 5.77,
              "paceMaxKm": 5.92,
              "description": "Allure marathon",
              "descriptionEn": "Marathon pace"
            }
          ],
          "targetDistanceKm": 10
        },
        {
          "dayOfWeek": 4,
          "workoutId": "END-010",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 103,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 103,
          "loadScore": 70.8,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 15.5
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-001",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 189,
          "notes": "Allure marathon : 5:46 - 5:55/km\nSortie longue : 28.5 km (~189 min)",
          "notesEn": "Marathon pace: 5:46 - 5:55/km\nLong run: 28.5 km (~189 min)",
          "targetDurationMin": 189,
          "loadScore": 132.3,
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
          "targetDistanceKm": 28.5
        },
        {
          "dayOfWeek": 2,
          "workoutId": "STR-005",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 45,
          "loadScore": 41
        }
      ],
      "weekLabel": "S11",
      "weekLabelEn": "W11",
      "targetKm": 79,
      "targetLongRunKm": 28.5,
      "weeklyLoadScore": 455
    },
    {
      "weekNumber": 12,
      "phase": "build",
      "isRecoveryWeek": true,
      "volumePercent": 66,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "END-015",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 70,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 70,
          "loadScore": 68.6,
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
          "dayOfWeek": 1,
          "workoutId": "END-005",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 56,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 56,
          "loadScore": 49.6,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 8.5
        },
        {
          "dayOfWeek": 3,
          "workoutId": "END-012",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 50,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 50,
          "loadScore": 47.7,
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
          "dayOfWeek": 4,
          "workoutId": "END-021",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 63,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 63,
          "loadScore": 59.9,
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
          "dayOfWeek": 6,
          "workoutId": "SL-005",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 113,
          "notes": "Allure endurance : 6:09 - 7:06/km\nSortie longue : 17 km (~113 min)",
          "notesEn": "Easy pace: 6:09 - 7:06/km\nLong run: 17 km (~113 min)",
          "targetDurationMin": 113,
          "loadScore": 79.1,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 17
        },
        {
          "dayOfWeek": 2,
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
      "targetKm": 53,
      "targetLongRunKm": 17,
      "weeklyLoadScore": 313
    },
    {
      "weekNumber": 13,
      "phase": "build",
      "isRecoveryWeek": false,
      "volumePercent": 100,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "END-015",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 96,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 96,
          "loadScore": 67.7,
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
          "workoutId": "TMP-019",
          "sessionType": "race_specific",
          "isKeySession": true,
          "estimatedDurationMin": 60,
          "notes": "Allure marathon : 5:46 - 5:55/km",
          "notesEn": "Marathon pace: 5:46 - 5:55/km",
          "targetDurationMin": 60,
          "loadScore": 60,
          "paceNotes": [
            {
              "zone": "M",
              "paceMinKm": 5.77,
              "paceMaxKm": 5.92,
              "description": "Allure marathon",
              "descriptionEn": "Marathon pace"
            }
          ],
          "targetDistanceKm": 10
        },
        {
          "dayOfWeek": 3,
          "workoutId": "TMP-012",
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
          "dayOfWeek": 4,
          "workoutId": "END-010",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 109,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 109,
          "loadScore": 75.3,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 16.5
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-005",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 205,
          "notes": "Allure endurance : 6:09 - 7:06/km\nSortie longue : 31 km (~205 min)",
          "notesEn": "Easy pace: 6:09 - 7:06/km\nLong run: 31 km (~205 min)",
          "targetDurationMin": 205,
          "loadScore": 143.5,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 31
        },
        {
          "dayOfWeek": 2,
          "workoutId": "STR-008",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 28,
          "loadScore": 14
        }
      ],
      "weekLabel": "S13",
      "weekLabelEn": "W13",
      "targetKm": 80,
      "targetLongRunKm": 31,
      "weeklyLoadScore": 411
    },
    {
      "weekNumber": 14,
      "phase": "peak",
      "isRecoveryWeek": false,
      "volumePercent": 93,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "END-004",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 86,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 86,
          "loadScore": 64.2,
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
          "workoutId": "VMA-010",
          "sessionType": "vo2max",
          "isKeySession": true,
          "estimatedDurationMin": 50,
          "notes": "Allure VMA : 4:37 - 4:52/km\n6 répétitions",
          "notesEn": "VO2max pace: 4:37 - 4:52/km\n6 repetitions",
          "targetDurationMin": 51,
          "loadScore": 86.7,
          "paceNotes": [
            {
              "zone": "I",
              "paceMinKm": 4.62,
              "paceMaxKm": 4.86,
              "description": "Allure VMA",
              "descriptionEn": "VO2max pace"
            }
          ],
          "scaledRepetitions": 6,
          "targetDistanceKm": 8.5
        },
        {
          "dayOfWeek": 3,
          "workoutId": "TMP-001",
          "sessionType": "tempo",
          "isKeySession": true,
          "estimatedDurationMin": 53,
          "notes": "Allure marathon : 5:46 - 5:55/km",
          "notesEn": "Marathon pace: 5:46 - 5:55/km",
          "targetDurationMin": 55,
          "loadScore": 55,
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
          "workoutId": "END-017",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 89,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 89,
          "loadScore": 64.7,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 13.5
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-002",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 199,
          "notes": "Allure marathon : 5:46 - 5:55/km\nSortie longue : 30 km (~199 min)",
          "notesEn": "Marathon pace: 5:46 - 5:55/km\nLong run: 30 km (~199 min)",
          "targetDurationMin": 199,
          "loadScore": 139.3,
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
          "targetDistanceKm": 30
        },
        {
          "dayOfWeek": 2,
          "workoutId": "STR-013",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 28,
          "loadScore": 24
        }
      ],
      "weekLabel": "S14",
      "weekLabelEn": "W14",
      "targetKm": 74,
      "targetLongRunKm": 30,
      "weeklyLoadScore": 434
    },
    {
      "weekNumber": 15,
      "phase": "peak",
      "isRecoveryWeek": false,
      "volumePercent": 96,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "END-002",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 89,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 89,
          "loadScore": 61.4,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 13.5
        },
        {
          "dayOfWeek": 1,
          "workoutId": "TMP-008",
          "sessionType": "race_specific",
          "isKeySession": true,
          "estimatedDurationMin": 59,
          "notes": "Allure marathon : 5:46 - 5:55/km",
          "notesEn": "Marathon pace: 5:46 - 5:55/km",
          "targetDurationMin": 59,
          "loadScore": 59.4,
          "paceNotes": [
            {
              "zone": "M",
              "paceMinKm": 5.77,
              "paceMaxKm": 5.92,
              "description": "Allure marathon",
              "descriptionEn": "Marathon pace"
            }
          ],
          "targetDistanceKm": 9.5
        },
        {
          "dayOfWeek": 3,
          "workoutId": "VMA-001",
          "sessionType": "vo2max",
          "isKeySession": true,
          "estimatedDurationMin": 73,
          "notes": "Allure VMA : 4:37 - 4:52/km\n14 répétitions",
          "notesEn": "VO2max pace: 4:37 - 4:52/km\n14 repetitions",
          "targetDurationMin": 73,
          "loadScore": 124.4,
          "paceNotes": [
            {
              "zone": "I",
              "paceMinKm": 4.62,
              "paceMaxKm": 4.86,
              "description": "Allure VMA",
              "descriptionEn": "VO2max pace"
            }
          ],
          "scaledRepetitions": 14,
          "targetDistanceKm": 12
        },
        {
          "dayOfWeek": 4,
          "workoutId": "END-021",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 89,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 89,
          "loadScore": 62.7,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 13.5
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-010",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 186,
          "notes": "Allure marathon : 5:46 - 5:55/km\nSortie longue : 28 km (~186 min)",
          "notesEn": "Marathon pace: 5:46 - 5:55/km\nLong run: 28 km (~186 min)",
          "targetDurationMin": 186,
          "loadScore": 130.2,
          "paceNotes": [
            {
              "zone": "M",
              "paceMinKm": 5.77,
              "paceMaxKm": 5.92,
              "description": "Allure marathon",
              "descriptionEn": "Marathon pace"
            }
          ],
          "targetDistanceKm": 28
        },
        {
          "dayOfWeek": 2,
          "workoutId": "STR-012",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 38,
          "loadScore": 32
        }
      ],
      "weekLabel": "S15",
      "weekLabelEn": "W15",
      "targetKm": 77,
      "targetLongRunKm": 28,
      "weeklyLoadScore": 470
    },
    {
      "weekNumber": 16,
      "phase": "taper",
      "isRecoveryWeek": false,
      "volumePercent": 57,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "REC-007",
          "sessionType": "recovery",
          "isKeySession": false,
          "estimatedDurationMin": 40,
          "notes": "Allure seuil : 5:14 - 5:26/km",
          "notesEn": "Threshold pace: 5:14 - 5:26/km",
          "targetDurationMin": 40,
          "loadScore": 35,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            },
            {
              "zone": "T",
              "paceMinKm": 5.24,
              "paceMaxKm": 5.43,
              "description": "Allure seuil",
              "descriptionEn": "Threshold pace"
            }
          ],
          "targetDistanceKm": 6
        },
        {
          "dayOfWeek": 1,
          "workoutId": "TMP-015",
          "sessionType": "tempo",
          "isKeySession": true,
          "estimatedDurationMin": 40,
          "notes": "Allure marathon : 5:46 - 5:55/km",
          "notesEn": "Marathon pace: 5:46 - 5:55/km",
          "targetDurationMin": 44,
          "loadScore": 44.4,
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
          "dayOfWeek": 3,
          "workoutId": "RP-008",
          "sessionType": "race_specific",
          "isKeySession": true,
          "estimatedDurationMin": 44,
          "notes": "Allure seuil : 5:14 - 5:26/km",
          "notesEn": "Threshold pace: 5:14 - 5:26/km",
          "targetDurationMin": 53,
          "loadScore": 52.5,
          "paceNotes": [
            {
              "zone": "T",
              "paceMinKm": 5.24,
              "paceMaxKm": 5.43,
              "description": "Allure seuil",
              "descriptionEn": "Threshold pace"
            }
          ],
          "targetDistanceKm": 7
        },
        {
          "dayOfWeek": 4,
          "workoutId": "REC-012",
          "sessionType": "recovery",
          "isKeySession": false,
          "estimatedDurationMin": 40,
          "notes": "Allure seuil : 5:14 - 5:26/km",
          "notesEn": "Threshold pace: 5:14 - 5:26/km",
          "targetDurationMin": 40,
          "loadScore": 36.4,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            },
            {
              "zone": "T",
              "paceMinKm": 5.24,
              "paceMaxKm": 5.43,
              "description": "Allure seuil",
              "descriptionEn": "Threshold pace"
            }
          ],
          "targetDistanceKm": 6
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-012",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 139,
          "notes": "Allure endurance : 6:09 - 7:06/km\nSortie longue : 21 km (~139 min)",
          "notesEn": "Easy pace: 6:09 - 7:06/km\nLong run: 21 km (~139 min)",
          "targetDurationMin": 139,
          "loadScore": 97.3,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 21
        },
        {
          "dayOfWeek": 2,
          "workoutId": "STR-017",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 28,
          "loadScore": 14
        }
      ],
      "weekLabel": "S16",
      "weekLabelEn": "W16",
      "targetKm": 46,
      "targetLongRunKm": 21,
      "weeklyLoadScore": 280
    },
    {
      "weekNumber": 17,
      "phase": "taper",
      "isRecoveryWeek": false,
      "volumePercent": 41,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "REC-006",
          "sessionType": "recovery",
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
          "dayOfWeek": 1,
          "workoutId": "RP-016",
          "sessionType": "race_specific",
          "isKeySession": true,
          "estimatedDurationMin": 28,
          "notes": "Allure VMA : 4:37 - 4:52/km",
          "notesEn": "VO2max pace: 4:37 - 4:52/km",
          "targetDurationMin": 39,
          "loadScore": 39,
          "paceNotes": [
            {
              "zone": "I",
              "paceMinKm": 4.62,
              "paceMaxKm": 4.86,
              "description": "Allure VMA",
              "descriptionEn": "VO2max pace"
            },
            {
              "zone": "T",
              "paceMinKm": 5.24,
              "paceMaxKm": 5.43,
              "description": "Allure seuil",
              "descriptionEn": "Threshold pace"
            },
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 4
        },
        {
          "dayOfWeek": 3,
          "workoutId": "TMP-015",
          "sessionType": "tempo",
          "isKeySession": true,
          "estimatedDurationMin": 30,
          "notes": "Allure marathon : 5:46 - 5:55/km",
          "notesEn": "Marathon pace: 5:46 - 5:55/km",
          "targetDurationMin": 37,
          "loadScore": 37,
          "paceNotes": [
            {
              "zone": "M",
              "paceMinKm": 5.77,
              "paceMaxKm": 5.92,
              "description": "Allure marathon",
              "descriptionEn": "Marathon pace"
            }
          ],
          "targetDistanceKm": 4.5
        },
        {
          "dayOfWeek": 4,
          "workoutId": "REC-007",
          "sessionType": "recovery",
          "isKeySession": false,
          "estimatedDurationMin": 40,
          "notes": "Allure seuil : 5:14 - 5:26/km",
          "notesEn": "Threshold pace: 5:14 - 5:26/km",
          "targetDurationMin": 40,
          "loadScore": 35,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            },
            {
              "zone": "T",
              "paceMinKm": 5.24,
              "paceMaxKm": 5.43,
              "description": "Allure seuil",
              "descriptionEn": "Threshold pace"
            }
          ],
          "targetDistanceKm": 6
        },
        {
          "dayOfWeek": 6,
          "workoutId": "LR-014",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 86,
          "notes": "Allure endurance : 6:09 - 7:06/km\nSortie longue : 13 km (~86 min)",
          "notesEn": "Easy pace: 6:09 - 7:06/km\nLong run: 13 km (~86 min)",
          "targetDurationMin": 86,
          "loadScore": 60.2,
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
          "dayOfWeek": 2,
          "workoutId": "STR-017",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 28,
          "loadScore": 14
        }
      ],
      "weekLabel": "S17",
      "weekLabelEn": "W17",
      "targetKm": 33,
      "targetLongRunKm": 13,
      "weeklyLoadScore": 209
    },
    {
      "weekNumber": 18,
      "phase": "taper",
      "isRecoveryWeek": false,
      "volumePercent": 20,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "REC-001",
          "sessionType": "recovery",
          "isKeySession": false,
          "estimatedDurationMin": 25,
          "notes": "Footing léger - semaine de course",
          "notesEn": "Easy jog - race week",
          "targetDistanceKm": 4,
          "loadScore": 17.5
        },
        {
          "dayOfWeek": 1,
          "workoutId": "REC-002",
          "sessionType": "recovery",
          "isKeySession": false,
          "estimatedDurationMin": 25,
          "notes": "Footing léger - semaine de course",
          "notesEn": "Easy jog - race week",
          "targetDistanceKm": 4,
          "loadScore": 17.5
        },
        {
          "dayOfWeek": 2,
          "workoutId": "REC-003",
          "sessionType": "recovery",
          "isKeySession": false,
          "estimatedDurationMin": 25,
          "notes": "Footing léger - semaine de course",
          "notesEn": "Easy jog - race week",
          "targetDistanceKm": 4,
          "loadScore": 17.5
        },
        {
          "dayOfWeek": 4,
          "workoutId": "REC-011",
          "sessionType": "recovery",
          "isKeySession": false,
          "estimatedDurationMin": 25,
          "notes": "Activation pré-course : footing léger + quelques accélérations",
          "notesEn": "Pre-race activation: easy jog + a few strides",
          "targetDistanceKm": 4,
          "loadScore": 17.5
        },
        {
          "dayOfWeek": 6,
          "workoutId": "__race_day__",
          "sessionType": "race_specific",
          "isKeySession": true,
          "estimatedDurationMin": 0,
          "notes": "Jour de course - marathon",
          "notesEn": "Race day - marathon"
        },
        {
          "dayOfWeek": 3,
          "workoutId": "STR-016",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 33,
          "loadScore": 10
        }
      ],
      "weekLabel": "Semaine de course",
      "weekLabelEn": "Race week",
      "targetKm": 16,
      "weeklyLoadScore": 80
    }
  ],
  "tags": [
    "marathon",
    "intermediate",
    "long-distance"
  ],
  "version": 2,
  "planPurpose": "race",
  "trainingGoal": "time",
  "peakWeeklyKm": 80,
  "peakLongRunKm": 31
};
