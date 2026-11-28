import type { PrebuiltPlan } from "../types";

export const planTrailCourtIntermediaire: PrebuiltPlan = {
  "id": "trail-court-intermediaire",
  "slug": "trail-court-intermediaire",
  "name": "Trail court intermédiaire",
  "nameEn": "Short Trail Intermediate",
  "description": "Plan de 14 semaines pour un trail de 30 km. Dénivelé, marche en montée et descente technique, en plus du volume.",
  "descriptionEn": "14-week plan for a 30 km trail race. Elevation, power hiking and technical descents on top of the volume.",
  "icon": "Mountain",
  "difficulty": "intermediate",
  "raceDistance": "trail_short",
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
      "volumePercent": 61,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "END-005",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 33,
          "notes": "Allure endurance : 6:04 - 7:06/km",
          "notesEn": "Easy pace: 6:04 - 7:06/km",
          "targetDurationMin": 33,
          "loadScore": 29.2,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 5
        },
        {
          "dayOfWeek": 2,
          "workoutId": "TRL-020",
          "sessionType": "hills",
          "isKeySession": true,
          "estimatedDurationMin": 73,
          "notes": "Allure endurance : 6:04 - 7:06/km",
          "notesEn": "Easy pace: 6:04 - 7:06/km",
          "targetDurationMin": 110,
          "loadScore": 143,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 11
        },
        {
          "dayOfWeek": 4,
          "workoutId": "END-014",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 30,
          "notes": "Allure endurance : 6:04 - 7:06/km",
          "notesEn": "Easy pace: 6:04 - 7:06/km",
          "targetDurationMin": 30,
          "loadScore": 28.4,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 4.5
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-005",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 66,
          "notes": "Allure endurance : 6:04 - 7:06/km\nSortie longue : 9.5 km (~63 min)",
          "notesEn": "Easy pace: 6:04 - 7:06/km\nLong run: 9.5 km (~63 min)",
          "targetDurationMin": 63,
          "loadScore": 46.2,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 9.5
        },
        {
          "dayOfWeek": 3,
          "workoutId": "STR-002",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 45,
          "loadScore": 31
        }
      ],
      "weekLabel": "S1",
      "weekLabelEn": "W1",
      "targetKm": 30,
      "targetLongRunKm": 9.5,
      "weeklyLoadScore": 278
    },
    {
      "weekNumber": 2,
      "phase": "base",
      "isRecoveryWeek": false,
      "volumePercent": 65,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "END-005",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 59,
          "notes": "Allure endurance : 6:04 - 7:06/km",
          "notesEn": "Easy pace: 6:04 - 7:06/km",
          "targetDurationMin": 59,
          "loadScore": 48.5,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 9
        },
        {
          "dayOfWeek": 2,
          "workoutId": "TRL-001",
          "sessionType": "fartlek",
          "isKeySession": true,
          "estimatedDurationMin": 31,
          "notes": "Allure vitesse : 4:16 - 4:26/km",
          "notesEn": "Repetition pace: 4:16 - 4:26/km",
          "targetDurationMin": 32,
          "loadScore": 54.4,
          "paceNotes": [
            {
              "zone": "R",
              "paceMinKm": 4.27,
              "paceMaxKm": 4.44,
              "description": "Allure vitesse",
              "descriptionEn": "Repetition pace"
            }
          ],
          "targetDistanceKm": 5
        },
        {
          "dayOfWeek": 4,
          "workoutId": "END-023",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 46,
          "notes": "Allure endurance : 6:04 - 7:06/km",
          "notesEn": "Easy pace: 6:04 - 7:06/km",
          "targetDurationMin": 46,
          "loadScore": 44.1,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 7
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-005",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 72,
          "notes": "Allure endurance : 6:04 - 7:06/km\nSortie longue : 11 km (~72 min)",
          "notesEn": "Easy pace: 6:04 - 7:06/km\nLong run: 11 km (~72 min)",
          "targetDurationMin": 72,
          "loadScore": 50.4,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 11
        },
        {
          "dayOfWeek": 3,
          "workoutId": "STR-009",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 35,
          "loadScore": 25
        }
      ],
      "weekLabel": "S2",
      "weekLabelEn": "W2",
      "targetKm": 32,
      "targetLongRunKm": 11,
      "weeklyLoadScore": 222
    },
    {
      "weekNumber": 3,
      "phase": "base",
      "isRecoveryWeek": false,
      "volumePercent": 69,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "END-004",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 63,
          "notes": "Allure endurance : 6:04 - 7:06/km",
          "notesEn": "Easy pace: 6:04 - 7:06/km",
          "targetDurationMin": 63,
          "loadScore": 57,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 9.5
        },
        {
          "dayOfWeek": 2,
          "workoutId": "TRL-001",
          "sessionType": "fartlek",
          "isKeySession": true,
          "estimatedDurationMin": 31,
          "notes": "Allure vitesse : 4:16 - 4:26/km",
          "notesEn": "Repetition pace: 4:16 - 4:26/km",
          "targetDurationMin": 32,
          "loadScore": 54.4,
          "paceNotes": [
            {
              "zone": "R",
              "paceMinKm": 4.27,
              "paceMaxKm": 4.44,
              "description": "Allure vitesse",
              "descriptionEn": "Repetition pace"
            }
          ],
          "targetDistanceKm": 5
        },
        {
          "dayOfWeek": 4,
          "workoutId": "END-023",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 63,
          "notes": "Allure endurance : 6:04 - 7:06/km",
          "notesEn": "Easy pace: 6:04 - 7:06/km",
          "targetDurationMin": 63,
          "loadScore": 59.9,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 9.5
        },
        {
          "dayOfWeek": 6,
          "workoutId": "LR-017",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 63,
          "notes": "Allure endurance : 6:04 - 7:06/km\nSortie longue : 9.5 km (~63 min)",
          "notesEn": "Easy pace: 6:04 - 7:06/km\nLong run: 9.5 km (~63 min)",
          "targetDurationMin": 63,
          "loadScore": 44.1,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 9.5
        },
        {
          "dayOfWeek": 3,
          "workoutId": "STR-014",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 23,
          "loadScore": 7
        }
      ],
      "weekLabel": "S3",
      "weekLabelEn": "W3",
      "targetKm": 34,
      "targetLongRunKm": 9.5,
      "weeklyLoadScore": 222
    },
    {
      "weekNumber": 4,
      "phase": "base",
      "isRecoveryWeek": true,
      "volumePercent": 53,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "HIL-012",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 36,
          "notes": "Allure vitesse : 4:16 - 4:26/km",
          "notesEn": "Repetition pace: 4:16 - 4:26/km",
          "targetDurationMin": 36,
          "loadScore": 31.8,
          "paceNotes": [
            {
              "zone": "R",
              "paceMinKm": 4.27,
              "paceMaxKm": 4.44,
              "description": "Allure vitesse",
              "descriptionEn": "Repetition pace"
            }
          ],
          "targetDistanceKm": 5.5
        },
        {
          "dayOfWeek": 2,
          "workoutId": "HIL-011",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 36,
          "notes": "Allure marathon : 5:53 - 6:07/km",
          "notesEn": "Marathon pace: 5:53 - 6:07/km",
          "targetDurationMin": 36,
          "loadScore": 34.9,
          "paceNotes": [
            {
              "zone": "M",
              "paceMinKm": 5.88,
              "paceMaxKm": 6.11,
              "description": "Allure marathon",
              "descriptionEn": "Marathon pace"
            }
          ],
          "targetDistanceKm": 5.5
        },
        {
          "dayOfWeek": 4,
          "workoutId": "HIL-004",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 33,
          "notes": "Allure vitesse : 4:16 - 4:26/km",
          "notesEn": "Repetition pace: 4:16 - 4:26/km",
          "targetDurationMin": 33,
          "loadScore": 26.9,
          "paceNotes": [
            {
              "zone": "R",
              "paceMinKm": 4.27,
              "paceMaxKm": 4.44,
              "description": "Allure vitesse",
              "descriptionEn": "Repetition pace"
            }
          ],
          "targetDistanceKm": 5
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-005",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 65,
          "notes": "Allure endurance : 6:04 - 7:06/km\nSortie longue : 10 km (~65 min)",
          "notesEn": "Easy pace: 6:04 - 7:06/km\nLong run: 10 km (~65 min)",
          "targetDurationMin": 65,
          "loadScore": 45.5,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
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
      "targetKm": 26,
      "targetLongRunKm": 10,
      "weeklyLoadScore": 147
    },
    {
      "weekNumber": 5,
      "phase": "base",
      "isRecoveryWeek": false,
      "volumePercent": 73,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "END-014",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 43,
          "notes": "Allure endurance : 6:04 - 7:06/km",
          "notesEn": "Easy pace: 6:04 - 7:06/km",
          "targetDurationMin": 43,
          "loadScore": 37.2,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 6.5
        },
        {
          "dayOfWeek": 2,
          "workoutId": "TMP-012",
          "sessionType": "tempo",
          "isKeySession": true,
          "estimatedDurationMin": 43,
          "notes": "Allure marathon : 5:53 - 6:07/km",
          "notesEn": "Marathon pace: 5:53 - 6:07/km",
          "targetDurationMin": 50,
          "loadScore": 50,
          "paceNotes": [
            {
              "zone": "M",
              "paceMinKm": 5.88,
              "paceMaxKm": 6.11,
              "description": "Allure marathon",
              "descriptionEn": "Marathon pace"
            }
          ],
          "targetDistanceKm": 7
        },
        {
          "dayOfWeek": 4,
          "workoutId": "HIL-004",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 53,
          "notes": "Allure vitesse : 4:16 - 4:26/km",
          "notesEn": "Repetition pace: 4:16 - 4:26/km",
          "targetDurationMin": 53,
          "loadScore": 40,
          "paceNotes": [
            {
              "zone": "R",
              "paceMinKm": 4.27,
              "paceMaxKm": 4.44,
              "description": "Allure vitesse",
              "descriptionEn": "Repetition pace"
            }
          ],
          "targetDistanceKm": 8
        },
        {
          "dayOfWeek": 6,
          "workoutId": "LR-017",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 95,
          "notes": "Allure endurance : 6:04 - 7:06/km\nSortie longue : 14.5 km (~95 min)",
          "notesEn": "Easy pace: 6:04 - 7:06/km\nLong run: 14.5 km (~95 min)",
          "targetDurationMin": 95,
          "loadScore": 66.5,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 14.5
        },
        {
          "dayOfWeek": 3,
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
      "targetKm": 36,
      "targetLongRunKm": 14.5,
      "weeklyLoadScore": 206
    },
    {
      "weekNumber": 6,
      "phase": "base",
      "isRecoveryWeek": false,
      "volumePercent": 78,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "HIL-012",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 63,
          "notes": "Allure vitesse : 4:16 - 4:26/km",
          "notesEn": "Repetition pace: 4:16 - 4:26/km",
          "targetDurationMin": 63,
          "loadScore": 45.8,
          "paceNotes": [
            {
              "zone": "R",
              "paceMinKm": 4.27,
              "paceMaxKm": 4.44,
              "description": "Allure vitesse",
              "descriptionEn": "Repetition pace"
            }
          ],
          "targetDistanceKm": 9.5
        },
        {
          "dayOfWeek": 2,
          "workoutId": "TMP-012",
          "sessionType": "tempo",
          "isKeySession": true,
          "estimatedDurationMin": 45,
          "notes": "Allure marathon : 5:53 - 6:07/km",
          "notesEn": "Marathon pace: 5:53 - 6:07/km",
          "targetDurationMin": 50,
          "loadScore": 50,
          "paceNotes": [
            {
              "zone": "M",
              "paceMinKm": 5.88,
              "paceMaxKm": 6.11,
              "description": "Allure marathon",
              "descriptionEn": "Marathon pace"
            }
          ],
          "targetDistanceKm": 7
        },
        {
          "dayOfWeek": 4,
          "workoutId": "HIL-011",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 63,
          "notes": "Allure marathon : 5:53 - 6:07/km",
          "notesEn": "Marathon pace: 5:53 - 6:07/km",
          "targetDurationMin": 63,
          "loadScore": 50.2,
          "paceNotes": [
            {
              "zone": "M",
              "paceMinKm": 5.88,
              "paceMaxKm": 6.11,
              "description": "Allure marathon",
              "descriptionEn": "Marathon pace"
            }
          ],
          "targetDistanceKm": 9.5
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-006",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 95,
          "notes": "Allure endurance : 6:04 - 7:06/km\nSortie longue : 12 km (~79 min)",
          "notesEn": "Easy pace: 6:04 - 7:06/km\nLong run: 12 km (~79 min)",
          "targetDurationMin": 79,
          "loadScore": 66.5,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 12
        },
        {
          "dayOfWeek": 3,
          "workoutId": "STR-001",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 35,
          "loadScore": 18
        }
      ],
      "weekLabel": "S6",
      "weekLabelEn": "W6",
      "targetKm": 38,
      "targetLongRunKm": 12,
      "weeklyLoadScore": 231
    },
    {
      "weekNumber": 7,
      "phase": "build",
      "isRecoveryWeek": false,
      "volumePercent": 90,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "HIL-014",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 40,
          "notes": "Allure marathon : 5:53 - 6:07/km",
          "notesEn": "Marathon pace: 5:53 - 6:07/km",
          "targetDurationMin": 40,
          "loadScore": 29.6,
          "paceNotes": [
            {
              "zone": "M",
              "paceMinKm": 5.88,
              "paceMaxKm": 6.11,
              "description": "Allure marathon",
              "descriptionEn": "Marathon pace"
            }
          ],
          "targetDistanceKm": 6
        },
        {
          "dayOfWeek": 2,
          "workoutId": "TRL-018",
          "sessionType": "hills",
          "isKeySession": true,
          "estimatedDurationMin": 107,
          "notes": "Allure endurance : 6:04 - 7:06/km",
          "notesEn": "Easy pace: 6:04 - 7:06/km",
          "targetDurationMin": 125,
          "loadScore": 162.2,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 16.5
        },
        {
          "dayOfWeek": 4,
          "workoutId": "END-005",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 33,
          "notes": "Allure endurance : 6:04 - 7:06/km",
          "notesEn": "Easy pace: 6:04 - 7:06/km",
          "targetDurationMin": 33,
          "loadScore": 25,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 5
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-006",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 105,
          "notes": "Allure endurance : 6:04 - 7:06/km\nSortie longue : 16 km (~105 min)",
          "notesEn": "Easy pace: 6:04 - 7:06/km\nLong run: 16 km (~105 min)",
          "targetDurationMin": 105,
          "loadScore": 73.5,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 16
        },
        {
          "dayOfWeek": 3,
          "workoutId": "STR-011",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 33,
          "loadScore": 28
        }
      ],
      "weekLabel": "S7",
      "weekLabelEn": "W7",
      "targetKm": 44,
      "targetLongRunKm": 16,
      "weeklyLoadScore": 318
    },
    {
      "weekNumber": 8,
      "phase": "build",
      "isRecoveryWeek": true,
      "volumePercent": 61,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "HIL-011",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 43,
          "notes": "Allure marathon : 5:53 - 6:07/km",
          "notesEn": "Marathon pace: 5:53 - 6:07/km",
          "targetDurationMin": 43,
          "loadScore": 38.7,
          "paceNotes": [
            {
              "zone": "M",
              "paceMinKm": 5.88,
              "paceMaxKm": 6.11,
              "description": "Allure marathon",
              "descriptionEn": "Marathon pace"
            }
          ],
          "targetDistanceKm": 6.5
        },
        {
          "dayOfWeek": 2,
          "workoutId": "END-023",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 26,
          "notes": "Allure endurance : 6:04 - 7:06/km",
          "notesEn": "Easy pace: 6:04 - 7:06/km",
          "targetDurationMin": 26,
          "loadScore": 25.2,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 4
        },
        {
          "dayOfWeek": 4,
          "workoutId": "HIL-012",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 43,
          "notes": "Allure vitesse : 4:16 - 4:26/km",
          "notesEn": "Repetition pace: 4:16 - 4:26/km",
          "targetDurationMin": 43,
          "loadScore": 35.3,
          "paceNotes": [
            {
              "zone": "R",
              "paceMinKm": 4.27,
              "paceMaxKm": 4.44,
              "description": "Allure vitesse",
              "descriptionEn": "Repetition pace"
            }
          ],
          "targetDistanceKm": 6.5
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-005",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 86,
          "notes": "Allure endurance : 6:04 - 7:06/km\nSortie longue : 13 km (~86 min)",
          "notesEn": "Easy pace: 6:04 - 7:06/km\nLong run: 13 km (~86 min)",
          "targetDurationMin": 86,
          "loadScore": 60.2,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 13
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
      "targetKm": 30,
      "targetLongRunKm": 13,
      "weeklyLoadScore": 169
    },
    {
      "weekNumber": 9,
      "phase": "build",
      "isRecoveryWeek": false,
      "volumePercent": 94,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "END-005",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 33,
          "notes": "Allure endurance : 6:04 - 7:06/km",
          "notesEn": "Easy pace: 6:04 - 7:06/km",
          "targetDurationMin": 33,
          "loadScore": 25,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 5
        },
        {
          "dayOfWeek": 2,
          "workoutId": "TRL-018",
          "sessionType": "hills",
          "isKeySession": true,
          "estimatedDurationMin": 141,
          "notes": "Allure endurance : 6:04 - 7:06/km",
          "notesEn": "Easy pace: 6:04 - 7:06/km",
          "targetDurationMin": 155,
          "loadScore": 201.5,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 21.5
        },
        {
          "dayOfWeek": 4,
          "workoutId": "END-014",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 30,
          "notes": "Allure endurance : 6:04 - 7:06/km",
          "notesEn": "Easy pace: 6:04 - 7:06/km",
          "targetDurationMin": 30,
          "loadScore": 23.6,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 4.5
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-006",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 104,
          "notes": "Allure endurance : 6:04 - 7:06/km\nSortie longue : 15 km (~99 min)",
          "notesEn": "Easy pace: 6:04 - 7:06/km\nLong run: 15 km (~99 min)",
          "targetDurationMin": 99,
          "loadScore": 72.8,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 15
        },
        {
          "dayOfWeek": 3,
          "workoutId": "STR-013",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 28,
          "loadScore": 24
        }
      ],
      "weekLabel": "S9",
      "weekLabelEn": "W9",
      "targetKm": 46,
      "targetLongRunKm": 15,
      "weeklyLoadScore": 347
    },
    {
      "weekNumber": 10,
      "phase": "build",
      "isRecoveryWeek": false,
      "volumePercent": 94,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "HIL-014",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 56,
          "notes": "Allure marathon : 5:53 - 6:07/km",
          "notesEn": "Marathon pace: 5:53 - 6:07/km",
          "targetDurationMin": 56,
          "loadScore": 37.6,
          "paceNotes": [
            {
              "zone": "M",
              "paceMinKm": 5.88,
              "paceMaxKm": 6.11,
              "description": "Allure marathon",
              "descriptionEn": "Marathon pace"
            }
          ],
          "targetDistanceKm": 8.5
        },
        {
          "dayOfWeek": 2,
          "workoutId": "THR-002",
          "sessionType": "threshold",
          "isKeySession": true,
          "estimatedDurationMin": 60,
          "notes": "Allure seuil : 5:08 - 5:22/km\n4 répétitions",
          "notesEn": "Threshold pace: 5:08 - 5:22/km\n4 repetitions",
          "targetDurationMin": 62,
          "loadScore": 80.6,
          "paceNotes": [
            {
              "zone": "T",
              "paceMinKm": 5.13,
              "paceMaxKm": 5.37,
              "description": "Allure seuil",
              "descriptionEn": "Threshold pace"
            }
          ],
          "scaledRepetitions": 4,
          "targetDistanceKm": 10.5
        },
        {
          "dayOfWeek": 4,
          "workoutId": "END-004",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 49,
          "notes": "Allure endurance : 6:04 - 7:06/km",
          "notesEn": "Easy pace: 6:04 - 7:06/km",
          "targetDurationMin": 49,
          "loadScore": 37.1,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
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
          "estimatedDurationMin": 128,
          "notes": "Allure endurance : 6:04 - 7:06/km\nSortie longue : 19.5 km (~128 min)",
          "notesEn": "Easy pace: 6:04 - 7:06/km\nLong run: 19.5 km (~128 min)",
          "targetDurationMin": 128,
          "loadScore": 89.6,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 19.5
        },
        {
          "dayOfWeek": 3,
          "workoutId": "STR-008",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 28,
          "loadScore": 14
        }
      ],
      "weekLabel": "S10",
      "weekLabelEn": "W10",
      "targetKm": 46,
      "targetLongRunKm": 19.5,
      "weeklyLoadScore": 259
    },
    {
      "weekNumber": 11,
      "phase": "peak",
      "isRecoveryWeek": false,
      "volumePercent": 100,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "END-005",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 59,
          "notes": "Allure endurance : 6:04 - 7:06/km",
          "notesEn": "Easy pace: 6:04 - 7:06/km",
          "targetDurationMin": 59,
          "loadScore": 42,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 9
        },
        {
          "dayOfWeek": 2,
          "workoutId": "HIL-015",
          "sessionType": "hills",
          "isKeySession": true,
          "estimatedDurationMin": 70,
          "notes": "Allure marathon : 5:53 - 6:07/km",
          "notesEn": "Marathon pace: 5:53 - 6:07/km",
          "targetDurationMin": 70,
          "loadScore": 91,
          "paceNotes": [
            {
              "zone": "M",
              "paceMinKm": 5.88,
              "paceMaxKm": 6.11,
              "description": "Allure marathon",
              "descriptionEn": "Marathon pace"
            },
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 11
        },
        {
          "dayOfWeek": 4,
          "workoutId": "END-014",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 53,
          "notes": "Allure endurance : 6:04 - 7:06/km",
          "notesEn": "Easy pace: 6:04 - 7:06/km",
          "targetDurationMin": 53,
          "loadScore": 36,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 8
        },
        {
          "dayOfWeek": 6,
          "workoutId": "LR-017",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 138,
          "notes": "Allure endurance : 6:04 - 7:06/km\nSortie longue : 21 km (~138 min)",
          "notesEn": "Easy pace: 6:04 - 7:06/km\nLong run: 21 km (~138 min)",
          "targetDurationMin": 138,
          "loadScore": 96.6,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 21
        },
        {
          "dayOfWeek": 3,
          "workoutId": "STR-017",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 28,
          "loadScore": 14
        }
      ],
      "weekLabel": "S11",
      "weekLabelEn": "W11",
      "targetKm": 49,
      "targetLongRunKm": 21,
      "weeklyLoadScore": 280
    },
    {
      "weekNumber": 12,
      "phase": "peak",
      "isRecoveryWeek": false,
      "volumePercent": 94,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "HIL-014",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 56,
          "notes": "Allure marathon : 5:53 - 6:07/km",
          "notesEn": "Marathon pace: 5:53 - 6:07/km",
          "targetDurationMin": 56,
          "loadScore": 37.6,
          "paceNotes": [
            {
              "zone": "M",
              "paceMinKm": 5.88,
              "paceMaxKm": 6.11,
              "description": "Allure marathon",
              "descriptionEn": "Marathon pace"
            }
          ],
          "targetDistanceKm": 8.5
        },
        {
          "dayOfWeek": 2,
          "workoutId": "THR-002",
          "sessionType": "threshold",
          "isKeySession": true,
          "estimatedDurationMin": 60,
          "notes": "Allure seuil : 5:08 - 5:22/km\n4 répétitions",
          "notesEn": "Threshold pace: 5:08 - 5:22/km\n4 repetitions",
          "targetDurationMin": 62,
          "loadScore": 80.6,
          "paceNotes": [
            {
              "zone": "T",
              "paceMinKm": 5.13,
              "paceMaxKm": 5.37,
              "description": "Allure seuil",
              "descriptionEn": "Threshold pace"
            }
          ],
          "scaledRepetitions": 4,
          "targetDistanceKm": 10.5
        },
        {
          "dayOfWeek": 4,
          "workoutId": "HIL-011",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 59,
          "notes": "Allure marathon : 5:53 - 6:07/km",
          "notesEn": "Marathon pace: 5:53 - 6:07/km",
          "targetDurationMin": 59,
          "loadScore": 42.8,
          "paceNotes": [
            {
              "zone": "M",
              "paceMinKm": 5.88,
              "paceMaxKm": 6.11,
              "description": "Allure marathon",
              "descriptionEn": "Marathon pace"
            }
          ],
          "targetDistanceKm": 9
        },
        {
          "dayOfWeek": 6,
          "workoutId": "LR-019",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 119,
          "notes": "Allure marathon : 5:53 - 6:07/km\nSortie longue : 18 km (~119 min)",
          "notesEn": "Marathon pace: 5:53 - 6:07/km\nLong run: 18 km (~119 min)",
          "targetDurationMin": 119,
          "loadScore": 83.3,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            },
            {
              "zone": "M",
              "paceMinKm": 5.88,
              "paceMaxKm": 6.11,
              "description": "Allure marathon",
              "descriptionEn": "Marathon pace"
            }
          ],
          "targetDistanceKm": 18
        },
        {
          "dayOfWeek": 3,
          "workoutId": "STR-012",
          "sessionType": "strength",
          "isKeySession": false,
          "isSuggestion": true,
          "estimatedDurationMin": 38,
          "loadScore": 32
        }
      ],
      "weekLabel": "S12",
      "weekLabelEn": "W12",
      "targetKm": 46,
      "targetLongRunKm": 18,
      "weeklyLoadScore": 276
    },
    {
      "weekNumber": 13,
      "phase": "taper",
      "isRecoveryWeek": false,
      "volumePercent": 69,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "REC-011",
          "sessionType": "recovery",
          "isKeySession": false,
          "estimatedDurationMin": 40,
          "notes": "Allure endurance : 6:04 - 7:06/km",
          "notesEn": "Easy pace: 6:04 - 7:06/km",
          "targetDurationMin": 40,
          "loadScore": 35,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 6
        },
        {
          "dayOfWeek": 2,
          "workoutId": "TMP-015",
          "sessionType": "tempo",
          "isKeySession": true,
          "estimatedDurationMin": 34,
          "notes": "Allure marathon : 5:53 - 6:07/km",
          "notesEn": "Marathon pace: 5:53 - 6:07/km",
          "targetDurationMin": 37,
          "loadScore": 37,
          "paceNotes": [
            {
              "zone": "M",
              "paceMinKm": 5.88,
              "paceMaxKm": 6.11,
              "description": "Allure marathon",
              "descriptionEn": "Marathon pace"
            }
          ],
          "targetDistanceKm": 5
        },
        {
          "dayOfWeek": 4,
          "workoutId": "REC-004",
          "sessionType": "recovery",
          "isKeySession": false,
          "estimatedDurationMin": 59,
          "notes": "Allure endurance : 6:04 - 7:06/km",
          "notesEn": "Easy pace: 6:04 - 7:06/km",
          "targetDurationMin": 59,
          "loadScore": 56,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 9
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-012",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 92,
          "notes": "Allure endurance : 6:04 - 7:06/km\nSortie longue : 14 km (~92 min)",
          "notesEn": "Easy pace: 6:04 - 7:06/km\nLong run: 14 km (~92 min)",
          "targetDurationMin": 92,
          "loadScore": 64.4,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.07,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 14
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
      "weekLabel": "S13",
      "weekLabelEn": "W13",
      "targetKm": 34,
      "targetLongRunKm": 14,
      "weeklyLoadScore": 202
    },
    {
      "weekNumber": 14,
      "phase": "taper",
      "isRecoveryWeek": false,
      "volumePercent": 37,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "REC-001",
          "sessionType": "recovery",
          "isKeySession": false,
          "estimatedDurationMin": 45,
          "notes": "Footing léger - semaine de course",
          "notesEn": "Easy jog - race week",
          "targetDistanceKm": 7,
          "loadScore": 31.5
        },
        {
          "dayOfWeek": 1,
          "workoutId": "REC-004",
          "sessionType": "recovery",
          "isKeySession": false,
          "estimatedDurationMin": 45,
          "notes": "Footing léger - semaine de course",
          "notesEn": "Easy jog - race week",
          "targetDistanceKm": 7,
          "loadScore": 31.5
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
          "notes": "Jour de course - Trail court",
          "notesEn": "Race day - Short Trail"
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
      "targetKm": 18,
      "weeklyLoadScore": 95
    }
  ],
  "tags": [
    "trail",
    "intermediate",
    "elevation",
    "30k"
  ],
  "version": 2,
  "planPurpose": "race",
  "trainingGoal": "finish",
  "peakWeeklyKm": 49,
  "peakLongRunKm": 21
};
