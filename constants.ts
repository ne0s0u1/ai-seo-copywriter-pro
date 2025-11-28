
import { SectionConfig } from './types';

export const SECTION_CONFIGS: SectionConfig[] = [
  {
    id: 'hero',
    label: 'Hero 核心区域',
    hasCount: false,
    basePrompt: `【Hero Section Prompt】
Please write SEO-friendly copy for the Hero Section.
Includes: Core Value Proposition, Benefits.
Tone: Concise and powerful, aimed at new users visiting for the first time, emphasizing unique selling points and direct benefits, while ensuring natural keyword embedding.
Fixed requirements: Title (6-8 words), Description (around 30 words).
CRITICAL: Do NOT use Markdown characters (*, #). Output clean text.
REQUIRED OUTPUT FORMAT:
Title: [Content]
Description: [Content]`
  },
  {
    id: 'what_is',
    label: 'What is 介绍区域',
    hasCount: false,
    basePrompt: `【What is Section Prompt】
Please write a clear and educational introduction for the "What is" Section.
Explain what the product/tool is, its core functions, who it is suitable for, and what problems it solves.
Language: Easy to understand, professional and credible, natural keyword placement, providing a clear framework for understanding so users quickly know the page theme.
Fixed requirements: Title (6-8 words), Description (around 30-40 words).
CRITICAL: Do NOT use Markdown characters (*, #). Output clean text.
REQUIRED OUTPUT FORMAT:
Title: [Content]
Description: [Content]`
  },
  {
    id: 'showcase',
    label: 'Showcase 展示区域',
    hasCount: true,
    defaultCount: 6,
    countLabel: '示例数量',
    basePrompt: `【Showcase Section Prompt】
Please write sample display copy for the Showcase Section.
Highlight the best usage scenarios, sample results, and actual content that can be generated or achieved.
Focus: Visual and result-oriented, guiding users to understand the creative effects of the tool.
Fixed requirements: Main Title (6-8 words), Main Description (15-20 words).
Sub-items: Generate {{COUNT}} subtitles (approx 6 words) focused on product examples, and descriptions for each (20-25 words).
CRITICAL: Do NOT use numbering (e.g. "1.", "2.") for the subtitles. Just write the subtitle text directly.
CRITICAL: Do NOT use Markdown characters (*, #).
REQUIRED OUTPUT FORMAT:
Main Title: [Content]
Main Description: [Content]
Example Title: [Content]
Description: [Content]
Example Title: [Content]
Description: [Content]
...`
  },
  {
    id: 'feature',
    label: 'Feature 功能区域',
    hasCount: true,
    defaultCount: 4,
    countLabel: '功能点数量',
    basePrompt: `【Feature Section Prompt】
Please write bulleted feature highlight copy for the Feature Section.
Includes: Subtitles for each feature (approx 6 words) and detailed descriptions (30-35 words).
Details: Explain why it's important, how it helps users, and the benefits of use.
Structure: Clear, logical, scannable content paragraphs. Each feature point must be independent.
Requirement: Generate {{COUNT}} features.
CRITICAL: Do NOT use Markdown characters (*, #).
REQUIRED OUTPUT FORMAT:
Feature Title: [Content]
Description: [Content]
Feature Title: [Content]
Description: [Content]
...`
  },
  {
    id: 'how_to_use',
    label: 'How to Use 使用步骤',
    hasCount: true,
    defaultCount: 3,
    countLabel: '步骤数量',
    basePrompt: `【How to Use Section Prompt】
Please write step-by-step copy for the How to Use Section using a "Step 1", "Step 2" structure.
Describe the complete process from "entering the page" to "completing the action".
Tone: Direct and friendly, suitable for first-time users.
Fixed requirements: 
- Main Title (6-8 words)
- Main Description (15-20 words)
- Generate {{COUNT}} steps.
- For each step: Step Title (3-6 words), Step Description (20-25 words).
CRITICAL: Do NOT use Markdown characters (*, #).
REQUIRED OUTPUT FORMAT:
Main Title: [Content]
Main Description: [Content]
Step 1 Title: [Content]
Description: [Content]
Step 2 Title: [Content]
Description: [Content]
...`
  },
  {
    id: 'benefit',
    label: 'Benefit 优势/利益',
    hasCount: true,
    defaultCount: 3,
    countLabel: '优势点数量',
    basePrompt: `【Benefit Section Prompt】
Please write user benefit-oriented copy for the Benefit Section.
Includes: Core value users gain, efficiency improvements, cost savings, experience enhancements, etc.
Emphasis: Practical benefits, naturally embed main SEO keywords.
Fixed requirements:
- Main Title (6-8 words)
- Main Description (15-20 words)
- Generate {{COUNT}} subtitles (approx 6 words) focusing on WHICH TARGET AUDIENCE group this is for.
- For each subtitle, write a description (30-35 words).
CRITICAL: Do NOT use Markdown characters (*, #).
REQUIRED OUTPUT FORMAT:
Main Title: [Content]
Main Description: [Content]
Audience Title: [Content]
Description: [Content]
Audience Title: [Content]
Description: [Content]
...`
  },
  {
    id: 'user_review',
    label: 'User Review 用户评价',
    hasCount: true,
    defaultCount: 3,
    countLabel: '评价数量',
    basePrompt: `【User Review Section Prompt】
Please write user review copy templates for the User Review Section.
Includes: User Name, Identity (Teacher/Designer/Parent etc.), and a natural, authentic review (containing keywords but not stuffed).
Tone: Authentic, non-advertising, like a real user spontaneously sharing an experience.
Content: Mention a pain point they had, how the product solved it, and the benefit gained.
Requirement: Generate {{COUNT}} reviews.
CRITICAL: Do NOT use Markdown characters (*, #).
REQUIRED OUTPUT FORMAT:
Name: [Content]
Identity: [Content]
Review: [Content]
...`
  },
  {
    id: 'faq',
    label: 'FAQ 常见问题',
    hasCount: false,
    basePrompt: `【FAQ Section Prompt】
Please write Q&A copy for the FAQ Section.
Includes: 5 common questions. Each answer includes: concise explanation, supplementary details, natural placement of SEO reinforcement keywords.
Topics: Usage, permissions, pricing, limitations, compatibility, effects, privacy.
Fixed requirements: Question (6-8 words), Answer (30-40 words).
CRITICAL: Do NOT use Markdown characters (*, #).
REQUIRED OUTPUT FORMAT:
Question: [Content]
Answer: [Content]
Question: [Content]
Answer: [Content]
...`
  },
  {
    id: 'cta',
    label: 'CTA 行动号召',
    hasCount: false,
    basePrompt: `【CTA Section Prompt】
Please write a strong action-oriented copy for the CTA Section.
Includes: Summary value statement, guidance to push users to try immediately, clear action button copy (e.g., "Start generating for free").
Tone: Concise, emotional, clear value orientation.
Fixed requirements: 
- Value Statement (6-8 words)
- Guide Text (15-20 words)
- CTA Button Text (6 words)
- Sub-guide Text (6-8 words)
CRITICAL: Do NOT use Markdown characters (*, #).
REQUIRED OUTPUT FORMAT:
Value Statement: [Content]
Guide Text: [Content]
CTA Button Text: [Content]
Sub-guide Text: [Content]`
  },
  {
    id: 'aitdk',
    label: 'AITDK (工具描述关键词)',
    hasCount: false,
    basePrompt: `【AITDK Prompt】
Please generate a keyword list (AITDK) suitable for the tool description area.
Must be strongly related to the page theme, avoid repetitive brand words.
Fixed requirements: Title (within 60 chars), Description (within 160 chars), Keyword (within 100 chars). STRICTLY follow character limits.
CRITICAL: Do NOT use Markdown characters (*, #).
Output Format strictly line by line:
Title: [Content]
Description: [Content]
Keywords: [Content]`
  },
  {
    id: 'metadata',
    label: 'Metadata (SEO元数据)',
    hasCount: false,
    basePrompt: `【Metadata Prompt】
Please generate SEO Metadata for the page.
Requirements: Include core keywords, clear language, non-stuffed writing style, aiming to improve Click-Through Rate (CTR).
Fixed requirements: Title (within 60 chars), Meta Description (150–160 chars).
CRITICAL: Do NOT use Markdown characters (*, #).
Output Format strictly line by line:
Title: [Content]
Meta Description: [Content]`
  }
];

export const SYSTEM_INSTRUCTION = `
You are a world-class SEO Copywriting AI Assistant.
Your goal is to write high-converting, SEO-optimized website copy based on specific section requirements.

Output Format Rule:
You MUST output strictly in VALID JSON format.
The JSON object must have exactly two keys:
1. "english": The generated copy in English. 
   - CRITICAL: Do NOT use Markdown formatting characters like '*' (asterisk) or '#' (hash). 
   - CRITICAL: Output CLEAN PLAIN TEXT. 
   - Do NOT use bolding, italics, or markdown headers. 
   - Use standard spacing and line breaks (\n) for structure.
   - FOLLOW the "REQUIRED OUTPUT FORMAT" in the prompt exactly. Use "Title:", "Description:" prefixes.
2. "chinese": A high-quality translation of the generated English copy into Chinese.
   - Same rule: Do NOT use Markdown characters.
   - Maintain the same line structure and prefixes (e.g. "标题:", "描述:") as the English version.

Example Output:
{
  "english": "Title: Hero Title\nDescription: The Best Tool...",
  "chinese": "标题: Hero 标题\n描述: 最好的工具..."
}

Do not include any text outside the JSON block.
`;
