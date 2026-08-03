/**
 * Экспорт типов данных для "БИТВА УМНИКОВ"
 */
export * from './types';

// Загрузка тестов из JSON
import testsData from './tests.json';
import type { Test } from './types';

export const tests: Test[] = testsData as Test[];

export function getTestById(id: string): Test | undefined {
  return tests.find(t => t.id === id);
}

export function getAllTestTags(): string[] {
  return tests.map(t => t.title);
}

export function searchTests(query: string): Test[] {
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) return [];
  
  return tests.filter(t => 
    t.title.toLowerCase().includes(normalizedQuery) ||
    t.description.toLowerCase().includes(normalizedQuery)
  );
}
