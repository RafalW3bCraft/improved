/**
 * Generate Spanish idioms and cultural expressions based on filters
 */
export async function generateIdioms(
  difficulty: string,
  region: string,
  category: string,
  count: number = 5
): Promise<any> {
  const response = await fetch('/api/cultural-context/idioms', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      difficulty,
      region,
      category,
      count
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch idioms');
  }

  return response.json();
}

/**
 * Get cultural context information for a specific region
 */
export async function getCulturalContext(
  region: string,
  topic: string = 'general'
): Promise<any> {
  const response = await fetch('/api/cultural-context/region', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      region,
      topic
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch cultural context');
  }

  return response.json();
}

/**
 * Generate practice exercises for idioms
 */
export async function generateExercises(
  idioms: string[],
  exerciseType: string = 'multiple-choice'
): Promise<any> {
  const response = await fetch('/api/cultural-context/exercises', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      idioms,
      exerciseType
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate exercises');
  }

  return response.json();
}

/**
 * Get feedback on user's idiom usage
 */
export async function getFeedback(userResponses: any[]): Promise<any> {
  const response = await fetch('/api/cultural-context/feedback', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userResponses
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to get feedback');
  }

  return response.json();
}