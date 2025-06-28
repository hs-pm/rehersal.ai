// Type-specific prompts for question generation and evaluation

// Context analysis and processing functions
export function analyzeResume(resume: string): {
  skills: string[]
  experience: string[]
  projects: string[]
  education: string[]
} {
  const skills: string[] = []
  const experience: string[] = []
  const projects: string[] = []
  const education: string[] = []

  // Simple keyword extraction - in a real implementation, this would use NLP
  const lines = resume.toLowerCase().split('\n')
  
  for (const line of lines) {
    if (line.includes('skill') || line.includes('technology') || line.includes('tool')) {
      skills.push(line.trim())
    } else if (line.includes('experience') || line.includes('work') || line.includes('job')) {
      experience.push(line.trim())
    } else if (line.includes('project') || line.includes('developed') || line.includes('built')) {
      projects.push(line.trim())
    } else if (line.includes('education') || line.includes('degree') || line.includes('university')) {
      education.push(line.trim())
    }
  }

  return { skills, experience, projects, education }
}

export function analyzeJobDescription(jobDesc: string): {
  requirements: string[]
  responsibilities: string[]
  technologies: string[]
  softSkills: string[]
} {
  const requirements: string[] = []
  const responsibilities: string[] = []
  const technologies: string[] = []
  const softSkills: string[] = []

  const lines = jobDesc.toLowerCase().split('\n')
  
  for (const line of lines) {
    if (line.includes('require') || line.includes('must have') || line.includes('qualification')) {
      requirements.push(line.trim())
    } else if (line.includes('responsibility') || line.includes('duty') || line.includes('task')) {
      responsibilities.push(line.trim())
    } else if (line.includes('technology') || line.includes('tool') || line.includes('framework')) {
      technologies.push(line.trim())
    } else if (line.includes('communication') || line.includes('teamwork') || line.includes('leadership')) {
      softSkills.push(line.trim())
    }
  }

  return { requirements, responsibilities, technologies, softSkills }
}

export function generateContextSummary(context: {
  resume?: string
  jobDescription?: string
  candidateAnalysis?: string
}): string {
  let summary = ''

  if (context.resume) {
    const resumeAnalysis = analyzeResume(context.resume)
    summary += `CANDIDATE BACKGROUND ANALYSIS:
- Key Skills: ${resumeAnalysis.skills.slice(0, 5).join(', ')}
- Experience Areas: ${resumeAnalysis.experience.slice(0, 3).join(', ')}
- Notable Projects: ${resumeAnalysis.projects.slice(0, 3).join(', ')}
- Education: ${resumeAnalysis.education.slice(0, 2).join(', ')}

`
  }

  if (context.jobDescription) {
    const jobAnalysis = analyzeJobDescription(context.jobDescription)
    summary += `JOB REQUIREMENTS ANALYSIS:
- Key Requirements: ${jobAnalysis.requirements.slice(0, 5).join(', ')}
- Main Responsibilities: ${jobAnalysis.responsibilities.slice(0, 3).join(', ')}
- Required Technologies: ${jobAnalysis.technologies.slice(0, 5).join(', ')}
- Soft Skills Needed: ${jobAnalysis.softSkills.slice(0, 3).join(', ')}

`
  }

  if (context.candidateAnalysis) {
    summary += `CANDIDATE'S SELF-ANALYSIS:
${context.candidateAnalysis}

`
  }

  return summary
}

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

{contextSection}

PERSONALIZATION GUIDELINES:
- Reference specific skills, technologies, or experiences mentioned in the candidate's background
- Align questions with the job requirements and responsibilities
- Focus on areas where the candidate's experience matches the role needs
- Create questions that bridge the candidate's past experience with the target role
- Consider the candidate's self-identified areas of focus

Return ONLY a valid JSON object with this exact structure:
{
  "questions": [
    {"id": "1", "question": "Your behavioral question here", "type": "behavioral", "category": "subject"},
    {"id": "2", "question": "Your behavioral question here", "type": "behavioral", "category": "subject"}
  ]
}

Do NOT include any other text, formatting, or explanations. Only return the JSON object.`,

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

IMPORTANT: These must be TECHNICAL questions, NOT behavioral questions. Do NOT ask about past experiences, teamwork, or personal situations.

Technical questions should:
- Test theoretical knowledge and understanding of concepts
- Assess problem-solving abilities with technical scenarios
- Cover fundamental concepts, principles, and advanced topics
- Be appropriate for the subject area
- Ask for explanations, comparisons, or technical solutions

Generate questions that ask candidates to:
- Explain technical concepts, principles, and mechanisms
- Compare different approaches, technologies, or methodologies
- Describe technical processes, algorithms, or architectures
- Demonstrate understanding of best practices and trade-offs
- Solve technical problems or design technical solutions

{contextSection}

PERSONALIZATION GUIDELINES:
- Focus on technologies and skills mentioned in the candidate's background
- Align with the technical requirements of the job description
- Create questions that test the specific technical stack mentioned
- Consider the candidate's experience level based on their background
- Include questions about technologies they've worked with

Examples of technical questions:
- "What is the difference between X and Y in JavaScript?"
- "How would you optimize this algorithm?"
- "Explain the concept of closures in JavaScript"
- "What are the trade-offs between different data structures?"

Return ONLY a valid JSON object with this exact structure:
{
  "questions": [
    {"id": "1", "question": "Your technical question here", "type": "technical", "category": "subject"},
    {"id": "2", "question": "Your technical question here", "type": "technical", "category": "subject"}
  ]
}

Do NOT include any other text, formatting, or explanations. Only return the JSON object.`,

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

