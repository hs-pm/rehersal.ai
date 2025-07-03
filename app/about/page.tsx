'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Brain, 
  ExternalLink, 
  Download,
  Briefcase,
  GraduationCap,
  MapPin,
  Linkedin,
  FileText,
  Globe,
  Code,
  BarChart3,
  Users,
  Target,
  Zap
} from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">AI Interview Practice</h1>
            </div>
            <nav className="flex space-x-8">
              <Link href="/about" className="text-primary-600 font-medium">
                About Harshit
              </Link>
              <Link href="/practice" className="text-gray-600 hover:text-primary-600 transition-colors">
                Practice
              </Link>
              <Link href="/history" className="text-gray-600 hover:text-primary-600 transition-colors">
                History
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="relative w-48 h-48 mx-auto mb-8">
            <Image
              src="/HARSHIT_SHUKLA_BUSINESS_FINANCE.jpg"
              alt="Harshit Shukla"
              fill
              className="rounded-full object-cover shadow-lg"
            />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Harshit Shukla
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Product Manager (Data and AI)
          </p>
          <p className="text-lg text-gray-500 mb-6">
            @ PYOR || Coinswitch Kuber || BITS-PILANI
          </p>
          <div className="flex items-center justify-center space-x-2 text-gray-500">
            <MapPin className="w-4 h-4" />
            <span>Bengaluru, Karnataka, India</span>
          </div>
        </div>

        {/* About Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">About Me</h2>
          <div className="prose prose-lg text-gray-700 space-y-4">
            <p>
              I'm a Product Manager with 4+ years of experience building data and AI-powered products across fintech, web3, and analytics.
            </p>
            <p>
              I've led full 0→1 product cycles — from user discovery and problem framing to roadmap execution and feature delivery — with a strong bias toward outcomes, experimentation, and insight-driven decision-making.
            </p>
          </div>
        </div>

        {/* Current Role */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center mb-6">
            <Briefcase className="w-6 h-6 text-primary-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Currently at PYOR</h2>
          </div>
          <p className="text-gray-700 mb-6">
            I lead product for two innovative platforms:
          </p>
          
          <div className="space-y-6">
            <div className="border-l-4 border-blue-500 pl-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">(A) Xray</h3>
              <p className="text-gray-700 mb-3">
                A crypto analytics platform for institutional investors. I've owned the full product lifecycle — conducting 20+ user interviews with VCs, launching key features like a custom chart builder and Google Sheets API, and helping drive a 2x revenue increase while positioning Xray as a differentiated, cost-effective alternative to premium tools.
              </p>
            </div>
            
            <div className="border-l-4 border-green-500 pl-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">(B) PulseChain AI</h3>
              <p className="text-gray-700 mb-3">
                An end-to-end LLM product that turns raw crypto metrics into natural-language decision frameworks for portfolio managers. I built a full-stack system (LangChain, FastAPI, CI/CD) with features like NAV attribution, convexity flags, and scenario simulation — reducing time-to-insight by 80% and delivering 95%+ relevant AI-generated insights.
              </p>
            </div>
          </div>
        </div>

        {/* Previous Experience */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center mb-6">
            <GraduationCap className="w-6 h-6 text-primary-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Previous Experience</h2>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">CoinSwitch</h3>
            <p className="text-gray-700">
              Worked as a Product Analyst for CoinSwitch Pro, where I designed user analytics dashboards, ran cohort analyses, and led growth experiments — resulting in improved feature adoption, retention, and funnel conversions. I also optimized GTM strategies and launched trading events to increase user engagement.
            </p>
          </div>
        </div>

        {/* Skills */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Top Skills</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <Target className="w-5 h-5 text-blue-600" />
              <span className="text-gray-700">Product Roadmapping</span>
            </div>
            <div className="flex items-center space-x-3">
              <Users className="w-5 h-5 text-green-600" />
              <span className="text-gray-700">Product Life Cycle</span>
            </div>
            <div className="flex items-center space-x-3">
              <Brain className="w-5 h-5 text-purple-600" />
              <span className="text-gray-700">LLM Infrastructure and Evaluation</span>
            </div>
            <div className="flex items-center space-x-3">
              <Code className="w-5 h-5 text-orange-600" />
              <span className="text-gray-700">LLM Application Design</span>
            </div>
            <div className="flex items-center space-x-3">
              <Zap className="w-5 h-5 text-red-600" />
              <span className="text-gray-700">Go-to-Market Strategy</span>
            </div>
            <div className="flex items-center space-x-3">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              <span className="text-gray-700">Data Analytics & SQL</span>
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Connect & Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link 
              href="https://www.notion.so/Harshit-s-AI-Product-Portfolio-1fd435a2fb1380a98fa2cd4201d45dfd"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
            >
              <FileText className="w-5 h-5 text-blue-600" />
              <span className="text-gray-700">Notion Portfolio</span>
              <ExternalLink className="w-4 h-4 text-gray-400" />
            </Link>
            
            <Link 
              href="https://www.linkedin.com/in/harshit-shukla-506845136/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
            >
              <Linkedin className="w-5 h-5 text-blue-600" />
              <span className="text-gray-700">LinkedIn Profile</span>
              <ExternalLink className="w-4 h-4 text-gray-400" />
            </Link>
            
            <Link 
              href="/Harshit Shukla - AI Product Manager.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
            >
              <Download className="w-5 h-5 text-green-600" />
              <span className="text-gray-700">Download Resume</span>
              <ExternalLink className="w-4 h-4 text-gray-400" />
            </Link>
            
            <Link 
              href="https://institutional-amnesia-rag-rihs.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
            >
              <Globe className="w-5 h-5 text-purple-600" />
              <span className="text-gray-700">AI Knowledge Recall Tool</span>
              <ExternalLink className="w-4 h-4 text-gray-400" />
            </Link>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center">
          <Link 
            href="/"
            className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium"
          >
            <span>← Back to Home</span>
          </Link>
        </div>
      </main>
    </div>
  )
} 