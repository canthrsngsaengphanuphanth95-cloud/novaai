/**
 * RAG Embedding System using TF-IDF and Semantic Search
 * Replaces simple keyword matching with vector-based similarity
 */

export interface Embedding {
  id: string;
  text: string;
  vector: number[];
  metadata: Record<string, any>;
  createdAt: string;
}

export interface SearchResult {
  id: string;
  text: string;
  score: number;
  metadata: Record<string, any>;
}

// Simple TF-IDF implementation
class TFIDFEmbedding {
  private corpus: Embedding[] = [];
  private vocabulary: Map<string, number> = new Map();
  private idf: Map<string, number> = new Map();

  /**
   * Tokenize text into words
   */
  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((word) => word.length > 2);
  }

  /**
   * Calculate TF (Term Frequency)
   */
  private calculateTF(tokens: string[]): Map<string, number> {
    const tf = new Map<string, number>();
    tokens.forEach((token) => {
      tf.set(token, (tf.get(token) || 0) + 1);
    });

    // Normalize by document length
    const total = tokens.length;
    tf.forEach((count, token) => {
      tf.set(token, count / total);
    });

    return tf;
  }

  /**
   * Calculate IDF (Inverse Document Frequency)
   */
  private calculateIDF(corpus: string[][]): Map<string, number> {
    const idf = new Map<string, number>();
    const docCount = corpus.length;

    const uniqueTerms = new Set<string>();
    corpus.forEach((tokens) => {
      tokens.forEach((token) => uniqueTerms.add(token));
    });

    uniqueTerms.forEach((term) => {
      const docsWithTerm = corpus.filter((tokens) =>
        tokens.includes(term)
      ).length;
      idf.set(term, Math.log(docCount / (1 + docsWithTerm)));
    });

    return idf;
  }

  /**
   * Convert TF-IDF to vector
   */
  private tfIdfToVector(
    tf: Map<string, number>,
    idf: Map<string, number>,
    vocabSize: number
  ): number[] {
    const vector = new Array(vocabSize).fill(0);
    tf.forEach((tfValue, term) => {
      const vocabIndex = this.vocabulary.get(term);
      if (vocabIndex !== undefined) {
        const idfValue = idf.get(term) || 0;
        vector[vocabIndex] = tfValue * idfValue;
      }
    });
    return vector;
  }

  /**
   * Index documents for semantic search
   */
  public indexDocuments(documents: { id: string; text: string; metadata?: Record<string, any> }[]): void {
    const allTokens: string[][] = [];

    // Build vocabulary
    documents.forEach(({ text }) => {
      const tokens = this.tokenize(text);
      allTokens.push(tokens);
      tokens.forEach((token) => {
        if (!this.vocabulary.has(token)) {
          this.vocabulary.set(token, this.vocabulary.size);
        }
      });
    });

    // Calculate IDF
    this.idf = this.calculateIDF(allTokens);

    // Convert documents to vectors
    this.corpus = documents.map(({ id, text, metadata }, index) => {
      const tokens = allTokens[index];
      const tf = this.calculateTF(tokens);
      const vector = this.tfIdfToVector(tf, this.idf, this.vocabulary.size);

      return {
        id,
        text,
        vector,
        metadata: metadata || {},
        createdAt: new Date().toISOString(),
      };
    });
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    let dotProduct = 0;
    let magA = 0;
    let magB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      magA += vecA[i] * vecA[i];
      magB += vecB[i] * vecB[i];
    }

    magA = Math.sqrt(magA);
    magB = Math.sqrt(magB);

    if (magA === 0 || magB === 0) return 0;
    return dotProduct / (magA * magB);
  }

  /**
   * Search for similar documents
   */
  public search(query: string, topK: number = 5): SearchResult[] {
    const queryTokens = this.tokenize(query);
    const queryTF = this.calculateTF(queryTokens);
    const queryVector = this.tfIdfToVector(queryTF, this.idf, this.vocabulary.size);

    const results = this.corpus.map((doc) => ({
      ...doc,
      score: this.cosineSimilarity(queryVector, doc.vector),
    }));

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .map(({ vector, ...rest }) => rest);
  }
}

// Export singleton instance
export const embeddingEngine = new TFIDFEmbedding();

/**
 * Search skills by embedding similarity
 */
export async function searchSkillsByEmbedding(
  query: string,
  allSkills: { id: string; name: string; description: string; metadata?: Record<string, any> }[],
  topK: number = 5
): Promise<SearchResult[]> {
  embeddingEngine.indexDocuments(
    allSkills.map((skill) => ({
      id: skill.id,
      text: `${skill.name} ${skill.description}`,
      metadata: { ...skill.metadata, skillId: skill.id, skillName: skill.name },
    }))
  );

  return embeddingEngine.search(query, topK);
}

/**
 * Generate related skills suggestions
 */
export function getRelatedSkillSuggestions(
  usedSkills: string[],
  allSkills: { id: string; name: string; category: string; tags: string[] }[],
  limit: number = 5
): { id: string; name: string; category: string; reason: string }[] {
  const used = new Set(usedSkills);
  const suggestions: { id: string; name: string; category: string; reason: string }[] = [];

  allSkills.forEach((skill) => {
    if (used.has(skill.id)) return;

    // Find if any used skill shares same category or tags
    const usedSkill = allSkills.find(s => used.has(s.id));
    if (usedSkill) {
      if (usedSkill.category === skill.category) {
        suggestions.push({
          id: skill.id,
          name: skill.name,
          category: skill.category,
          reason: `Related to ${usedSkill.category}`,
        });
      }

      const commonTags = skill.tags.filter(tag => usedSkill.tags.includes(tag));
      if (commonTags.length > 0) {
        suggestions.push({
          id: skill.id,
          name: skill.name,
          category: skill.category,
          reason: `Shares tags: ${commonTags.join(', ')}`,
        });
      }
    }
  });

  return suggestions.slice(0, limit);
}
