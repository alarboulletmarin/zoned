import type { PrebuiltPlan } from "../types";

export const planSemiMarathon: PrebuiltPlan = {
  "id": "semi-marathon",
  "slug": "semi-marathon",
  "name": "Semi-marathon",
  "nameEn": "Half Marathon",
  "description": "Plan de 14 semaines pour le semi-marathon. Sorties longues progressives et travail au seuil.",
  "descriptionEn": "14-week half marathon plan. Progressive long runs and threshold work.",
  "icon": "Route",
  "difficulty": "intermediate",
  "raceDistance": "semi",
  "sessionsPerWeek": 4,
  "totalWeeks": 14,
  "phases": [
    {
      "phase": "base",
      "startWeek": 1,
      "endWeek": 6
    },
    {
      "phase": "build",
      "startWeek": 7,
      "endWeek": 10
    },
    {
      "phase": "peak",
      "startWeek": 11,
      "endWeek": 12
    },
    {
      "phase": "taper",
      "startWeek": 13,
      "endWeek": 14
    }
  ],
  "weeks": [
    {
      "weekNumber": 1,
      "phase": "base",
      "isRecoveryWeek": false,
      "volumePercent": 77,
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
          "dayOfWeek": 2,
          "workoutId": "FAR-001",
          "sessionType": "fartlek",
          "isKeySession": true,
          "estimatedDurationMin": 48,
          "notes": "Allure seuil : 5:14 - 5:26/km",
          "notesEn": "Threshold pace: 5:14 - 5:26/km",
          "targetDurationMin": 55,
          "loadScore": 94.2,
          "paceNotes": [
            {
              "zone": "T",
              "paceMinKm": 5.24,
              "paceMaxKm": 5.43,
              "description": "Allure seuil",
              "descriptionEn": "Threshold pace"
            }
          ],
          "targetDistanceKm": 8
        },
        {
          "dayOfWeek": 4,
          "workoutId": "HIL-001",
          "sessionType": "hills",
          "isKeySession": true,
          "estimatedDurationMin": 63,
          "notes": "Allure seuil : 5:14 - 5:26/km",
          "notesEn": "Threshold pace: 5:14 - 5:26/km",
          "targetDurationMin": 70,
          "loadScore": 91.1,
          "paceNotes": [],
          "targetDistanceKm": 9.5
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-001",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 82,
          "notes": "Allure marathon : 5:46 - 5:55/km\nSortie longue : 9.5 km (~63 min)",
          "notesEn": "Marathon pace: 5:46 - 5:55/km\nLong run: 9.5 km (~63 min)",
          "targetDurationMin": 63,
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
      "weekLabel": "S1",
      "weekLabelEn": "W1",
      "targetKm": 38,
      "targetLongRunKm": 9.5,
      "weeklyLoadScore": 333
    },
    {
      "weekNumber": 2,
      "phase": "base",
      "isRecoveryWeek": false,
      "volumePercent": 85,
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
          "workoutId": "HIL-001",
          "sessionType": "hills",
          "isKeySession": true,
          "estimatedDurationMin": 65,
          "notes": "Allure seuil : 5:14 - 5:26/km",
          "notesEn": "Threshold pace: 5:14 - 5:26/km",
          "targetDurationMin": 69,
          "loadScore": 90.2,
          "paceNotes": [],
          "targetDistanceKm": 10
        },
        {
          "dayOfWeek": 4,
          "workoutId": "TMP-002",
          "sessionType": "tempo",
          "isKeySession": true,
          "estimatedDurationMin": 44,
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
          "dayOfWeek": 6,
          "workoutId": "SL-005",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 84,
          "notes": "Allure endurance : 6:09 - 7:06/km\nSortie longue : 11 km (~73 min)",
          "notesEn": "Easy pace: 6:09 - 7:06/km\nLong run: 11 km (~73 min)",
          "targetDurationMin": 73,
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
          "targetDistanceKm": 11
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
      "weekLabel": "S2",
      "weekLabelEn": "W2",
      "targetKm": 39,
      "targetLongRunKm": 11,
      "weeklyLoadScore": 270
    },
    {
      "weekNumber": 3,
      "phase": "base",
      "isRecoveryWeek": false,
      "volumePercent": 94,
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
          "dayOfWeek": 2,
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
          "workoutId": "FAR-010",
          "sessionType": "fartlek",
          "isKeySession": true,
          "estimatedDurationMin": 47,
          "notes": "Allure seuil : 5:14 - 5:26/km",
          "notesEn": "Threshold pace: 5:14 - 5:26/km",
          "targetDurationMin": 48,
          "loadScore": 81.3,
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
          "dayOfWeek": 6,
          "workoutId": "SL-001",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 95,
          "notes": "Allure marathon : 5:46 - 5:55/km\nSortie longue : 9 km (~60 min)",
          "notesEn": "Marathon pace: 5:46 - 5:55/km\nLong run: 9 km (~60 min)",
          "targetDurationMin": 60,
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
          "targetDistanceKm": 9
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
      "weekLabel": "S3",
      "weekLabelEn": "W3",
      "targetKm": 36,
      "targetLongRunKm": 9,
      "weeklyLoadScore": 272
    },
    {
      "weekNumber": 4,
      "phase": "base",
      "isRecoveryWeek": true,
      "volumePercent": 60,
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
          "loadScore": 71.1,
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
          "workoutId": "END-005",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 66,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 66,
          "loadScore": 58.3,
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
          "dayOfWeek": 4,
          "workoutId": "END-012",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 63,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 63,
          "loadScore": 60.5,
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
          "estimatedDurationMin": 65,
          "notes": "Allure endurance : 6:09 - 7:06/km\nSortie longue : 8.5 km (~56 min)",
          "notesEn": "Easy pace: 6:09 - 7:06/km\nLong run: 8.5 km (~56 min)",
          "targetDurationMin": 56,
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
          "targetDistanceKm": 8.5
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
      "targetKm": 39,
      "targetLongRunKm": 8.5,
      "weeklyLoadScore": 263
    },
    {
      "weekNumber": 5,
      "phase": "base",
      "isRecoveryWeek": false,
      "volumePercent": 100,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "END-005",
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
          "dayOfWeek": 4,
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
          "dayOfWeek": 6,
          "workoutId": "SL-001",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 100,
          "notes": "Allure marathon : 5:46 - 5:55/km\nSortie longue : 13.5 km (~89 min)",
          "notesEn": "Marathon pace: 5:46 - 5:55/km\nLong run: 13.5 km (~89 min)",
          "targetDurationMin": 89,
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
          "targetDistanceKm": 13.5
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
      "weekLabel": "S5",
      "weekLabelEn": "W5",
      "targetKm": 40,
      "targetLongRunKm": 13.5,
      "weeklyLoadScore": 269
    },
    {
      "weekNumber": 6,
      "phase": "base",
      "isRecoveryWeek": false,
      "volumePercent": 92,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "END-005",
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
          "workoutId": "FAR-007",
          "sessionType": "fartlek",
          "isKeySession": true,
          "estimatedDurationMin": 65,
          "notes": "Allure seuil : 5:14 - 5:26/km",
          "notesEn": "Threshold pace: 5:14 - 5:26/km",
          "targetDurationMin": 67,
          "loadScore": 114.3,
          "paceNotes": [
            {
              "zone": "T",
              "paceMinKm": 5.24,
              "paceMaxKm": 5.43,
              "description": "Allure seuil",
              "descriptionEn": "Threshold pace"
            }
          ],
          "targetDistanceKm": 11
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-005",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 89,
          "notes": "Allure endurance : 6:09 - 7:06/km\nSortie longue : 11.5 km (~76 min)",
          "notesEn": "Easy pace: 6:09 - 7:06/km\nLong run: 11.5 km (~76 min)",
          "targetDurationMin": 76,
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
          "targetDistanceKm": 11.5
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
      "weekLabel": "S6",
      "weekLabelEn": "W6",
      "targetKm": 41,
      "targetLongRunKm": 11.5,
      "weeklyLoadScore": 291
    },
    {
      "weekNumber": 7,
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
          "workoutId": "TMP-018",
          "sessionType": "tempo",
          "isKeySession": true,
          "estimatedDurationMin": 85,
          "notes": "Allure marathon : 5:46 - 5:55/km",
          "notesEn": "Marathon pace: 5:46 - 5:55/km",
          "targetDurationMin": 85,
          "loadScore": 85,
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
          "targetDistanceKm": 13.5
        },
        {
          "dayOfWeek": 4,
          "workoutId": "RP-003",
          "sessionType": "race_specific",
          "isKeySession": true,
          "estimatedDurationMin": 65,
          "notes": "Allure seuil : 5:14 - 5:26/km",
          "notesEn": "Threshold pace: 5:14 - 5:26/km",
          "targetDurationMin": 65,
          "loadScore": 65,
          "paceNotes": [
            {
              "zone": "T",
              "paceMinKm": 5.24,
              "paceMaxKm": 5.43,
              "description": "Allure seuil",
              "descriptionEn": "Threshold pace"
            }
          ],
          "targetDistanceKm": 11.5
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-001",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 100,
          "notes": "Allure marathon : 5:46 - 5:55/km\nSortie longue : 15 km (~99 min)",
          "notesEn": "Marathon pace: 5:46 - 5:55/km\nLong run: 15 km (~99 min)",
          "targetDurationMin": 99,
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
          "targetDistanceKm": 15
        },
        {
          "dayOfWeek": 1,
          "workoutId": "STR-003",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 50,
          "loadScore": 45
        }
      ],
      "weekLabel": "S7",
      "weekLabelEn": "W7",
      "targetKm": 45,
      "targetLongRunKm": 15,
      "weeklyLoadScore": 288
    },
    {
      "weekNumber": 8,
      "phase": "build",
      "isRecoveryWeek": true,
      "volumePercent": 65,
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
          "workoutId": "END-005",
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
          "dayOfWeek": 4,
          "workoutId": "END-004",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 86,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 86,
          "loadScore": 78,
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
          "estimatedDurationMin": 76,
          "notes": "Allure endurance : 6:09 - 7:06/km\nSortie longue : 11.5 km (~76 min)",
          "notesEn": "Easy pace: 6:09 - 7:06/km\nLong run: 11.5 km (~76 min)",
          "targetDurationMin": 76,
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
          "targetDistanceKm": 11.5
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
      "targetKm": 41,
      "targetLongRunKm": 11.5,
      "weeklyLoadScore": 239
    },
    {
      "weekNumber": 9,
      "phase": "build",
      "isRecoveryWeek": false,
      "volumePercent": 100,
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
          "workoutId": "THR-020",
          "sessionType": "threshold",
          "isKeySession": true,
          "estimatedDurationMin": 86,
          "notes": "Allure seuil : 5:14 - 5:26/km",
          "notesEn": "Threshold pace: 5:14 - 5:26/km",
          "targetDurationMin": 86,
          "loadScore": 111.5,
          "paceNotes": [
            {
              "zone": "T",
              "paceMinKm": 5.24,
              "paceMaxKm": 5.43,
              "description": "Allure seuil",
              "descriptionEn": "Threshold pace"
            }
          ],
          "targetDistanceKm": 14.5
        },
        {
          "dayOfWeek": 4,
          "workoutId": "TMP-005",
          "sessionType": "tempo",
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
          "dayOfWeek": 6,
          "workoutId": "SL-005",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 95,
          "notes": "Allure endurance : 6:09 - 7:06/km\nSortie longue : 14 km (~93 min)",
          "notesEn": "Easy pace: 6:09 - 7:06/km\nLong run: 14 km (~93 min)",
          "targetDurationMin": 93,
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
          "targetDistanceKm": 14
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
      "weekLabel": "S9",
      "weekLabelEn": "W9",
      "targetKm": 49,
      "targetLongRunKm": 14,
      "weeklyLoadScore": 314
    },
    {
      "weekNumber": 10,
      "phase": "build",
      "isRecoveryWeek": false,
      "volumePercent": 92,
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
          "dayOfWeek": 2,
          "workoutId": "TMP-014",
          "sessionType": "tempo",
          "isKeySession": true,
          "estimatedDurationMin": 58,
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
          "targetDistanceKm": 9
        },
        {
          "dayOfWeek": 4,
          "workoutId": "TMP-009",
          "sessionType": "race_specific",
          "isKeySession": true,
          "estimatedDurationMin": 52,
          "notes": "Allure seuil : 5:14 - 5:26/km",
          "notesEn": "Threshold pace: 5:14 - 5:26/km",
          "targetDurationMin": 55,
          "loadScore": 54.6,
          "paceNotes": [
            {
              "zone": "T",
              "paceMinKm": 5.24,
              "paceMaxKm": 5.43,
              "description": "Allure seuil",
              "descriptionEn": "Threshold pace"
            }
          ],
          "targetDistanceKm": 8.5
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-001",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 116,
          "notes": "Allure marathon : 5:46 - 5:55/km\nSortie longue : 17.5 km (~116 min)",
          "notesEn": "Marathon pace: 5:46 - 5:55/km\nLong run: 17.5 km (~116 min)",
          "targetDurationMin": 116,
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
          "targetDistanceKm": 17.5
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
      "weekLabel": "S10",
      "weekLabelEn": "W10",
      "targetKm": 48,
      "targetLongRunKm": 17.5,
      "weeklyLoadScore": 290
    },
    {
      "weekNumber": 11,
      "phase": "peak",
      "isRecoveryWeek": false,
      "volumePercent": 100,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "REC-004",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 60,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 60,
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
          "targetDistanceKm": 9
        },
        {
          "dayOfWeek": 2,
          "workoutId": "VMA-012",
          "sessionType": "vo2max",
          "isKeySession": true,
          "estimatedDurationMin": 68,
          "notes": "Allure VMA : 4:37 - 4:52/km\n10 répétitions",
          "notesEn": "VO2max pace: 4:37 - 4:52/km\n10 repetitions",
          "targetDurationMin": 68,
          "loadScore": 116.4,
          "paceNotes": [
            {
              "zone": "I",
              "paceMinKm": 4.62,
              "paceMaxKm": 4.86,
              "description": "Allure VMA",
              "descriptionEn": "VO2max pace"
            }
          ],
          "scaledRepetitions": 10,
          "targetDistanceKm": 11
        },
        {
          "dayOfWeek": 4,
          "workoutId": "TMP-009",
          "sessionType": "race_specific",
          "isKeySession": true,
          "estimatedDurationMin": 54,
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
          "dayOfWeek": 6,
          "workoutId": "SL-007",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 126,
          "notes": "Allure marathon : 5:46 - 5:55/km\nSortie longue : 19 km (~126 min)",
          "notesEn": "Marathon pace: 5:46 - 5:55/km\nLong run: 19 km (~126 min)",
          "targetDurationMin": 126,
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
          "targetDistanceKm": 19
        },
        {
          "dayOfWeek": 1,
          "workoutId": "STR-013",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 28,
          "loadScore": 24
        }
      ],
      "weekLabel": "S11",
      "weekLabelEn": "W11",
      "targetKm": 48,
      "targetLongRunKm": 19,
      "weeklyLoadScore": 306
    },
    {
      "weekNumber": 12,
      "phase": "peak",
      "isRecoveryWeek": true,
      "volumePercent": 65,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "REC-004",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 60,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 60,
          "loadScore": 63,
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
          "dayOfWeek": 2,
          "workoutId": "END-008",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 66,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 66,
          "loadScore": 63,
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
          "dayOfWeek": 4,
          "workoutId": "END-012",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 73,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 73,
          "loadScore": 70,
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
          "workoutId": "SL-002",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 82,
          "notes": "Allure marathon : 5:46 - 5:55/km\nSortie longue : 11 km (~74 min)",
          "notesEn": "Marathon pace: 5:46 - 5:55/km\nLong run: 11 km (~74 min)",
          "targetDurationMin": 74,
          "loadScore": 77,
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
      "targetKm": 41,
      "targetLongRunKm": 11,
      "weeklyLoadScore": 281
    },
    {
      "weekNumber": 13,
      "phase": "taper",
      "isRecoveryWeek": false,
      "volumePercent": 64,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "REC-002",
          "sessionType": "recovery",
          "isKeySession": false,
          "estimatedDurationMin": 46,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 46,
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
          "targetDistanceKm": 7
        },
        {
          "dayOfWeek": 2,
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
          "dayOfWeek": 4,
          "workoutId": "RP-016",
          "sessionType": "race_specific",
          "isKeySession": true,
          "estimatedDurationMin": 38,
          "notes": "Allure VMA : 4:37 - 4:52/km",
          "notesEn": "VO2max pace: 4:37 - 4:52/km",
          "targetDurationMin": 47,
          "loadScore": 46.8,
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
          "targetDistanceKm": 6
        },
        {
          "dayOfWeek": 6,
          "workoutId": "LR-014",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 83,
          "notes": "Allure endurance : 6:09 - 7:06/km\nSortie longue : 12.5 km (~83 min)",
          "notesEn": "Easy pace: 6:09 - 7:06/km\nLong run: 12.5 km (~83 min)",
          "targetDurationMin": 83,
          "loadScore": 31.5,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 12.5
        },
        {
          "dayOfWeek": 1,
          "workoutId": "STR-017",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 28,
          "loadScore": 14
        }
      ],
      "weekLabel": "S13",
      "weekLabelEn": "W13",
      "targetKm": 32,
      "targetLongRunKm": 12.5,
      "weeklyLoadScore": 179
    },
    {
      "weekNumber": 14,
      "phase": "taper",
      "isRecoveryWeek": false,
      "volumePercent": 35,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "REC-001",
          "sessionType": "recovery",
          "isKeySession": false,
          "estimatedDurationMin": 25,
          "notes": "Footing léger - semaine de course",
          "notesEn": "Easy jog - race week"
        },
        {
          "dayOfWeek": 1,
          "workoutId": "REC-002",
          "sessionType": "recovery",
          "isKeySession": false,
          "estimatedDurationMin": 25,
          "notes": "Footing léger - semaine de course",
          "notesEn": "Easy jog - race week"
        },
        {
          "dayOfWeek": 4,
          "workoutId": "REC-011",
          "sessionType": "recovery",
          "isKeySession": false,
          "estimatedDurationMin": 25,
          "notes": "Activation pré-course : footing léger + quelques accélérations",
          "notesEn": "Pre-race activation: easy jog + a few strides"
        },
        {
          "dayOfWeek": 6,
          "workoutId": "__race_day__",
          "sessionType": "race_specific",
          "isKeySession": true,
          "estimatedDurationMin": 0,
          "notes": "Jour de course - Semi-marathon",
          "notesEn": "Race day - Half Marathon"
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
      "weekLabel": "Semaine de course",
      "weekLabelEn": "Race week",
      "targetKm": 23
    }
  ],
  "tags": [
    "half-marathon",
    "semi",
    "intermediate"
  ],
  "version": 2,
  "planPurpose": "race",
  "trainingGoal": "time",
  "peakWeeklyKm": 49,
  "peakLongRunKm": 19
};
