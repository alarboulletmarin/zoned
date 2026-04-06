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
      "volumePercent": 67,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "STR-002",
          "sessionType": "strength",
          "isKeySession": false,
          "estimatedDurationMin": 45,
          "notes": "Renforcement : Renfo full body intermediaire",
          "notesEn": "Strength: Full Body Intermediate",
          "loadScore": 18
        },
        {
          "dayOfWeek": 1,
          "workoutId": "END-010",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 59,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 59,
          "loadScore": 41.3,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ]
        },
        {
          "dayOfWeek": 3,
          "workoutId": "FAR-002",
          "sessionType": "fartlek",
          "isKeySession": true,
          "estimatedDurationMin": 43,
          "notes": "Allure VMA : 4:37 - 4:52/km",
          "notesEn": "VO2max pace: 4:37 - 4:52/km",
          "targetDurationMin": 43,
          "loadScore": 73.1,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ]
        },
        {
          "dayOfWeek": 4,
          "workoutId": "END-002",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 50,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 50,
          "loadScore": 35,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ]
        },
        {
          "dayOfWeek": 5,
          "workoutId": "STR-009",
          "sessionType": "strength",
          "isKeySession": false,
          "estimatedDurationMin": 35,
          "notes": "Renforcement : Core avance",
          "notesEn": "Strength: Advanced Core",
          "loadScore": 12
        },
        {
          "dayOfWeek": 6,
          "workoutId": "END-002",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 63,
          "notes": "Allure endurance : 6:09 - 7:06/km\nSortie longue : 9.5 km (~63 min)",
          "notesEn": "Easy pace: 6:09 - 7:06/km\nLong run: 9.5 km (~63 min)",
          "targetDurationMin": 63,
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
          "targetDistanceKm": 9.5
        }
      ],
      "weekLabel": "S1",
      "weekLabelEn": "W1",
      "targetKm": 35,
      "targetLongRunKm": 9.5,
      "weeklyLoadScore": 184
    },
    {
      "weekNumber": 2,
      "phase": "base",
      "isRecoveryWeek": false,
      "volumePercent": 73,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "STR-002",
          "sessionType": "strength",
          "isKeySession": false,
          "estimatedDurationMin": 45,
          "notes": "Renforcement : Renfo full body intermediaire",
          "notesEn": "Strength: Full Body Intermediate",
          "loadScore": 18
        },
        {
          "dayOfWeek": 1,
          "workoutId": "END-004",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 49,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 49,
          "loadScore": 34.3,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ]
        },
        {
          "dayOfWeek": 3,
          "workoutId": "FAR-002",
          "sessionType": "fartlek",
          "isKeySession": true,
          "estimatedDurationMin": 46,
          "notes": "Allure VMA : 4:37 - 4:52/km",
          "notesEn": "VO2max pace: 4:37 - 4:52/km",
          "targetDurationMin": 46,
          "loadScore": 78.2,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ]
        },
        {
          "dayOfWeek": 4,
          "workoutId": "FAR-002",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 46,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 46,
          "loadScore": 32.2,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ]
        },
        {
          "dayOfWeek": 5,
          "workoutId": "STR-008",
          "sessionType": "strength",
          "isKeySession": false,
          "estimatedDurationMin": 28,
          "notes": "Renforcement : Core stability coureur",
          "notesEn": "Strength: Runner Core Stability",
          "loadScore": 12
        },
        {
          "dayOfWeek": 6,
          "workoutId": "END-015",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 73,
          "notes": "Allure endurance : 6:09 - 7:06/km\nSortie longue : 11 km (~73 min)",
          "notesEn": "Easy pace: 6:09 - 7:06/km\nLong run: 11 km (~73 min)",
          "targetDurationMin": 73,
          "loadScore": 37.8,
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
        }
      ],
      "weekLabel": "S2",
      "weekLabelEn": "W2",
      "targetKm": 35,
      "targetLongRunKm": 11,
      "weeklyLoadScore": 183
    },
    {
      "weekNumber": 3,
      "phase": "base",
      "isRecoveryWeek": false,
      "volumePercent": 81,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "STR-002",
          "sessionType": "strength",
          "isKeySession": false,
          "estimatedDurationMin": 45,
          "notes": "Renforcement : Renfo full body intermediaire",
          "notesEn": "Strength: Full Body Intermediate",
          "loadScore": 18
        },
        {
          "dayOfWeek": 1,
          "workoutId": "END-005",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 45,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 45,
          "loadScore": 31.5,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ]
        },
        {
          "dayOfWeek": 3,
          "workoutId": "FAR-015",
          "sessionType": "fartlek",
          "isKeySession": true,
          "estimatedDurationMin": 45,
          "notes": "Allure VMA : 4:37 - 4:52/km",
          "notesEn": "VO2max pace: 4:37 - 4:52/km",
          "targetDurationMin": 45,
          "loadScore": 76.5,
          "paceNotes": [
            {
              "zone": "T",
              "paceMinKm": 5.24,
              "paceMaxKm": 5.43,
              "description": "Allure seuil",
              "descriptionEn": "Threshold pace"
            }
          ]
        },
        {
          "dayOfWeek": 4,
          "workoutId": "END-017",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 56,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 56,
          "loadScore": 39.2,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ]
        },
        {
          "dayOfWeek": 5,
          "workoutId": "STR-009",
          "sessionType": "strength",
          "isKeySession": false,
          "estimatedDurationMin": 35,
          "notes": "Renforcement : Core avance",
          "notesEn": "Strength: Advanced Core",
          "loadScore": 12
        },
        {
          "dayOfWeek": 6,
          "workoutId": "END-004",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 63,
          "notes": "Allure endurance : 6:09 - 7:06/km\nSortie longue : 9.5 km (~63 min)",
          "notesEn": "Easy pace: 6:09 - 7:06/km\nLong run: 9.5 km (~63 min)",
          "targetDurationMin": 63,
          "loadScore": 36.4,
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
        }
      ],
      "weekLabel": "S3",
      "weekLabelEn": "W3",
      "targetKm": 34,
      "targetLongRunKm": 9.5,
      "weeklyLoadScore": 184
    },
    {
      "weekNumber": 4,
      "phase": "base",
      "isRecoveryWeek": true,
      "volumePercent": 65,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "STR-014",
          "sessionType": "strength",
          "isKeySession": false,
          "estimatedDurationMin": 23,
          "notes": "Renforcement : Mobilite hanches coureur",
          "notesEn": "Strength: Runner Hip Mobility",
          "loadScore": 8
        },
        {
          "dayOfWeek": 1,
          "workoutId": "REC-009",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 75,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 75,
          "loadScore": 52.5,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ]
        },
        {
          "dayOfWeek": 3,
          "workoutId": "FAR-015",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 41,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 41,
          "loadScore": 28.7,
          "paceNotes": [
            {
              "zone": "T",
              "paceMinKm": 5.24,
              "paceMaxKm": 5.43,
              "description": "Allure seuil",
              "descriptionEn": "Threshold pace"
            }
          ]
        },
        {
          "dayOfWeek": 4,
          "workoutId": "FAR-007",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 45,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 45,
          "loadScore": 31.5,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ]
        },
        {
          "dayOfWeek": 6,
          "workoutId": "FAR-007",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 45,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 45,
          "loadScore": 31.5,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ]
        }
      ],
      "weekLabel": "Semaine de récupération",
      "weekLabelEn": "Recovery Week",
      "targetKm": 31,
      "targetLongRunKm": 0,
      "weeklyLoadScore": 144
    },
    {
      "weekNumber": 5,
      "phase": "base",
      "isRecoveryWeek": false,
      "volumePercent": 89,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "STR-002",
          "sessionType": "strength",
          "isKeySession": false,
          "estimatedDurationMin": 45,
          "notes": "Renforcement : Renfo full body intermediaire",
          "notesEn": "Strength: Full Body Intermediate",
          "loadScore": 18
        },
        {
          "dayOfWeek": 1,
          "workoutId": "END-010",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 70,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 70,
          "loadScore": 49,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ]
        },
        {
          "dayOfWeek": 3,
          "workoutId": "FAR-002",
          "sessionType": "fartlek",
          "isKeySession": true,
          "estimatedDurationMin": 51,
          "notes": "Allure VMA : 4:37 - 4:52/km",
          "notesEn": "VO2max pace: 4:37 - 4:52/km",
          "targetDurationMin": 51,
          "loadScore": 86.7,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ]
        },
        {
          "dayOfWeek": 4,
          "workoutId": "REC-009",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 99,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 99,
          "loadScore": 69.3,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ]
        },
        {
          "dayOfWeek": 5,
          "workoutId": "STR-009",
          "sessionType": "strength",
          "isKeySession": false,
          "estimatedDurationMin": 35,
          "notes": "Renforcement : Core avance",
          "notesEn": "Strength: Advanced Core",
          "loadScore": 12
        },
        {
          "dayOfWeek": 6,
          "workoutId": "END-012",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 93,
          "notes": "Allure endurance : 6:09 - 7:06/km\nSortie longue : 14 km (~93 min)",
          "notesEn": "Easy pace: 6:09 - 7:06/km\nLong run: 14 km (~93 min)",
          "targetDurationMin": 93,
          "loadScore": 32.2,
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
        }
      ],
      "weekLabel": "S5",
      "weekLabelEn": "W5",
      "targetKm": 50,
      "targetLongRunKm": 14,
      "weeklyLoadScore": 237
    },
    {
      "weekNumber": 6,
      "phase": "base",
      "isRecoveryWeek": false,
      "volumePercent": 93,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "STR-002",
          "sessionType": "strength",
          "isKeySession": false,
          "estimatedDurationMin": 45,
          "notes": "Renforcement : Renfo full body intermediaire",
          "notesEn": "Strength: Full Body Intermediate",
          "loadScore": 18
        },
        {
          "dayOfWeek": 1,
          "workoutId": "REC-009",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 103,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 103,
          "loadScore": 72.1,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ]
        },
        {
          "dayOfWeek": 3,
          "workoutId": "FAR-007",
          "sessionType": "fartlek",
          "isKeySession": true,
          "estimatedDurationMin": 53,
          "notes": "Allure VMA : 4:37 - 4:52/km",
          "notesEn": "VO2max pace: 4:37 - 4:52/km",
          "targetDurationMin": 53,
          "loadScore": 90.1,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ]
        },
        {
          "dayOfWeek": 4,
          "workoutId": "FAR-015",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 48,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 48,
          "loadScore": 33.6,
          "paceNotes": [
            {
              "zone": "T",
              "paceMinKm": 5.24,
              "paceMaxKm": 5.43,
              "description": "Allure seuil",
              "descriptionEn": "Threshold pace"
            }
          ]
        },
        {
          "dayOfWeek": 5,
          "workoutId": "STR-008",
          "sessionType": "strength",
          "isKeySession": false,
          "estimatedDurationMin": 28,
          "notes": "Renforcement : Core stability coureur",
          "notesEn": "Strength: Runner Core Stability",
          "loadScore": 12
        },
        {
          "dayOfWeek": 6,
          "workoutId": "END-011",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 81,
          "notes": "Allure endurance : 6:09 - 7:06/km\nSortie longue : 12 km (~80 min)",
          "notesEn": "Easy pace: 6:09 - 7:06/km\nLong run: 12 km (~80 min)",
          "targetDurationMin": 80,
          "loadScore": 56.7,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 12
        }
      ],
      "weekLabel": "S6",
      "weekLabelEn": "W6",
      "targetKm": 46,
      "targetLongRunKm": 12,
      "weeklyLoadScore": 253
    },
    {
      "weekNumber": 7,
      "phase": "build",
      "isRecoveryWeek": false,
      "volumePercent": 100,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "STR-002",
          "sessionType": "strength",
          "isKeySession": false,
          "estimatedDurationMin": 45,
          "notes": "Renforcement : Renfo full body intermediaire",
          "notesEn": "Strength: Full Body Intermediate",
          "loadScore": 18
        },
        {
          "dayOfWeek": 1,
          "workoutId": "END-005",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 50,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 50,
          "loadScore": 35,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ]
        },
        {
          "dayOfWeek": 3,
          "workoutId": "VMA-019",
          "sessionType": "vo2max",
          "isKeySession": true,
          "estimatedDurationMin": 48,
          "notes": "Allure VMA : 4:37 - 4:52/km\n6 répétitions",
          "notesEn": "VO2max pace: 4:37 - 4:52/km\n6 repetitions",
          "targetDurationMin": 48,
          "loadScore": 81.6,
          "paceNotes": [
            {
              "zone": "I",
              "paceMinKm": 4.62,
              "paceMaxKm": 4.86,
              "description": "Allure VMA",
              "descriptionEn": "VO2max pace"
            }
          ],
          "scaledRepetitions": 6
        },
        {
          "dayOfWeek": 4,
          "workoutId": "END-015",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 70,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 70,
          "loadScore": 49,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ]
        },
        {
          "dayOfWeek": 5,
          "workoutId": "STR-010",
          "sessionType": "strength",
          "isKeySession": false,
          "estimatedDurationMin": 23,
          "notes": "Renforcement : Core running-specific",
          "notesEn": "Strength: Running-Specific Core",
          "loadScore": 12
        },
        {
          "dayOfWeek": 6,
          "workoutId": "END-015",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 99,
          "notes": "Allure endurance : 6:09 - 7:06/km\nSortie longue : 15 km (~99 min)",
          "notesEn": "Easy pace: 6:09 - 7:06/km\nLong run: 15 km (~99 min)",
          "targetDurationMin": 99,
          "loadScore": 49,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ],
          "targetDistanceKm": 15
        }
      ],
      "weekLabel": "S7",
      "weekLabelEn": "W7",
      "targetKm": 43,
      "targetLongRunKm": 15,
      "weeklyLoadScore": 215
    },
    {
      "weekNumber": 8,
      "phase": "build",
      "isRecoveryWeek": true,
      "volumePercent": 65,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "STR-016",
          "sessionType": "strength",
          "isKeySession": false,
          "estimatedDurationMin": 33,
          "notes": "Renforcement : Mobilite complete",
          "notesEn": "Strength: Full Mobility",
          "loadScore": 8
        },
        {
          "dayOfWeek": 1,
          "workoutId": "END-002",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 49,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 49,
          "loadScore": 34.3,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ]
        },
        {
          "dayOfWeek": 3,
          "workoutId": "END-010",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 58,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 58,
          "loadScore": 40.6,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ]
        },
        {
          "dayOfWeek": 4,
          "workoutId": "REC-006",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 20,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 20,
          "loadScore": 9.1,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ]
        },
        {
          "dayOfWeek": 6,
          "workoutId": "END-010",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 58,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 58,
          "loadScore": 40.6,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ]
        }
      ],
      "weekLabel": "Semaine de récupération",
      "weekLabelEn": "Recovery Week",
      "targetKm": 28,
      "targetLongRunKm": 0,
      "weeklyLoadScore": 125
    },
    {
      "weekNumber": 9,
      "phase": "build",
      "isRecoveryWeek": false,
      "volumePercent": 100,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "STR-002",
          "sessionType": "strength",
          "isKeySession": false,
          "estimatedDurationMin": 45,
          "notes": "Renforcement : Renfo full body intermediaire",
          "notesEn": "Strength: Full Body Intermediate",
          "loadScore": 18
        },
        {
          "dayOfWeek": 1,
          "workoutId": "FAR-002",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 55,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 55,
          "loadScore": 38.5,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ]
        },
        {
          "dayOfWeek": 3,
          "workoutId": "VMA-015",
          "sessionType": "vo2max",
          "isKeySession": true,
          "estimatedDurationMin": 49,
          "notes": "Allure VMA : 4:37 - 4:52/km\n8 répétitions",
          "notesEn": "VO2max pace: 4:37 - 4:52/km\n8 repetitions",
          "targetDurationMin": 49,
          "loadScore": 83.3,
          "paceNotes": [
            {
              "zone": "I",
              "paceMinKm": 4.62,
              "paceMaxKm": 4.86,
              "description": "Allure VMA",
              "descriptionEn": "VO2max pace"
            }
          ],
          "scaledRepetitions": 8
        },
        {
          "dayOfWeek": 4,
          "workoutId": "END-002",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 65,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 65,
          "loadScore": 45.5,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ]
        },
        {
          "dayOfWeek": 5,
          "workoutId": "STR-010",
          "sessionType": "strength",
          "isKeySession": false,
          "estimatedDurationMin": 23,
          "notes": "Renforcement : Core running-specific",
          "notesEn": "Strength: Running-Specific Core",
          "loadScore": 12
        },
        {
          "dayOfWeek": 6,
          "workoutId": "END-012",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 99,
          "notes": "Allure endurance : 6:09 - 7:06/km\nSortie longue : 15 km (~99 min)",
          "notesEn": "Easy pace: 6:09 - 7:06/km\nLong run: 15 km (~99 min)",
          "targetDurationMin": 99,
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
          "targetDistanceKm": 15
        }
      ],
      "weekLabel": "S9",
      "weekLabelEn": "W9",
      "targetKm": 43,
      "targetLongRunKm": 15,
      "weeklyLoadScore": 202
    },
    {
      "weekNumber": 10,
      "phase": "build",
      "isRecoveryWeek": false,
      "volumePercent": 93,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "STR-005",
          "sessionType": "strength",
          "isKeySession": false,
          "estimatedDurationMin": 45,
          "notes": "Renforcement : Force jambes coureur",
          "notesEn": "Strength: Runner Leg Strength",
          "loadScore": 18
        },
        {
          "dayOfWeek": 1,
          "workoutId": "END-005",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 48,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 48,
          "loadScore": 33.6,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ]
        },
        {
          "dayOfWeek": 3,
          "workoutId": "VMA-015",
          "sessionType": "vo2max",
          "isKeySession": true,
          "estimatedDurationMin": 53,
          "notes": "Allure VMA : 4:37 - 4:52/km\n10 répétitions",
          "notesEn": "VO2max pace: 4:37 - 4:52/km\n10 repetitions",
          "targetDurationMin": 53,
          "loadScore": 90.1,
          "paceNotes": [
            {
              "zone": "I",
              "paceMinKm": 4.62,
              "paceMaxKm": 4.86,
              "description": "Allure VMA",
              "descriptionEn": "VO2max pace"
            }
          ],
          "scaledRepetitions": 10
        },
        {
          "dayOfWeek": 4,
          "workoutId": "REC-006",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 20,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 20,
          "loadScore": 13.3,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ]
        },
        {
          "dayOfWeek": 5,
          "workoutId": "STR-010",
          "sessionType": "strength",
          "isKeySession": false,
          "estimatedDurationMin": 23,
          "notes": "Renforcement : Core running-specific",
          "notesEn": "Strength: Running-Specific Core",
          "loadScore": 12
        },
        {
          "dayOfWeek": 6,
          "workoutId": "END-017",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 119,
          "notes": "Allure endurance : 6:09 - 7:06/km\nSortie longue : 18 km (~119 min)",
          "notesEn": "Easy pace: 6:09 - 7:06/km\nLong run: 18 km (~119 min)",
          "targetDurationMin": 119,
          "loadScore": 43.4,
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
        }
      ],
      "weekLabel": "S10",
      "weekLabelEn": "W10",
      "targetKm": 39,
      "targetLongRunKm": 18,
      "weeklyLoadScore": 180
    },
    {
      "weekNumber": 11,
      "phase": "peak",
      "isRecoveryWeek": false,
      "volumePercent": 100,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "STR-010",
          "sessionType": "strength",
          "isKeySession": false,
          "estimatedDurationMin": 23,
          "notes": "Renforcement : Core running-specific",
          "notesEn": "Strength: Running-Specific Core",
          "loadScore": 15
        },
        {
          "dayOfWeek": 1,
          "workoutId": "REC-006",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 20,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 20,
          "loadScore": 14,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ]
        },
        {
          "dayOfWeek": 3,
          "workoutId": "THR-014",
          "sessionType": "threshold",
          "isKeySession": true,
          "estimatedDurationMin": 45,
          "notes": "Allure seuil : 5:14 - 5:26/km",
          "notesEn": "Threshold pace: 5:14 - 5:26/km",
          "targetDurationMin": 45,
          "loadScore": 58.5,
          "paceNotes": [
            {
              "zone": "T",
              "paceMinKm": 5.24,
              "paceMaxKm": 5.43,
              "description": "Allure seuil",
              "descriptionEn": "Threshold pace"
            }
          ]
        },
        {
          "dayOfWeek": 4,
          "workoutId": "REC-006",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 20,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 20,
          "loadScore": 14,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ]
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-001",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 126,
          "notes": "Allure endurance : 6:09 - 7:06/km\nSortie longue : 19 km (~126 min)",
          "notesEn": "Easy pace: 6:09 - 7:06/km\nLong run: 19 km (~126 min)",
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
        }
      ],
      "weekLabel": "S11",
      "weekLabelEn": "W11",
      "targetKm": 33,
      "targetLongRunKm": 19,
      "weeklyLoadScore": 157
    },
    {
      "weekNumber": 12,
      "phase": "peak",
      "isRecoveryWeek": true,
      "volumePercent": 65,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "STR-015",
          "sessionType": "strength",
          "isKeySession": false,
          "estimatedDurationMin": 25,
          "notes": "Renforcement : Recup foam roller",
          "notesEn": "Strength: Foam Roller Recovery",
          "loadScore": 8
        },
        {
          "dayOfWeek": 1,
          "workoutId": "END-012",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 38,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 38,
          "loadScore": 26.6,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ]
        },
        {
          "dayOfWeek": 3,
          "workoutId": "END-012",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 38,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 38,
          "loadScore": 26.6,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ]
        },
        {
          "dayOfWeek": 4,
          "workoutId": "END-012",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 38,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 38,
          "loadScore": 26.6,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ]
        },
        {
          "dayOfWeek": 6,
          "workoutId": "END-012",
          "sessionType": "endurance",
          "isKeySession": false,
          "estimatedDurationMin": 38,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 38,
          "loadScore": 26.6,
          "paceNotes": [
            {
              "zone": "E",
              "paceMinKm": 6.15,
              "paceMaxKm": 7.1,
              "description": "Allure endurance",
              "descriptionEn": "Easy pace"
            }
          ]
        }
      ],
      "weekLabel": "Semaine de récupération",
      "weekLabelEn": "Recovery Week",
      "targetKm": 23,
      "targetLongRunKm": 0,
      "weeklyLoadScore": 106
    },
    {
      "weekNumber": 13,
      "phase": "taper",
      "isRecoveryWeek": false,
      "volumePercent": 64,
      "sessions": [
        {
          "dayOfWeek": 0,
          "workoutId": "STR-014",
          "sessionType": "strength",
          "isKeySession": false,
          "estimatedDurationMin": 23,
          "notes": "Renforcement : Mobilite hanches coureur",
          "notesEn": "Strength: Runner Hip Mobility",
          "loadScore": 8
        },
        {
          "dayOfWeek": 1,
          "workoutId": "REC-012",
          "sessionType": "recovery",
          "isKeySession": false,
          "estimatedDurationMin": 20,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 20,
          "loadScore": 13.3,
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
          ]
        },
        {
          "dayOfWeek": 3,
          "workoutId": "RP-015",
          "sessionType": "race_specific",
          "isKeySession": true,
          "estimatedDurationMin": 55,
          "notes": "Allure marathon : 5:46 - 5:55/km",
          "notesEn": "Marathon pace: 5:46 - 5:55/km",
          "targetDurationMin": 55,
          "loadScore": 55,
          "paceNotes": [
            {
              "zone": "T",
              "paceMinKm": 5.24,
              "paceMaxKm": 5.43,
              "description": "Allure seuil",
              "descriptionEn": "Threshold pace"
            }
          ]
        },
        {
          "dayOfWeek": 4,
          "workoutId": "REC-007",
          "sessionType": "recovery",
          "isKeySession": false,
          "estimatedDurationMin": 20,
          "notes": "Allure endurance : 6:09 - 7:06/km",
          "notesEn": "Easy pace: 6:09 - 7:06/km",
          "targetDurationMin": 20,
          "loadScore": 12.6,
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
          ]
        },
        {
          "dayOfWeek": 6,
          "workoutId": "SL-012",
          "sessionType": "long_run",
          "isKeySession": false,
          "estimatedDurationMin": 83,
          "notes": "Allure endurance : 6:09 - 7:06/km\nSortie longue : 12.5 km (~83 min)",
          "notesEn": "Easy pace: 6:09 - 7:06/km\nLong run: 12.5 km (~83 min)",
          "targetDurationMin": 83,
          "loadScore": 34.3,
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
        }
      ],
      "weekLabel": "S13",
      "weekLabelEn": "W13",
      "targetKm": 28,
      "targetLongRunKm": 12.5,
      "weeklyLoadScore": 115
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
          "estimatedDurationMin": 9,
          "notes": "Footing léger - semaine de course",
          "notesEn": "Easy jog - race week"
        },
        {
          "dayOfWeek": 1,
          "workoutId": "REC-001",
          "sessionType": "recovery",
          "isKeySession": false,
          "estimatedDurationMin": 9,
          "notes": "Footing léger - semaine de course",
          "notesEn": "Easy jog - race week"
        },
        {
          "dayOfWeek": 2,
          "workoutId": "STR-015",
          "sessionType": "strength",
          "isKeySession": false,
          "estimatedDurationMin": 25,
          "notes": "Renforcement : Recup foam roller",
          "notesEn": "Strength: Foam Roller Recovery",
          "loadScore": 8
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
        }
      ],
      "weekLabel": "Semaine de course",
      "weekLabelEn": "Race week",
      "targetKm": 26
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
  "peakWeeklyKm": 50,
  "peakLongRunKm": 19
};
