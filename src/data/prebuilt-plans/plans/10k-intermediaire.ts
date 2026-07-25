import type { PrebuiltPlan } from "../types";

export const plan10kIntermediaire: PrebuiltPlan = {
  "id": "10k-intermediaire",
  "slug": "10k-intermediaire",
  "name": "10K intermédiaire",
  "nameEn": "10K Intermediate",
  "description": "Plan de 12 semaines pour performer sur 10K. Travail au seuil et VO2max.",
  "descriptionEn": "12-week plan to perform on 10K. Threshold and VO2max work.",
  "icon": "Timer",
  "difficulty": "intermediate",
  "raceDistance": "10K",
  "sessionsPerWeek": 4,
  "totalWeeks": 12,
  "phases": [
    {
      "phase": "base",
      "startWeek": 1,
      "endWeek": 5
    },
    {
      "phase": "build",
      "startWeek": 6,
      "endWeek": 8
    },
    {
      "phase": "peak",
      "startWeek": 9,
      "endWeek": 10
    },
    {
      "phase": "taper",
      "startWeek": 11,
      "endWeek": 12
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
          "dayOfWeek": 2,
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
          "dayOfWeek": 4,
          "workoutId": "TMP-002",
          "sessionType": "tempo",
          "isKeySession": true,
          "estimatedDurationMin": 44,
          "notes": "Allure marathon : 5:46 - 5:55/km",
          "notesEn": "Marathon pace: 5:46 - 5:55/km",
          "targetDurationMin": 47,
          "loadScore": 47.3,
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
          "workoutId": "SL-005",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 78,
          "notes": "Allure endurance : 6:09 - 7:06/km\nSortie longue : 10 km (~66 min)",
          "notesEn": "Easy pace: 6:09 - 7:06/km\nLong run: 10 km (~66 min)",
          "targetDurationMin": 66,
          "loadScore": 54.6,
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
      "weekLabel": "S1",
      "weekLabelEn": "W1",
      "targetKm": 37,
      "targetLongRunKm": 10,
      "weeklyLoadScore": 260
    },
    {
      "weekNumber": 2,
      "phase": "base",
      "isRecoveryWeek": false,
      "volumePercent": 81,
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
          "dayOfWeek": 4,
          "workoutId": "FAR-015",
          "sessionType": "fartlek",
          "isKeySession": true,
          "estimatedDurationMin": 55,
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
          "dayOfWeek": 6,
          "workoutId": "SL-001",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 88,
          "notes": "Allure marathon : 5:46 - 5:55/km\nSortie longue : 11.5 km (~76 min)",
          "notesEn": "Marathon pace: 5:46 - 5:55/km\nLong run: 11.5 km (~76 min)",
          "targetDurationMin": 76,
          "loadScore": 61.6,
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
      "weekLabel": "S2",
      "weekLabelEn": "W2",
      "targetKm": 39,
      "targetLongRunKm": 11.5,
      "weeklyLoadScore": 271
    },
    {
      "weekNumber": 3,
      "phase": "base",
      "isRecoveryWeek": false,
      "volumePercent": 88,
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
          "workoutId": "FAR-001",
          "sessionType": "fartlek",
          "isKeySession": true,
          "estimatedDurationMin": 52,
          "notes": "Allure seuil : 5:14 - 5:26/km",
          "notesEn": "Threshold pace: 5:14 - 5:26/km",
          "targetDurationMin": 54,
          "loadScore": 91.8,
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
          "workoutId": "HIL-001",
          "sessionType": "hills",
          "isKeySession": true,
          "estimatedDurationMin": 67,
          "notes": "Allure seuil : 5:14 - 5:26/km",
          "notesEn": "Threshold pace: 5:14 - 5:26/km",
          "targetDurationMin": 69,
          "loadScore": 90.2,
          "paceNotes": [],
          "targetDistanceKm": 10
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-005",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 89,
          "notes": "Allure endurance : 6:09 - 7:06/km\nSortie longue : 9.5 km (~63 min)",
          "notesEn": "Easy pace: 6:09 - 7:06/km\nLong run: 9.5 km (~63 min)",
          "targetDurationMin": 63,
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
          "targetDistanceKm": 9.5
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
      "weekLabel": "S3",
      "weekLabelEn": "W3",
      "targetKm": 42,
      "targetLongRunKm": 9.5,
      "weeklyLoadScore": 323
    },
    {
      "weekNumber": 4,
      "phase": "base",
      "isRecoveryWeek": true,
      "volumePercent": 65,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "END-004",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 56,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 56,
          "loadScore": 54.9,
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
          "dayOfWeek": 2,
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
          "workoutId": "END-014",
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
          "dayOfWeek": 6,
          "workoutId": "SL-005",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 65,
          "notes": "Allure endurance : 6:09 - 7:06/km\nSortie longue : 9 km (~58 min)",
          "notesEn": "Easy pace: 6:09 - 7:06/km\nLong run: 9 km (~58 min)",
          "targetDurationMin": 58,
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
      "weekLabel": "Semaine de récupération",
      "weekLabelEn": "Recovery Week",
      "targetKm": 31,
      "targetLongRunKm": 9,
      "weeklyLoadScore": 200
    },
    {
      "weekNumber": 5,
      "phase": "base",
      "isRecoveryWeek": false,
      "volumePercent": 85,
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
          "workoutId": "TMP-002",
          "sessionType": "tempo",
          "isKeySession": true,
          "estimatedDurationMin": 49,
          "notes": "Allure marathon : 5:46 - 5:55/km",
          "notesEn": "Marathon pace: 5:46 - 5:55/km",
          "targetDurationMin": 49,
          "loadScore": 49.2,
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
          "workoutId": "FAR-010",
          "sessionType": "fartlek",
          "isKeySession": true,
          "estimatedDurationMin": 50,
          "notes": "Allure seuil : 5:14 - 5:26/km",
          "notesEn": "Threshold pace: 5:14 - 5:26/km",
          "targetDurationMin": 50,
          "loadScore": 85.8,
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
          "workoutId": "STR-010",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 23,
          "loadScore": 12
        }
      ],
      "weekLabel": "S5",
      "weekLabelEn": "W5",
      "targetKm": 41,
      "targetLongRunKm": 14,
      "weeklyLoadScore": 268
    },
    {
      "weekNumber": 6,
      "phase": "build",
      "isRecoveryWeek": false,
      "volumePercent": 85,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "END-014",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 66,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 66,
          "loadScore": 48.5,
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
          "workoutId": "VMA-010",
          "sessionType": "vo2max",
          "isKeySession": true,
          "estimatedDurationMin": 59,
          "notes": "Allure VMA : 4:37 - 4:52/km\n6 répétitions",
          "notesEn": "VO2max pace: 4:37 - 4:52/km\n6 repetitions",
          "targetDurationMin": 60,
          "loadScore": 102,
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
          "targetDistanceKm": 10
        },
        {
          "dayOfWeek": 4,
          "workoutId": "THR-014",
          "sessionType": "threshold",
          "isKeySession": true,
          "estimatedDurationMin": 52,
          "notes": "Allure seuil : 5:14 - 5:26/km",
          "notesEn": "Threshold pace: 5:14 - 5:26/km",
          "targetDurationMin": 55,
          "loadScore": 71,
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
          "estimatedDurationMin": 94,
          "notes": "Allure marathon : 5:46 - 5:55/km\nSortie longue : 12 km (~80 min)",
          "notesEn": "Marathon pace: 5:46 - 5:55/km\nLong run: 12 km (~80 min)",
          "targetDurationMin": 80,
          "loadScore": 65.8,
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
          "workoutId": "STR-005",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 45,
          "loadScore": 41
        }
      ],
      "weekLabel": "S6",
      "weekLabelEn": "W6",
      "targetKm": 41,
      "targetLongRunKm": 12,
      "weeklyLoadScore": 328
    },
    {
      "weekNumber": 7,
      "phase": "build",
      "isRecoveryWeek": false,
      "volumePercent": 88,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "END-014",
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
          "workoutId": "THR-002",
          "sessionType": "threshold",
          "isKeySession": true,
          "estimatedDurationMin": 54,
          "notes": "Allure seuil : 5:14 - 5:26/km\n3 répétitions",
          "notesEn": "Threshold pace: 5:14 - 5:26/km\n3 repetitions",
          "targetDurationMin": 54,
          "loadScore": 70.2,
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
          "targetDistanceKm": 9
        },
        {
          "dayOfWeek": 4,
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
          "dayOfWeek": 6,
          "workoutId": "SL-001",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 103,
          "notes": "Allure marathon : 5:46 - 5:55/km\nSortie longue : 15.5 km (~103 min)",
          "notesEn": "Marathon pace: 5:46 - 5:55/km\nLong run: 15.5 km (~103 min)",
          "targetDurationMin": 103,
          "loadScore": 72.1,
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
          "workoutId": "STR-002",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 45,
          "loadScore": 31
        }
      ],
      "weekLabel": "S7",
      "weekLabelEn": "W7",
      "targetKm": 42,
      "targetLongRunKm": 15.5,
      "weeklyLoadScore": 295
    },
    {
      "weekNumber": 8,
      "phase": "build",
      "isRecoveryWeek": true,
      "volumePercent": 71,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "END-004",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 60,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 60,
          "loadScore": 54,
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
          "workoutId": "END-012",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 46,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 46,
          "loadScore": 44.5,
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
          "dayOfWeek": 4,
          "workoutId": "END-014",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 43,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 43,
          "loadScore": 41,
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
          "dayOfWeek": 6,
          "workoutId": "SL-005",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 76,
          "notes": "Allure endurance : 6:09 - 7:06/km\nSortie longue : 11.5 km (~76 min)",
          "notesEn": "Easy pace: 6:09 - 7:06/km\nLong run: 11.5 km (~76 min)",
          "targetDurationMin": 76,
          "loadScore": 53.2,
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
      "targetKm": 34,
      "targetLongRunKm": 11.5,
      "weeklyLoadScore": 200
    },
    {
      "weekNumber": 9,
      "phase": "peak",
      "isRecoveryWeek": false,
      "volumePercent": 94,
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
          "workoutId": "VMA-006",
          "sessionType": "vo2max",
          "isKeySession": true,
          "estimatedDurationMin": 46,
          "notes": "Allure VMA : 4:37 - 4:52/km\n8 répétitions",
          "notesEn": "VO2max pace: 4:37 - 4:52/km\n8 repetitions",
          "targetDurationMin": 46,
          "loadScore": 78.2,
          "paceNotes": [
            {
              "zone": "I",
              "paceMinKm": 4.62,
              "paceMaxKm": 4.86,
              "description": "Allure VMA",
              "descriptionEn": "VO2max pace"
            }
          ],
          "scaledRepetitions": 8,
          "targetDistanceKm": 7.5
        },
        {
          "dayOfWeek": 4,
          "workoutId": "RP-002",
          "sessionType": "race_specific",
          "isKeySession": true,
          "estimatedDurationMin": 71,
          "notes": "Allure seuil : 5:14 - 5:26/km",
          "notesEn": "Threshold pace: 5:14 - 5:26/km",
          "targetDurationMin": 71,
          "loadScore": 71,
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
          "dayOfWeek": 6,
          "workoutId": "SL-007",
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
          "workoutId": "STR-017",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 28,
          "loadScore": 14
        }
      ],
      "weekLabel": "S9",
      "weekLabelEn": "W9",
      "targetKm": 45,
      "targetLongRunKm": 14,
      "weeklyLoadScore": 285
    },
    {
      "weekNumber": 10,
      "phase": "peak",
      "isRecoveryWeek": false,
      "volumePercent": 100,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "END-005",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 43,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 43,
          "loadScore": 32.5,
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
          "dayOfWeek": 2,
          "workoutId": "RP-002",
          "sessionType": "race_specific",
          "isKeySession": true,
          "estimatedDurationMin": 68,
          "notes": "Allure seuil : 5:14 - 5:26/km",
          "notesEn": "Threshold pace: 5:14 - 5:26/km",
          "targetDurationMin": 71,
          "loadScore": 71,
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
          "dayOfWeek": 4,
          "workoutId": "THR-007",
          "sessionType": "threshold",
          "isKeySession": true,
          "estimatedDurationMin": 78,
          "notes": "Allure seuil : 5:14 - 5:26/km\n4 répétitions",
          "notesEn": "Threshold pace: 5:14 - 5:26/km\n4 repetitions",
          "targetDurationMin": 82,
          "loadScore": 106.6,
          "paceNotes": [
            {
              "zone": "T",
              "paceMinKm": 5.24,
              "paceMaxKm": 5.43,
              "description": "Allure seuil",
              "descriptionEn": "Threshold pace"
            }
          ],
          "scaledRepetitions": 4,
          "targetDistanceKm": 13
        },
        {
          "dayOfWeek": 6,
          "workoutId": "LR-015",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 117,
          "notes": "Allure endurance : 6:09 - 7:06/km\nSortie longue : 17 km (~112 min)",
          "notesEn": "Easy pace: 6:09 - 7:06/km\nLong run: 17 km (~112 min)",
          "targetDurationMin": 112,
          "loadScore": 81.9,
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
          "dayOfWeek": 1,
          "workoutId": "STR-012",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 38,
          "loadScore": 32
        }
      ],
      "weekLabel": "S10",
      "weekLabelEn": "W10",
      "targetKm": 48,
      "targetLongRunKm": 17,
      "weeklyLoadScore": 324
    },
    {
      "weekNumber": 11,
      "phase": "taper",
      "isRecoveryWeek": false,
      "volumePercent": 65,
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
          "dayOfWeek": 2,
          "workoutId": "VMA-020",
          "sessionType": "vo2max",
          "isKeySession": true,
          "estimatedDurationMin": 27,
          "notes": "Allure VMA : 4:37 - 4:52/km\n3 répétitions",
          "notesEn": "VO2max pace: 4:37 - 4:52/km\n3 repetitions",
          "targetDurationMin": 28,
          "loadScore": 47.6,
          "paceNotes": [
            {
              "zone": "I",
              "paceMinKm": 4.62,
              "paceMaxKm": 4.86,
              "description": "Allure VMA",
              "descriptionEn": "VO2max pace"
            }
          ],
          "scaledRepetitions": 3,
          "targetDistanceKm": 4
        },
        {
          "dayOfWeek": 4,
          "workoutId": "RP-015",
          "sessionType": "race_specific",
          "isKeySession": true,
          "estimatedDurationMin": 55,
          "notes": "Allure seuil : 5:14 - 5:26/km",
          "notesEn": "Threshold pace: 5:14 - 5:26/km",
          "targetDurationMin": 67,
          "loadScore": 67,
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
          "workoutId": "LR-014",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 77,
          "notes": "Allure endurance : 6:09 - 7:06/km\nSortie longue : 11.5 km (~77 min)",
          "notesEn": "Easy pace: 6:09 - 7:06/km\nLong run: 11.5 km (~77 min)",
          "targetDurationMin": 77,
          "loadScore": 53.9,
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
      "weekLabel": "S11",
      "weekLabelEn": "W11",
      "targetKm": 31,
      "targetLongRunKm": 11.5,
      "weeklyLoadScore": 212
    },
    {
      "weekNumber": 12,
      "phase": "taper",
      "isRecoveryWeek": false,
      "volumePercent": 25,
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
          "notes": "Jour de course - 10K",
          "notesEn": "Race day - 10K"
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
      "weekLabel": "Semaine de course",
      "weekLabelEn": "Race week",
      "targetKm": 12,
      "weeklyLoadScore": 63
    }
  ],
  "tags": [
    "10k",
    "intermediate",
    "pr"
  ],
  "version": 2,
  "planPurpose": "race",
  "trainingGoal": "time",
  "peakWeeklyKm": 48,
  "peakLongRunKm": 17
};
