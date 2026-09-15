/**
 * Skill Organization and Tagging System
 * Categorize, tag, and filter skills for better discovery
 */

export interface SkillTag {
  id: string;
  name: string;
  color: string;
  count: number;
}

export interface SkillCategory {
  id: string;
  name: 'coding' | 'writing' | 'analysis' | 'design' | 'marketing' | 'other';
  description: string;
  icon: string;
  color: string;
}

export interface OrganizedSkill {
  id: string;
  name: string;
  category: SkillCategory['name'];
  tags: string[];
  description: string;
  usageCount: number;
}

// Default skill categories
export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    id: 'cat-coding',
    name: 'coding',
    description: 'Programming and development skills',
    icon: '💻',
    color: '#3b82f6',
  },
  {
    id: 'cat-writing',
    name: 'writing',
    description: 'Writing and content creation skills',
    icon: '✍️',
    color: '#f59e0b',
  },
  {
    id: 'cat-analysis',
    name: 'analysis',
    description: 'Data analysis and research skills',
    icon: '📊',
    color: '#10b981',
  },
  {
    id: 'cat-design',
    name: 'design',
    description: 'Design and UX skills',
    icon: '🎨',
    color: '#ec4899',
  },
  {
    id: 'cat-marketing',
    name: 'marketing',
    description: 'Marketing and business skills',
    icon: '📢',
    color: '#ef4444',
  },
  {
    id: 'cat-other',
    name: 'other',
    description: 'Other skills',
    icon: '⭐',
    color: '#8b5cf6',
  },
];

/**
 * Get category by name
 */
export function getCategoryByName(name: SkillCategory['name']): SkillCategory | undefined {
  return SKILL_CATEGORIES.find((cat) => cat.name === name);
}

/**
 * Extract and normalize tags
 */
export function normalizeTags(tags: string[]): string[] {
  return [
    ...new Set(
      tags
        .map((tag) => tag.toLowerCase().trim())
        .filter((tag) => tag.length > 0)
    ),
  ];
}

/**
 * Get all unique tags from skills
 */
export function getAllTags(skills: OrganizedSkill[]): SkillTag[] {
  const tagMap = new Map<string, number>();

  skills.forEach((skill) => {
    skill.tags.forEach((tag) => {
      tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
    });
  });

  return Array.from(tagMap.entries())
    .map(([name, count], index) => ({
      id: `tag-${index}`,
      name,
      color: generateTagColor(name),
      count,
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Generate a consistent color for a tag
 */
export function generateTagColor(tagName: string): string {
  const colors = [
    '#3b82f6', // blue
    '#ef4444', // red
    '#10b981', // green
    '#f59e0b', // amber
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#14b8a6', // teal
    '#f97316', // orange
  ];

  let hash = 0;
  for (let i = 0; i < tagName.length; i++) {
    hash = tagName.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
}

/**
 * Filter skills by category
 */
export function filterSkillsByCategory(
  skills: OrganizedSkill[],
  categoryName: SkillCategory['name']
): OrganizedSkill[] {
  return skills.filter((skill) => skill.category === categoryName);
}

/**
 * Filter skills by tags (any tag match)
 */
export function filterSkillsByTags(
  skills: OrganizedSkill[],
  tags: string[]
): OrganizedSkill[] {
  if (tags.length === 0) return skills;

  return skills.filter((skill) =>
    tags.some((tag) => skill.tags.includes(tag.toLowerCase()))
  );
}

/**
 * Filter skills by multiple tags (all tags must match)
 */
export function filterSkillsByAllTags(
  skills: OrganizedSkill[],
  tags: string[]
): OrganizedSkill[] {
  if (tags.length === 0) return skills;

  return skills.filter((skill) =>
    tags.every((tag) =>
      skill.tags.some((skillTag) => skillTag.toLowerCase() === tag.toLowerCase())
    )
  );
}

/**
 * Filter skills by category and tags
 */
export function filterSkills(
  skills: OrganizedSkill[],
  category?: SkillCategory['name'],
  tags?: string[]
): OrganizedSkill[] {
  let filtered = skills;

  if (category) {
    filtered = filterSkillsByCategory(filtered, category);
  }

  if (tags && tags.length > 0) {
    filtered = filterSkillsByTags(filtered, tags);
  }

  return filtered;
}

/**
 * Add tag to skill
 */
export function addTagToSkill(skill: OrganizedSkill, tag: string): OrganizedSkill {
  const normalizedTag = tag.toLowerCase().trim();
  if (skill.tags.includes(normalizedTag)) {
    return skill;
  }

  return {
    ...skill,
    tags: [...skill.tags, normalizedTag],
  };
}

/**
 * Remove tag from skill
 */
export function removeTagFromSkill(skill: OrganizedSkill, tag: string): OrganizedSkill {
  return {
    ...skill,
    tags: skill.tags.filter((t) => t.toLowerCase() !== tag.toLowerCase()),
  };
}

/**
 * Bulk add tags to multiple skills
 */
export function bulkAddTags(skills: OrganizedSkill[], skillIds: string[], tags: string[]): OrganizedSkill[] {
  return skills.map((skill) => {
    if (skillIds.includes(skill.id)) {
      return {
        ...skill,
        tags: normalizeTags([...skill.tags, ...tags]),
      };
    }
    return skill;
  });
}

/**
 * Get skills grouped by category
 */
export function groupSkillsByCategory(skills: OrganizedSkill[]): Record<SkillCategory['name'], OrganizedSkill[]> {
  const grouped: Record<SkillCategory['name'], OrganizedSkill[]> = {
    coding: [],
    writing: [],
    analysis: [],
    design: [],
    marketing: [],
    other: [],
  };

  skills.forEach((skill) => {
    grouped[skill.category].push(skill);
  });

  return grouped;
}

/**
 * Get related skills based on tags
 */
export function getRelatedSkills(
  skill: OrganizedSkill,
  allSkills: OrganizedSkill[],
  limit: number = 5
): OrganizedSkill[] {
  const related = allSkills
    .filter((s) => s.id !== skill.id)
    .map((s) => {
      const commonTags = s.tags.filter((tag) => skill.tags.includes(tag)).length;
      const sameCategory = s.category === skill.category ? 1 : 0;
      const relevanceScore = commonTags * 2 + sameCategory;

      return { skill: s, relevanceScore };
    })
    .filter((item) => item.relevanceScore > 0)
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, limit)
    .map((item) => item.skill);

  return related;
}

/**
 * Search skills with tags and category filter
 */
export function searchSkillsAdvanced(
  skills: OrganizedSkill[],
  query: string,
  category?: SkillCategory['name'],
  tags?: string[]
): OrganizedSkill[] {
  const lowerQuery = query.toLowerCase();

  let filtered = skills.filter(
    (skill) =>
      skill.name.toLowerCase().includes(lowerQuery) ||
      skill.description.toLowerCase().includes(lowerQuery) ||
      skill.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  );

  if (category) {
    filtered = filterSkillsByCategory(filtered, category);
  }

  if (tags && tags.length > 0) {
    filtered = filterSkillsByTags(filtered, tags);
  }

  return filtered;
}

/**
 * Suggest tags for a skill based on content
 */
export function suggestTags(skillContent: string, existingTags: string[] = []): string[] {
  const keywords = skillContent
    .toLowerCase()
    .split(/[\s,.-]+/)
    .filter((word) => word.length > 3);

  const uniqueKeywords = [...new Set(keywords)];
  const alreadyTagged = new Set(existingTags.map((t) => t.toLowerCase()));

  return uniqueKeywords
    .filter((keyword) => !alreadyTagged.has(keyword))
    .slice(0, 5);
}
