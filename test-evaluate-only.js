const { evaluateResponse } = require('./lib/groq');

async function testEvaluation() {
  console.log('🧪 Testing evaluation logic only...\n');

  const testCases = [
    {
      name: 'Good behavioral response',
      question: 'Tell me about a time when you had to debug a complex JavaScript issue. How did you approach it?',
      response: 'I encountered a memory leak in a React application. I used Chrome DevTools to profile the memory usage and identified that event listeners were not being properly cleaned up. I implemented proper cleanup in useEffect hooks and the issue was resolved.',
      type: 'behavioral'
    },
    {
      name: 'Technical response',
      question: 'What is the difference between var, let, and const in JavaScript?',
      response: 'var has function scope and can be redeclared and reassigned. let has block scope, cannot be redeclared but can be reassigned. const has block scope and cannot be redeclared or reassigned after initialization.',
      type: 'technical'
    },
    {
      name: 'Coding response',
      question: 'Write a SQL query to find the top 5 most expensive products.',
      response: 'SELECT product_name, price FROM products ORDER BY price DESC LIMIT 5;',
      type: 'coding'
    },
    {
      name: 'Poor response',
      question: 'Describe a challenging project you worked on.',
      response: 'It was hard.',
      type: 'behavioral'
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n📝 Testing: ${testCase.name}`);
    console.log(`Question: ${testCase.question}`);
    console.log(`Response: ${testCase.response}`);
    console.log(`Type: ${testCase.type}`);
    
    try {
      const evaluation = await evaluateResponse(
        testCase.question,
        testCase.response,
        testCase.type
      );
      
      console.log('\n✅ Evaluation Result:');
      console.log(`Score: ${evaluation.score}/100`);
      console.log(`Feedback: ${evaluation.feedback}`);
      console.log(`Strengths: ${evaluation.strengths.join(', ')}`);
      console.log(`Improvements: ${evaluation.improvements.join(', ')}`);
      console.log('Timeline Analysis:', evaluation.timeline_analysis);
    } catch (error) {
      console.error('❌ Evaluation failed:', error.message);
    }
    
    console.log('\n' + '='.repeat(80));
  }
}

testEvaluation().catch(console.error); 