{contextSection}

PERSONALIZATION GUIDELINES:
- Create scenarios that reflect the actual work environment described in the job description
- Reference specific technologies or processes mentioned in the candidate's background
- Align scenarios with the candidate's experience level and the role's responsibilities
- Include situations that test the soft skills required for the position
- Consider industry-specific challenges relevant to the candidate's background

Return ONLY a valid JSON object with this exact structure:
{
  "questions": [
    {"id": "1", "question": "Your situational question here", "type": "situational", "category": "subject"},
    {"id": "2", "question": "Your situational question here", "type": "situational", "category": "subject"}
  ]
}

Do NOT include any other text, formatting, or explanations. Only return the JSON object.`,

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
- Test practical programming skills and problem-solving abilities
- Ask candidates to write actual code or pseudocode
- Cover fundamental programming concepts and algorithms
- Be appropriate for the subject area and skill level
- Encourage logical thinking and code organization

Generate questions that ask candidates to:
- Write code to solve specific problems
- Implement algorithms or data structures
- Debug or optimize existing code
- Design solutions to programming challenges
- Explain their coding approach and reasoning

{contextSection}

PERSONALIZATION GUIDELINES:
- Focus on programming languages and technologies mentioned in the candidate's background
- Align with the technical stack required by the job description
- Consider the candidate's experience level when determining question complexity
- Include questions about specific frameworks or tools they've worked with
- Create problems that reflect real-world scenarios relevant to the role

Examples of coding questions:
- "Write a function to reverse a string"
- "Implement a binary search algorithm"
- "Create a class to represent a linked list"
- "Write SQL queries to retrieve specific data"

Return ONLY a valid JSON object with this exact structure:
{
  "questions": [
    {"id": "1", "question": "Your coding question here", "type": "coding", "category": "subject"},
    {"id": "2", "question": "Your coding question here", "type": "coding", "category": "subject"}
  ]
}

Do NOT include any other text, formatting, or explanations. Only return the JSON object.`,

    evaluator: `You are evaluating a coding interview response. Assess the candidate's answer based on the following criteria:

**Evaluation Criteria:**
- **Code Quality**: Is the code well-structured, readable, and follows best practices?
- **Correctness**: Does the solution work correctly for the given problem?
- **Efficiency**: Is the solution optimized and performant?
- **Problem Understanding**: Does the candidate understand the requirements?
- **Communication**: Can the candidate explain their approach clearly?

**Scoring Guide:**
- 90-100: Excellent code quality, correct solution, efficient implementation, clear understanding, excellent communication
- 80-89: Good code quality, mostly correct, reasonable efficiency, good understanding, clear explanation
- 70-79: Adequate code quality, mostly correct, acceptable efficiency, basic understanding, understandable explanation
- 60-69: Poor code quality, some errors, inefficient solution, limited understanding, unclear explanation
- Below 60: Very poor code quality, significant errors, inefficient solution, poor understanding, poor communication

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
export function getQuestionPrompt(
  type: string, 
  count: number, 
  subject: string, 
  context?: {
    resume?: string
    jobDescription?: string
    candidateAnalysis?: string
  }
): string {
  const prompt = questionPrompts[type as keyof typeof questionPrompts];
  if (!prompt) {
    // Fallback to behavioral if type not found
    return questionPrompts.behavioral.generator
      .replace('{count}', count.toString())
      .replace('{subject}', subject)
      .replace('{contextSection}', '');
  }
  
  let finalPrompt = prompt.generator
    .replace('{count}', count.toString())
    .replace('{subject}', subject);

  // Generate context section if context is provided
  let contextSection = '';
  if (context && (context.resume || context.jobDescription || context.candidateAnalysis)) {
    const contextSummary = generateContextSummary(context);
    contextSection = `
PERSONALIZATION CONTEXT:
${contextSummary}
`;
  }

  finalPrompt = finalPrompt.replace('{contextSection}', contextSection);
  
  return finalPrompt;
}

// Function to get the appropriate evaluation prompt based on question type
export function getEvaluationPrompt(
  type: string, 
  context?: {
    resume?: string
    jobDescription?: string
    candidateAnalysis?: string
  }
): string {
  const prompt = questionPrompts[type as keyof typeof questionPrompts];
  if (!prompt) {
    // Fallback to behavioral if type not found
    return questionPrompts.behavioral.evaluator;
  }
  
  let finalPrompt = prompt.evaluator;

  // Add context-aware evaluation guidelines if context is provided
  if (context && (context.resume || context.jobDescription || context.candidateAnalysis)) {
    const contextSummary = generateContextSummary(context);
    const contextGuidelines = `

CONTEXT-AWARE EVALUATION GUIDELINES:
${contextSummary}

When evaluating this response, also consider:
- How well the answer aligns with the candidate's stated background and experience
- Whether the response demonstrates skills relevant to the job requirements
- If the candidate shows understanding of the specific role and industry context
- How the response addresses the candidate's self-identified areas of focus
- Whether the answer reflects the technical stack and tools mentioned in their background

`;
    
    // Insert context guidelines before the Response Format section
    const insertIndex = finalPrompt.indexOf('**Response Format:**');
    if (insertIndex !== -1) {
      finalPrompt = finalPrompt.slice(0, insertIndex) + contextGuidelines + finalPrompt.slice(insertIndex);
    } else {
      // If we can't find the insertion point, add context at the end
      finalPrompt += contextGuidelines;
    }
  }
  
  return finalPrompt;
} 