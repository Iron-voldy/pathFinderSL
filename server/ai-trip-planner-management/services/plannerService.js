const sequelize = require('../../config/database');
const { QueryTypes } = require('sequelize');
const {
  CHAT_MODEL,
  EMBEDDING_MODEL,
  createStructuredResponse,
  createTextResponse,
  createEmbedding,
} = require('./openAiService');

const CITY_ALIASES = new Map([
  ['sigiriya', 'Sigiriya'],
  ['dambulla', 'Sigiriya'],
  ['kandy', 'Kandy'],
  ['galle', 'Galle'],
  ['ella', 'Ella'],
  ['yala', 'Yala'],
  ['mirissa', 'Mirissa'],
  ['nuwaraeliya', 'Nuwaraeliya'],
  ['nuwara eliya', 'Nuwaraeliya'],
  ['arugambay', 'ArugamBay'],
  ['arugam bay', 'ArugamBay'],
  ['anuradhapura', 'Anuradhapura'],
  ['trincomalee', 'Trincomalee'],
  ['negombo', 'Negombo'],
  ['bentota', 'Bentota'],
  ['colombo', 'Colombo'],
  ['polonnaruwa', 'Polonnaruwa'],
  ['hikkaduwa', 'Hikkaduwa'],
  ['weligama', 'Weligama'],
  ['kitulgala', 'Kitulgala'],
  ['jaffna', 'Jaffna'],
  ['kalpitiya', 'Kalpitiya'],
]);

const ALLOWED_MOOD_TAGS = [
  'relaxation',
  'beach',
  'culture',
  'adventure',
  'wildlife',
  'family',
  'romance',
  'food',
  'photography',
  'nature',
];

const THEME_SCORE_COLUMNS = {
  adventure: 'adventure_score',
  culture: 'cultural_score',
  relaxation: 'relaxation_score',
  family: 'family_score',
  romance: 'romance_score',
  nature: 'nature_score',
  beach: 'beaches_score',
  food: 'food_score',
  photography: 'photography_score',
  wildlife: 'wildlife_score',
};

const STRONG_NOISE_PATTERNS = [
  /\bday tour from\b/i,
  /\bday visit from\b/i,
  /\bexcursion\b/i,
  /\bairport\b/i,
  /\btransfer\b/i,
  /\bvisa\b/i,
  /\bticket\b/i,
  /\bround tour\b/i,
  /\bshort city tour\b/i,
  /\bwithout entrance\b/i,
];

const LIGHT_NOISE_PATTERNS = [/\bshared\b/i, /\bprivate\b/i, /\bpackage\b/i];

const EXTRA_DESTINATION_TERMS = [
  'mirissa',
  'weligama',
  'trincomalee',
  'nilaveli',
  'kalpitiya',
  'arugam',
  'bentota',
  'hikkaduwa',
  'unawatuna',
  'secret beach',
  'marble beach',
];

