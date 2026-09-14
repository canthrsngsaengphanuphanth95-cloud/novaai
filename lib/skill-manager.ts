/**
 * Skill Management System
 * CRUD operations, versioning, categorization, and usage tracking
 */

export interface Skill {
  id: string;
  name: string;
  description: string;
  category: 'coding' | 'writing' | 'analysis' | 'design' | 'marketing' | 'other';
  tags: string[];
  content: string;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
  currentVersion: number;
  versionHistory: SkillVersion[];
}

export interface SkillVersion {
  version: number;
  content: string;
  timestamp: string;
  changeNotes: string;
}

export interface SkillStats {
  totalSkills: number;
  byCategory: Record<string, number>;
  mostUsed: Skill[];
  recentlyAdded: Skill[];
}

export interface ExportedSkills {
  exportedAt: string;
  version: string;
  totalSkills: number;
  skills: Skill[];
}

/**
 * Create a new skill
 */
export function createSkill(
  name: string,
  description: string,
  content: string,
  category: Skill['category'] = 'other',
  tags: string[] = []
): Skill {
  const now = new Date().toISOString();
  const id = `skill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  return {
    id,
    name,
    description,
    category,
    tags,
    content,
    usageCount: 0,
    createdAt: now,
    updatedAt: now,
    currentVersion: 1,
    versionHistory: [
      {
        version: 1,
        content,
        timestamp: now,
        changeNotes: 'Initial version',
      },
    ],
  };
}

/**
 * Update skill with version tracking
 */
export function updateSkill(
  skill: Skill,
  updates: Partial<Skill>,
  changeNotes: string
): Skill {
  const newVersion = skill.currentVersion + 1;
  const now = new Date().toISOString();

  const versionEntry: SkillVersion = {
    version: newVersion,
    content: updates.content || skill.content,
    timestamp: now,
    changeNotes,
  };

  return {
    ...skill,
    ...updates,
    currentVersion: newVersion,
    updatedAt: now,
    versionHistory: [...skill.versionHistory, versionEntry],
  };
}

/**
 * Revert to a previous version
 */
export function revertToVersion(skill: Skill, versionNumber: number): Skill {
  const version = skill.versionHistory.find((v) => v.version === versionNumber);
  if (!version) {
    throw new Error(`Version ${versionNumber} not found`);
  }

  return updateSkill(skill, { content: version.content }, `Reverted to version ${versionNumber}`);
}

/**
 * Track skill usage
 */
export function incrementSkillUsage(skill: Skill): Skill {
  return {
    ...skill,
    usageCount: skill.usageCount + 1,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Filter skills by category
 */
export function filterByCategory(
  skills: Skill[],
  category: Skill['category']
): Skill[] {
  return skills.filter((skill) => skill.category === category);
}

/**
 * Filter skills by tags
 */
export function filterByTags(skills: Skill[], tags: string[]): Skill[] {
  return skills.filter((skill) =>
    tags.some((tag) => skill.tags.includes(tag))
  );
}

/**
 * Search skills by name, description, or content
 */
export function searchSkills(skills: Skill[], query: string): Skill[] {
  const lowerQuery = query.toLowerCase();
  return skills.filter(
    (skill) =>
      skill.name.toLowerCase().includes(lowerQuery) ||
      skill.description.toLowerCase().includes(lowerQuery) ||
      skill.content.toLowerCase().includes(lowerQuery) ||
      skill.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Get skill statistics
 */
export function getSkillStats(skills: Skill[]): SkillStats {
  const byCategory: Record<string, number> = {
    coding: 0,
    writing: 0,
    analysis: 0,
    design: 0,
    marketing: 0,
    other: 0,
  };

  skills.forEach((skill) => {
    byCategory[skill.category]++;
  });

  const mostUsed = [...skills]
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, 5);

  const recentlyAdded = [...skills]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

  return {
    totalSkills: skills.length,
    byCategory,
    mostUsed,
    recentlyAdded,
  };
}

/**
 * Export skills to JSON
 */
export function exportSkillsToJSON(skills: Skill[]): string {
  const exported: ExportedSkills = {
    exportedAt: new Date().toISOString(),
    version: '1.0',
    totalSkills: skills.length,
    skills,
  };

  return JSON.stringify(exported, null, 2);
}

/**
 * Export skills as downloadable file
 */
export function downloadSkillsAsJSON(skills: Skill[], filename: string = 'novaai-skills.json'): void {
  const content = exportSkillsToJSON(skills);
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Import skills from JSON string
 */
export function importSkillsFromJSON(jsonString: string): Skill[] {
  try {
    const data = JSON.parse(jsonString) as ExportedSkills;

    if (!Array.isArray(data.skills)) {
      throw new Error('Invalid skills format');
    }

    // Reassign IDs to avoid conflicts
    return data.skills.map((skill) => ({
      ...skill,
      id: `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      usageCount: 0, // Reset usage count
    }));
  } catch (error) {
    throw new Error(`Failed to import skills: ${error}`);
  }
}

/**
 * Import skills from file upload
 */
export async function importSkillsFromFile(file: File): Promise<Skill[]> {
  const content = await file.text();
  return importSkillsFromJSON(content);
}

/**
 * Merge imported skills with existing ones (avoiding duplicates by name)
 */
export function mergeSkills(existing: Skill[], imported: Skill[]): Skill[] {
  const existingNames = new Set(existing.map((s) => s.name.toLowerCase()));
  const newSkills = imported.filter(
    (s) => !existingNames.has(s.name.toLowerCase())
  );

  return [...existing, ...newSkills];
}

/**
 * Export skills as CSV
 */
export function exportSkillsToCSV(skills: Skill[]): string {
  const headers = ['Name', 'Category', 'Description', 'Tags', 'Usage Count', 'Created At'];
  const rows = skills.map((skill) => [
    skill.name,
    skill.category,
    skill.description.replace(/,/g, ';'),
    skill.tags.join(';'),
    skill.usageCount,
    skill.createdAt,
  ]);

  const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
  return csv;
}

/**
 * Download skills as CSV
 */
export function downloadSkillsAsCSV(skills: Skill[], filename: string = 'novaai-skills.csv'): void {
  const content = exportSkillsToCSV(skills);
  const blob = new Blob([content], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
