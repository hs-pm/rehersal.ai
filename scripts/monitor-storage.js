import { Redis } from '@upstash/redis'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
})

async function monitorStorage() {
  try {
    console.log('🔍 Monitoring Storage Usage...\n')

    // Get all keys and their sizes
    const questions = await redis.hgetall('questions')
    const sessions = await redis.hgetall('sessions')
    const responses = await redis.hgetall('responses')

    console.log('📊 Storage Summary:')
    console.log(`Questions: ${questions ? Object.keys(questions).length : 0} items`)
    console.log(`Sessions: ${sessions ? Object.keys(sessions).length : 0} items`)
    console.log(`Responses: ${responses ? Object.keys(responses).length : 0} items`)

    // Calculate approximate sizes
    const questionsSize = questions ? JSON.stringify(questions).length : 0
    const sessionsSize = sessions ? JSON.stringify(sessions).length : 0
    const responsesSize = responses ? JSON.stringify(responses).length : 0
    const totalSize = questionsSize + sessionsSize + responsesSize

    console.log('\n💾 Size Estimates:')
    console.log(`Questions: ${(questionsSize / 1024).toFixed(2)} KB`)
    console.log(`Sessions: ${(sessionsSize / 1024).toFixed(2)} KB`)
    console.log(`Responses: ${(responsesSize / 1024).toFixed(2)} KB`)
    console.log(`Total: ${(totalSize / 1024).toFixed(2)} KB`)

    // Show recent items
    if (questions && Object.keys(questions).length > 0) {
      console.log('\n📝 Recent Questions:')
      const questionKeys = Object.keys(questions).slice(-3)
      for (const key of questionKeys) {
        const question = JSON.parse(questions[key])
        console.log(`- ${question.question.substring(0, 60)}...`)
      }
    }

    if (sessions && Object.keys(sessions).length > 0) {
      console.log('\n🎯 Recent Sessions:')
      const sessionKeys = Object.keys(sessions).slice(-3)
      for (const key of sessionKeys) {
        const session = JSON.parse(sessions[key])
        console.log(`- ${session.title} (${session.completed_questions}/${session.total_questions})`)
      }
    }

  } catch (error) {
    console.error('Error monitoring storage:', error)
  }
}

monitorStorage() 