function normalizeText(value) {
  return String(value || '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

function uniqueStrings(values) {
  return [...new Set(values.filter(Boolean))];
}

function normalizeCity(city) {
  const value = normalizeText(city);
  if (!value) return '';
  return CITY_ALIASES.get(value) || CITY_ALIASES.get(value.replace(/\s+/g, '')) || city;
}

function normalizeTag(tag) {
  const value = normalizeText(tag);
  if (value === 'cultural') return 'culture';
  if (value === 'relaxing') return 'relaxation';
  if (value === 'beaches') return 'beach';
  return ALLOWED_MOOD_TAGS.includes(value) ? value : '';
}

function normalizePlannerState(raw = {}) {
  return {
    days: Number(raw.days) > 0 ? Number(raw.days) : 0,
    travelers: Number(raw.travelers) > 0 ? Number(raw.travelers) : 0,
    moodTags: uniqueStrings((raw.moodTags || []).map(normalizeTag)).filter(Boolean),
    preferredCities: uniqueStrings((raw.preferredCities || []).map(normalizeCity)).filter(Boolean),
    budgetLevel: ['unknown', 'low', 'medium', 'high', 'luxury'].includes(raw.budgetLevel)
      ? raw.budgetLevel
      : 'unknown',
    routeStyle: ['unknown', 'single-city', 'multi-city'].includes(raw.routeStyle)
      ? raw.routeStyle
      : 'unknown',
    hotelPreference: ['unknown', 'budget', 'comfort', 'luxury'].includes(raw.hotelPreference)
      ? raw.hotelPreference
      : 'unknown',
    originCity: normalizeCity(raw.originCity || ''),
    transportNeeded: Boolean(raw.transportNeeded),
    notes: String(raw.notes || '').trim(),
  };
}

function mergePlannerState(baseState, extractedState) {
  const next = normalizePlannerState(baseState);
  const extracted = normalizePlannerState(extractedState);

  if (extracted.days > 0) next.days = extracted.days;
  if (extracted.travelers > 0) next.travelers = extracted.travelers;
  if (extracted.moodTags.length) next.moodTags = uniqueStrings([...next.moodTags, ...extracted.moodTags]);
  if (extracted.preferredCities.length) {
    next.preferredCities = uniqueStrings([...next.preferredCities, ...extracted.preferredCities]);
  }
  if (extracted.budgetLevel !== 'unknown') next.budgetLevel = extracted.budgetLevel;
  if (extracted.routeStyle !== 'unknown') next.routeStyle = extracted.routeStyle;
  if (extracted.hotelPreference !== 'unknown') next.hotelPreference = extracted.hotelPreference;
  if (extracted.originCity) next.originCity = extracted.originCity;
  if (extracted.transportNeeded) next.transportNeeded = true;
  if (extracted.notes) {
    next.notes = uniqueStrings([next.notes, extracted.notes]).join(' | ').trim();
  }

  return next;
}

function listMissingFields(state) {
  const missing = [];
  if (!state.days) missing.push('days');
  if (!state.travelers) missing.push('travelers');
  if (!state.moodTags.length) missing.push('moodTags');
  return missing;
}

function buildFollowUp(state) {
  const missing = listMissingFields(state);
  const primary = missing[0];

  if (primary === 'days') {
    return {
      field: 'days',
      question: 'How many days do you want for this trip?',
      suggestions: ['2 days', '3 days', '5 days'],
    };
  }

  if (primary === 'travelers') {
    return {
      field: 'travelers',
      question: 'How many people are traveling with you?',
      suggestions: ['1 person', '2 people', '4 people'],
    };
  }

  if (primary === 'moodTags') {
    return {
      field: 'moodTags',
      question: 'What kind of trip mood do you want?',
      suggestions: ['Relaxing beach', 'Culture and history', 'Adventure'],
    };
  }

  if (state.budgetLevel === 'unknown') {
    return {
      field: 'budgetLevel',
      question: 'What budget level do you prefer for this trip?',
      suggestions: ['Low budget', 'Medium budget', 'Luxury'],
    };
  }

  return null;
}

async function extractTripRequirements(message, plannerState) {
  const schema = {
    type: 'object',
    properties: {
      days: { type: 'integer', minimum: 0 },
      travelers: { type: 'integer', minimum: 0 },
      moodTags: {
        type: 'array',
        items: {
          type: 'string',
          enum: ALLOWED_MOOD_TAGS,
        },
      },
      preferredCities: {
        type: 'array',
        items: { type: 'string' },
      },
      budgetLevel: {
        type: 'string',
        enum: ['unknown', 'low', 'medium', 'high', 'luxury'],
      },
      routeStyle: {
        type: 'string',
        enum: ['unknown', 'single-city', 'multi-city'],
      },
      hotelPreference: {
        type: 'string',
        enum: ['unknown', 'budget', 'comfort', 'luxury'],
      },
      originCity: { type: 'string' },
      transportNeeded: { type: 'boolean' },
      notes: { type: 'string' },
    },
    required: [
      'days',
      'travelers',
      'moodTags',
      'preferredCities',
      'budgetLevel',
      'routeStyle',
      'hotelPreference',
      'originCity',
      'transportNeeded',
      'notes',
    ],
    additionalProperties: false,
  };

  const systemPrompt = [
    'You extract structured travel requirements for a Sri Lanka trip planner.',
    'Use only facts explicitly mentioned in the latest user message.',
    'Do not guess missing values.',
    'Return days or travelers as 0 when unknown.',
    'Normalize moodTags to this set only: relaxation, beach, culture, adventure, wildlife, family, romance, food, photography, nature.',
    'Set budgetLevel to unknown unless the user clearly indicates a budget preference.',
    'Set routeStyle to multi-city only if the user clearly asks for multiple places or a moving route.',
    'Set hotelPreference to budget, comfort, or luxury only if explicitly indicated.',
    'Set transportNeeded to true only if the user asks for a car, driver, or transport help.',
    'Preferred cities should be Sri Lanka city names if clearly mentioned.',
  ].join(' ');

  const userPrompt = [
    `Current planner state: ${JSON.stringify(normalizePlannerState(plannerState))}`,
    `Latest user message: ${message}`,
  ].join('\n');

  return createStructuredResponse({
    schemaName: 'trip_requirements',
    schema,
    systemPrompt,
    userPrompt,
  });
}

function parseEmbedding(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function cosineSimilarity(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length || a.length === 0) return 0;

  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }

  if (!magA || !magB) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

function normalizeTagList(tags) {
  return uniqueStrings(
    String(tags || '')
      .split(',')
      .map((value) => normalizeTag(value))
      .filter(Boolean)
  );
}

function parseNumeric(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function parseStarValue(value) {
  const match = String(value || '').match(/(\d+)/);
  return match ? Number(match[1]) : 0;
}

function extractDurationNights(name) {
  const match = String(name || '').match(/(\d+)\s*night/i);
  return match ? Number(match[1]) : 0;
}

function extractProviderKey(name) {
  const match = String(name || '').match(/\bby\s+(.+)$/i);
  return match ? normalizeText(match[1]) : '';
}

function extractActivityFingerprint(name) {
  return normalizeText(name)
    .replace(/\b\d+\s*(day|days|night|nights|hour|hours)\b/g, '')
    .replace(/\bprivate\b/g, '')
    .replace(/\bshared\b/g, '')
    .replace(/\bby\s+.+$/g, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function computeNoisePenalty(row) {
  const name = String(row.lifestyle_name || '');
  let penalty = 0;

  for (const pattern of STRONG_NOISE_PATTERNS) {
    if (pattern.test(name)) penalty += 0.2;
  }

  for (const pattern of LIGHT_NOISE_PATTERNS) {
    if (pattern.test(name)) penalty += 0.03;
  }

  if (
    normalizeCity(row.canonical_city) === 'Colombo' &&
    /\bto\b/i.test(name) &&
    EXTRA_DESTINATION_TERMS.some((term) => name.toLowerCase().includes(term))
  ) {
    penalty += 0.18;
  }

  return Math.min(0.45, penalty);
}

function computeThemeScore(row, desiredTags) {
  if (!desiredTags.length) return 0;

  const tagSet = new Set(normalizeTagList(row.theme_tags));

  let score = 0;
  for (const tag of desiredTags) {
    const column = THEME_SCORE_COLUMNS[tag];
    const modelScore = column ? parseNumeric(row[column]) : 0;
    const tagBoost = tagSet.has(tag) ? 1 : 0;
    score += Math.max(modelScore, tagBoost);
  }

  return score / desiredTags.length;
}

function buildSearchPrompt(state) {
  const parts = [
    `${state.days}-day Sri Lanka trip`,
    `${state.travelers} traveler${state.travelers === 1 ? '' : 's'}`,
    state.moodTags.join(' '),
    state.preferredCities.join(' '),
    state.budgetLevel !== 'unknown' ? `${state.budgetLevel} budget` : '',
    state.hotelPreference !== 'unknown' ? `${state.hotelPreference} hotel` : '',
    state.notes || '',
  ];

  return parts.filter(Boolean).join(' | ');
}

async function fetchActivityCandidates() {
  return sequelize.query(
    `
      SELECT
        c.source_lifestyle_id,
        c.canonical_city,
        c.lifestyle_name,
        c.lifestyle_description,
        c.theme_tags,
        c.category_keys,
        c.price_text,
        i.text_embedding,
        i.adventure_score,
        i.cultural_score,
        i.relaxation_score,
        i.family_score,
        i.romance_score,
        i.nature_score,
        i.beaches_score,
        i.food_score,
        i.photography_score,
        i.wildlife_score
      FROM ai_lifestyle_clean c
      INNER JOIN tbl_lifestyle_intelligence i
        ON i.lifestyle_id = c.source_lifestyle_id
      WHERE i.text_embedding IS NOT NULL
    `,
    { type: QueryTypes.SELECT }
  );
}

async function fetchHotelsByCity() {
  const rows = await sequelize.query(
    `
      SELECT
        id,
        hotel_name,
        city,
        micro_location,
        star_classification,
        hotel_status
      FROM hotels
      WHERE deleted_at IS NULL
        AND (hotel_status IS NULL OR hotel_status = 'active')
    `,
    { type: QueryTypes.SELECT }
  );

  const grouped = new Map();

  for (const row of rows) {
    const city = normalizeCity(row.city);
    if (!city) continue;
    const current = grouped.get(city) || [];
    current.push(row);
    grouped.set(city, current);
  }

  for (const [city, cityHotels] of grouped.entries()) {
    cityHotels.sort((a, b) => parseStarValue(b.star_classification) - parseStarValue(a.star_classification));
    grouped.set(city, cityHotels);
  }

  return grouped;
}

async function fetchTransportSuggestions(state, targetCity) {
  if (!state.transportNeeded && state.travelers <= 4) {
    return [];
  }

  const rows = await sequelize.query(
    `
      SELECT
        id,
        title,
        start_location,
        end_location,
        vehicle_category,
        vehicle_type,
        passenger_capacity,
        price_per_day,
        currency
      FROM transport_gigs
      WHERE deleted_at IS NULL
        AND status = 'active'
        AND passenger_capacity >= :travelers
      ORDER BY passenger_capacity ASC, price_per_day ASC
      LIMIT 25
    `,
    {
      type: QueryTypes.SELECT,
      replacements: {
        travelers: Math.max(1, state.travelers || 1),
      },
    }
  );

  const targetKey = normalizeText(targetCity);
  const originKey = normalizeText(state.originCity);

  return rows
    .map((row) => {
      const routeText = `${row.start_location} ${row.end_location} ${row.title}`.toLowerCase();
      let score = 0;
      if (targetKey && routeText.includes(targetKey)) score += 1;
      if (originKey && routeText.includes(originKey)) score += 1;
      score += Math.max(0, 0.5 - Math.abs((row.passenger_capacity || 0) - state.travelers) * 0.05);
      return { ...row, matchScore: score };
    })
    .filter((row) => row.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 3)
    .map((row) => ({
      id: row.id,
      title: row.title,
      route: `${row.start_location} to ${row.end_location}`,
      vehicle: `${row.vehicle_type} (${row.vehicle_category})`,
      capacity: row.passenger_capacity,
      pricePerDay: Number(row.price_per_day || 0),
      currency: row.currency || 'LKR',
    }));
}

function selectCities(cityScores, preferredCities, desiredCount) {
  const preferred = [];
  const fallback = [];

  for (const entry of cityScores) {
    if (preferredCities.includes(entry.city)) preferred.push(entry);
    else fallback.push(entry);
  }

  return uniqueStrings(
    [...preferred.map((item) => item.city), ...fallback.map((item) => item.city)].slice(0, desiredCount)
  );
}

function buildItinerary(selectedCities, rankedActivities, hotelMap, totalDays) {
  const perCityDays = [];

  if (selectedCities.length === 1) {
    perCityDays.push({ city: selectedCities[0], days: totalDays });
  } else if (selectedCities.length > 1) {
    const firstCityDays = Math.ceil(totalDays / selectedCities.length);
    let assigned = 0;
    for (let i = 0; i < selectedCities.length; i += 1) {
      const remainingCities = selectedCities.length - i;
      const remainingDays = totalDays - assigned;
      const daysForCity = i === 0 ? firstCityDays : Math.max(1, Math.ceil(remainingDays / remainingCities));
      perCityDays.push({ city: selectedCities[i], days: daysForCity });
      assigned += daysForCity;
    }
  }

  const usedIds = new Set();
  const usedProviders = new Set();
  const usedFingerprints = new Set();
  const itinerary = [];
  let dayNumber = 1;

  for (const cityPlan of perCityDays) {
    const cityActivities = rankedActivities.filter((item) => item.canonical_city === cityPlan.city);
    const hotel = (hotelMap.get(cityPlan.city) || [])[0] || null;

    for (let cityDay = 0; cityDay < cityPlan.days; cityDay += 1) {
      const dayActivities = [];
      const passes = ['strict', 'relaxed'];

      for (const pass of passes) {
        for (const activity of cityActivities) {
          if (usedIds.has(activity.source_lifestyle_id)) continue;
          if (dayActivities.length === 2) break;

          const providerKey = extractProviderKey(activity.lifestyle_name);
          const fingerprint = extractActivityFingerprint(activity.lifestyle_name);
          const durationNights = extractDurationNights(activity.lifestyle_name);

          if (durationNights > 0 && durationNights >= totalDays) continue;
          if (pass === 'strict' && providerKey && usedProviders.has(providerKey)) continue;
          if (pass === 'strict' && fingerprint && usedFingerprints.has(fingerprint)) continue;

          dayActivities.push({
            lifestyleId: activity.source_lifestyle_id,
            name: activity.lifestyle_name,
            city: activity.canonical_city,
            tags: normalizeTagList(activity.theme_tags),
            score: Number(activity.finalScore.toFixed(4)),
            price: activity.price_text || null,
          });
          usedIds.add(activity.source_lifestyle_id);
          if (providerKey) usedProviders.add(providerKey);
          if (fingerprint) usedFingerprints.add(fingerprint);
        }

        if (dayActivities.length === 2) break;
      }

      itinerary.push({
        day: dayNumber,
        city: cityPlan.city,
        hotel: hotel
          ? {
              id: hotel.id,
              name: hotel.hotel_name,
              city: hotel.city,
              microLocation: hotel.micro_location,
              starClassification: hotel.star_classification,
            }
          : null,
        activities: dayActivities,
      });

      dayNumber += 1;
    }
  }

  return itinerary;
}

async function planTrip(state) {
  const [queryEmbedding, activities, hotelMap] = await Promise.all([
    createEmbedding(buildSearchPrompt(state)),
    fetchActivityCandidates(),
    fetchHotelsByCity(),
  ]);

  if (!queryEmbedding) {
    throw new Error('Failed to generate the query embedding for trip planning.');
  }

  const rankedActivities = activities
    .map((row) => {
      const embedding = parseEmbedding(row.text_embedding);
      const semanticScore = cosineSimilarity(queryEmbedding, embedding);
      const themeScore = computeThemeScore(row, state.moodTags);
      const cityBoost = state.preferredCities.includes(row.canonical_city) ? 0.1 : 0;
      const hotelBoost = hotelMap.has(row.canonical_city) ? 0.05 : 0;
      const penalty = computeNoisePenalty(row);
      const finalScore = semanticScore * 0.62 + themeScore * 0.26 + cityBoost + hotelBoost - penalty;

      return {
        ...row,
        semanticScore,
        themeScore,
        penalty,
        finalScore,
      };
    })
    .filter((row) => row.finalScore > 0.15)
    .sort((a, b) => b.finalScore - a.finalScore);

  if (!rankedActivities.length) {
    throw new Error('The AI planner could not find enough grounded attraction data to build an itinerary.');
  }

  const cityAccumulator = new Map();
  for (const activity of rankedActivities.slice(0, 140)) {
    const current = cityAccumulator.get(activity.canonical_city) || { score: 0, count: 0 };
    current.score += activity.finalScore;
    current.count += 1;
    cityAccumulator.set(activity.canonical_city, current);
  }

  const cityScores = [...cityAccumulator.entries()]
    .map(([city, info]) => ({
      city,
      score: info.score / Math.max(1, Math.min(info.count, 6)),
      count: info.count,
    }))
    .filter((item) => item.count >= 2)
    .sort((a, b) => b.score - a.score);

  const desiredCityCount =
    state.routeStyle === 'multi-city' || state.days >= 5 || state.preferredCities.length > 1 ? 2 : 1;
  const selectedCities = selectCities(
    cityScores,
    state.preferredCities,
    Math.min(desiredCityCount, Math.max(1, cityScores.length))
  );

  const itinerary = buildItinerary(selectedCities, rankedActivities, hotelMap, state.days);
  const transportSuggestions = await fetchTransportSuggestions(state, selectedCities[0] || '');

  return {
    plannerState: state,
    selectedCities: cityScores.filter((item) => selectedCities.includes(item.city)).map((item) => ({
      city: item.city,
      score: Number(item.score.toFixed(4)),
      candidateCount: item.count,
    })),
    itinerary,
    transportSuggestions,
    grounding: {
      embeddingModel: EMBEDDING_MODEL,
      activityRowsRanked: rankedActivities.length,
      scoringModel: 'hybrid-semantic-ranking-v1',
    },
  };
}

function buildFallbackNarrative(plan) {
  const cities = plan.selectedCities.map((item) => item.city).join(', ');
  const firstHotel = plan.itinerary.find((item) => item.hotel)?.hotel?.name;
  const activityNames = plan.itinerary
    .flatMap((item) => item.activities.map((activity) => activity.name))
    .slice(0, 4)
    .join(', ');

  const hotelText = firstHotel ? ` I matched a hotel option starting with ${firstHotel}.` : '';
  const activityText = activityNames ? ` Key activities include ${activityNames}.` : '';

  return `I planned a ${plan.plannerState.days}-day Sri Lanka itinerary focused on ${plan.plannerState.moodTags.join(', ')} around ${cities}.${hotelText}${activityText}`;
}

async function createNarrative(plan) {
  const systemPrompt = [
    'You are PathFinderSL AI, a Sri Lanka trip planner.',
    'Write a concise, grounded reply based only on the supplied itinerary JSON.',
    'Do not invent prices, locations, or hotels that are not in the JSON.',
    'Keep the tone practical and friendly.',
    'Mention why the selected city or cities match the requested mood.',
  ].join(' ');

  const userPrompt = JSON.stringify(
    {
      preferences: plan.plannerState,
      selectedCities: plan.selectedCities,
      itinerary: plan.itinerary,
      transportSuggestions: plan.transportSuggestions,
    },
    null,
    2
  );

  try {
    const responseText = await createTextResponse({
      systemPrompt,
      userPrompt,
      maxOutputTokens: 260,
    });
    return responseText || buildFallbackNarrative(plan);
  } catch {
    return buildFallbackNarrative(plan);
  }
}

async function handlePlannerMessage({ message, plannerState = {} }) {
  const currentState = normalizePlannerState(plannerState);
  const extracted = await extractTripRequirements(message, currentState);
  const nextState = mergePlannerState(currentState, extracted);
  const followUp = buildFollowUp(nextState);

  if (followUp) {
    const missing = listMissingFields(nextState);
    const assistantMessage =
      missing.length > 0
        ? `I can build the trip for you. ${followUp.question}`
        : `I have enough to start planning, but one more detail will help. ${followUp.question}`;

    return {
      status: 'needs_more_info',
      assistantMessage,
      plannerState: nextState,
      followUp,
      itinerary: null,
      transportSuggestions: [],
      modelsUsed: {
        extraction: CHAT_MODEL,
        retrieval: EMBEDDING_MODEL,
      },
    };
  }

  const plan = await planTrip(nextState);
  const assistantMessage = await createNarrative(plan);

  return {
    status: 'planned',
    assistantMessage,
    plannerState: plan.plannerState,
    followUp: null,
    itinerary: plan.itinerary,
    selectedCities: plan.selectedCities,
    transportSuggestions: plan.transportSuggestions,
    grounding: plan.grounding,
    modelsUsed: {
      extraction: CHAT_MODEL,
      retrieval: EMBEDDING_MODEL,
      narration: CHAT_MODEL,
    },
  };
}

async function getPlannerHealth() {
  const [[cleanTable], [intelligenceTable]] = await Promise.all([
    sequelize.query('SELECT COUNT(*) AS total FROM ai_lifestyle_clean', { type: QueryTypes.SELECT }),
    sequelize.query('SELECT COUNT(*) AS total FROM tbl_lifestyle_intelligence', { type: QueryTypes.SELECT }),
  ]);

  return {
    aiLifestyleCleanRows: cleanTable.total,
    lifestyleIntelligenceRows: intelligenceTable.total,
    chatModel: CHAT_MODEL,
    embeddingModel: EMBEDDING_MODEL,
  };
}

module.exports = {
  handlePlannerMessage,
  getPlannerHealth,
  normalizePlannerState,
};
