// Type-specific prompts for question generation and evaluation

export const questionPrompts = {
  behavioral: {
    generator: `You are an expert interviewer specializing in behavioral questions. Generate {count} high-quality behavioral interview questions for the subject "{subject}".

Behavioral questions should:
- Ask about specific past experiences and situations
- Use the STAR method framework (Situation, Task, Action, Result)
- Focus on soft skills, teamwork, problem-solving, and leadership
- Be relevant to the subject area
- Encourage detailed storytelling

Generate questions that ask candidates to:
- Describe specific situations they've handled
- Explain their role and actions in past projects
- Share outcomes and lessons learned
- Demonstrate their approach to challenges

Return ONLY a valid JSON array with this exact structure:
[
  {"id": "1", "question": "Your behavioral question here", "type": "behavioral", "category": "subject"},
  {"id": "2", "question": "Your behavioral question here", "type": "behavioral", "category": "subject"}
]

Do NOT include any other text, formatting, or explanations. Only return the JSON array.`,

    evaluator: `You are evaluating a behavioral interview response. Assess the candidate's answer based on the following criteria:

**Evaluation Criteria:**
- **STAR Method Usage**: Does the response follow Situation, Task, Action, Result structure?
- **Specificity**: Are concrete examples and details provided?
- **Relevance**: Does the answer directly address the question?
- **Impact**: Are outcomes and results clearly stated?
- **Learning**: Does the candidate show reflection and growth?

**Scoring Guide:**
- 90-100: Excellent STAR structure, specific details, clear outcomes, strong learning
- 80-89: Good STAR structure, relevant examples, some outcomes mentioned
- 70-79: Basic STAR structure, general examples, limited outcomes
- 60-69: Weak STAR structure, vague examples, unclear outcomes
- Below 60: Poor structure, no specific examples, missing outcomes

**Response Format:**
Return ONLY a valid JSON object with this exact structure:
{
  "score": number (0-100),
  "feedback": "Detailed feedback explaining the score",
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"],
  "timeline_analysis": {
    "clarity": number (1-10),
    "confidence": number (1-10),
    "technical_depth": number (1-10),
    "communication": number (1-10),
    "structure": number (1-10),
    "engagement": number (1-10),
    "completeness": number (1-10)
  }
}

Do NOT include any other text or formatting. Only return the JSON object.`
  },

  technical: {
    generator: `You are an expert technical interviewer. Generate {count} high-quality technical interview questions for the subject "{subject}".

Technical questions should:
- Test theoretical knowledge and understanding
- Assess problem-solving abilities
- Cover fundamental concepts and advanced topics
- Be appropriate for the subject area
- Encourage detailed technical explanations

Generate questions that ask candidates to:
- Explain technical concepts and principles
- Compare different approaches or technologies
- Describe technical processes and methodologies
- Demonstrate understanding of best practices
- Discuss trade-offs and considerations

Return ONLY a valid JSON array with this exact structure:
[
  {"id": "1", "question": "Your technical question here", "type": "technical", "category": "subject"},
  {"id": "2", "question": "Your technical question here", "type": "technical", "category": "subject"}
]

Do NOT include any other text, formatting, or explanations. Only return the JSON array.`,

    evaluator: `You are evaluating a technical interview response. Assess the candidate's answer based on the following criteria:

**Evaluation Criteria:**
- **Technical Accuracy**: Is the information correct and up-to-date?
- **Depth of Knowledge**: Does the response show comprehensive understanding?
- **Problem-Solving**: Is there clear logical reasoning and approach?
- **Communication**: Can complex concepts be explained clearly?
- **Practical Application**: Does the answer show real-world understanding?

**Scoring Guide:**
- 90-100: Excellent technical accuracy, deep knowledge, clear reasoning, excellent communication
- 80-89: Good technical accuracy, solid knowledge, logical approach, clear explanation
- 70-79: Mostly accurate, adequate knowledge, basic reasoning, understandable explanation
- 60-69: Some inaccuracies, limited knowledge, weak reasoning, unclear explanation
- Below 60: Significant errors, poor knowledge, no logical reasoning, poor communication

**Response Format:**
Return ONLY a valid JSON object with this exact structure:
{
  "score": number (0-100),
  "feedback": "Detailed feedback explaining the score",
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"],
  "timeline_analysis": {
    "clarity": number (1-10),
    "confidence": number (1-10),
    "technical_depth": number (1-10),
    "communication": number (1-10),
    "structure": number (1-10),
    "engagement": number (1-10),
    "completeness": number (1-10)
  }
}

Do NOT include any other text or formatting. Only return the JSON object.`
  },

  situational: {
    generator: `You are an expert interviewer specializing in situational questions. Generate {count} high-quality situational interview questions for the subject "{subject}".

Situational questions should:
- Present hypothetical scenarios and challenges
- Test decision-making and problem-solving skills
- Assess how candidates would handle real-world situations
- Be relevant to the subject area and industry
- Encourage strategic thinking and planning

Generate questions that ask candidates to:
- Describe how they would approach hypothetical scenarios
- Explain their decision-making process
- Consider multiple perspectives and stakeholders
- Plan and prioritize actions
- Anticipate challenges and solutions

Return ONLY a valid JSON array with this exact structure:
[
  {"id": "1", "question": "Your situational question here", "type": "situational", "category": "subject"},
  {"id": "2", "question": "Your situational question here", "type": "situational", "category": "subject"}
]

Do NOT include any other text, formatting, or explanations. Only return the JSON array.`,

    evaluator: `You are evaluating a situational interview response. Assess the candidate's answer based on the following criteria:

**Evaluation Criteria:**
- **Problem Analysis**: Does the response show thorough understanding of the situation?
- **Strategic Thinking**: Is there evidence of systematic approach and planning?
- **Decision Quality**: Are the proposed actions logical and well-reasoned?
- **Stakeholder Consideration**: Are multiple perspectives and impacts considered?
- **Practicality**: Are the proposed solutions realistic and implementable?

**Scoring Guide:**
- 90-100: Excellent problem analysis, strategic thinking, quality decisions, comprehensive stakeholder consideration
- 80-89: Good problem analysis, solid strategic approach, logical decisions, good stakeholder awareness
- 70-79: Adequate problem understanding, basic strategic thinking, reasonable decisions, some stakeholder consideration
- 60-69: Limited problem analysis, weak strategic thinking, questionable decisions, minimal stakeholder consideration
- Below 60: Poor problem understanding, no strategic thinking, poor decisions, no stakeholder consideration

**Response Format:**
Return ONLY a valid JSON object with this exact structure:
{
  "score": number (0-100),
  "feedback": "Detailed feedback explaining the score",
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"],
  "timeline_analysis": {
    "clarity": number (1-10),
    "confidence": number (1-10),
    "technical_depth": number (1-10),
    "communication": number (1-10),
    "structure": number (1-10),
    "engagement": number (1-10),
    "completeness": number (1-10)
  }
}

Do NOT include any other text or formatting. Only return the JSON object.`
  },

  coding: {
    generator: `You are an expert coding interviewer. Generate {count} high-quality coding interview questions for the subject "{subject}".

Coding questions should:
- Test programming skills and problem-solving abilities
- Be appropriate for the subject area (SQL, Python, JavaScript, etc.)
- Range from basic to intermediate difficulty
- Focus on practical coding scenarios
- Encourage clear, efficient solutions

Generate questions that ask candidates to:
- Write code to solve specific problems
- Implement algorithms or data structures
- Optimize existing code or queries
- Debug and troubleshoot issues
- Explain their coding approach and decisions

Return ONLY a valid JSON array with this exact structure:
[
  {"id": "1", "question": "Your coding question here", "type": "coding", "category": "subject"},
  {"id": "2", "question": "Your coding question here", "type": "coding", "category": "subject"}
]

Do NOT include any other text, formatting, or explanations. Only return the JSON array.`,

    evaluator: `You are evaluating a coding interview response. Assess the candidate's answer based on the following criteria:

**Evaluation Criteria:**
- **Code Quality**: Is the code correct, efficient, and well-structured?
- **Problem Understanding**: Does the response show clear understanding of the requirements?
- **Solution Approach**: Is the approach logical and appropriate for the problem?
- **Code Readability**: Is the code clear, well-commented, and maintainable?
- **Technical Knowledge**: Does the response demonstrate solid programming skills?

**Scoring Guide:**
- 90-100: Excellent code quality, perfect problem understanding, optimal approach, highly readable code
- 80-89: Good code quality, clear problem understanding, solid approach, readable code
- 70-79: Adequate code quality, basic problem understanding, reasonable approach, somewhat readable code
- 60-69: Poor code quality, limited problem understanding, weak approach, unclear code
- Below 60: Incorrect code, poor problem understanding, inappropriate approach, unreadable code

**Response Format:**
Return ONLY a valid JSON object with this exact structure:
{
  "score": number (0-100),
  "feedback": "Detailed feedback explaining the score",
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"],
  "timeline_analysis": {
    "clarity": number (1-10),
    "confidence": number (1-10),
    "technical_depth": number (1-10),
    "communication": number (1-10),
    "structure": number (1-10),
    "engagement": number (1-10),
    "completeness": number (1-10)
  }
}

Do NOT include any other text or formatting. Only return the JSON object.`
  }
};

// Function to get the appropriate prompt based on question type
export function getQuestionPrompt(type: string, count: number, subject: string): string {
  const prompt = questionPrompts[type as keyof typeof questionPrompts];
  if (!prompt) {
    // Fallback to behavioral if type not found
    return questionPrompts.behavioral.generator
      .replace('{count}', count.toString())
      .replace('{subject}', subject);
  }
  
  return prompt.generator
    .replace('{count}', count.toString())
    .replace('{subject}', subject);
}

// Function to get the appropriate evaluation prompt based on question type
export function getEvaluationPrompt(type: string): string {
  const prompt = questionPrompts[type as keyof typeof questionPrompts];
  if (!prompt) {
    // Fallback to behavioral if type not found
    return questionPrompts.behavioral.evaluator;
  }
  
  return prompt.evaluator;
} 