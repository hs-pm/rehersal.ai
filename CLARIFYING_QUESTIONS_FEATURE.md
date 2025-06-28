# Ask Clarifying Questions Feature

## Overview

The "Ask Clarifying Questions" feature allows users to ask clarifying questions during interview practice sessions and receive AI-powered guidance to help them think through the problem themselves, rather than getting direct answers.

## How It Works

### 1. **User Experience**
- While answering an interview question, users see a "Need Help? Ask a Clarifying Question" section
- Users can type a clarifying question about the interview question
- Click "Ask for Guidance" to get AI-powered help
- The AI provides guidance that helps users think critically and develop their own reasoning

### 2. **AI Guidance Approach**
The AI guidance:
- **Acknowledges** the user's clarifying question
- **Helps identify assumptions** the user might be making
- **Guides step-by-step thinking** through the problem
- **Suggests information** to consider
- **Encourages structured thinking**
- **Does NOT provide direct answers**

### 3. **Integration with Response Submission**
- Clarifying questions are automatically included in the response context
- When the user submits their final response, it includes both the clarifying question and their answer
- The evaluation system considers the full context including the clarifying question

## Technical Implementation

### API Endpoint
- **Route**: `/api/clarification`
- **Method**: POST
- **Input**: `{ clarifyingQuestion, interviewQuestion }`
- **Output**: `{ success, guidance }`

### Frontend Components
- **State Management**: Added clarifying question state variables
- **UI Section**: Blue-themed section with textarea and guidance display
- **Integration**: Clarifying questions are included in response submission

### Database Integration
- **No schema changes required**
- Clarifying questions are stored as part of the response text
- Existing evaluation system handles the enhanced context

## Example Usage

### User Flow:
1. User sees interview question: "Tell me about a time when you had to debug a complex JavaScript issue"
2. User asks clarifying question: "What specific aspects of JavaScript should I focus on?"
3. AI provides guidance: "You're absolutely on the right track... Let's think about what this question is really asking..."
4. User develops their own response based on the guidance
5. Final submission includes both the clarifying question and the response

### API Example:
```bash
curl -X POST http://localhost:3000/api/clarification \
  -H "Content-Type: application/json" \
  -d '{
    "clarifyingQuestion": "What specific aspects should I focus on?",
    "interviewQuestion": "Tell me about debugging a complex JavaScript issue"
  }'
```

## Benefits

1. **Improved Learning**: Users develop critical thinking skills
2. **Realistic Practice**: Mirrors real interview scenarios where candidates ask clarifying questions
3. **Better Preparation**: Helps users learn to structure their thinking
4. **No Direct Answers**: Encourages independent problem-solving
5. **Context Preservation**: Full context is maintained for evaluation

## Safety & Compliance

- **Minimal Code Changes**: Uses existing infrastructure
- **No Database Schema Changes**: Leverages existing response storage
- **Type Safety**: Maintains existing TypeScript interfaces
- **Error Handling**: Graceful fallbacks for API failures
- **User Control**: Users can hide/show guidance as needed

## Future Enhancements

Potential improvements (not implemented):
- Track clarifying question usage analytics
- Different guidance styles based on question type
- Integration with question difficulty levels
- User preference settings for guidance style 