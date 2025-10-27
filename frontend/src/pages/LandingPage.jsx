import { NavLink } from 'react-router';
import { Code, Trophy, Users, Target, Zap, Shield, Star, ArrowRight } from 'lucide-react';

function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <Code className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">ZeroDayCoder</span>
          </div>
          <div className="flex items-center space-x-4">
            <NavLink to="/login" className="px-4 py-2 text-gray-700 hover:text-gray-900 rounded-md">
              Login
            </NavLink>
            <NavLink to="/signup" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Sign Up
            </NavLink>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <span className="inline-block mb-6 px-3 py-1 text-sm font-medium bg-gray-100 text-gray-800 rounded-full">
              Join 50,000+ developers
            </span>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
              Practice coding. Crack interviews. <span className="text-blue-600">Become a ZeroDay Coder!</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
              Master coding challenges, compete with peers, and land your dream job. Our platform offers curated
              problems, real-time contests, and comprehensive progress tracking.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <NavLink to="/signup" className="flex items-center px-6 py-3 text-lg font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Start Coding
                <ArrowRight className="ml-2 h-5 w-5" />
              </NavLink>
              <NavLink to="/login" className="px-6 py-3 text-lg font-medium text-gray-900 bg-transparent border border-gray-300 rounded-md hover:bg-gray-50">
                View Problems
              </NavLink>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to excel
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Comprehensive tools and features designed to accelerate your coding journey
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <Target className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Practice Problems</h3>
              <p className="text-gray-600">
                1000+ curated coding problems from easy to expert level, covering all major topics and algorithms.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <Trophy className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Live Contests</h3>
              <p className="text-gray-600">
                Weekly contests and challenges to test your skills against developers worldwide.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <Zap className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Progress Tracking</h3>
              <p className="text-gray-600">
                Detailed analytics and progress reports to track your improvement over time.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Leaderboard</h3>
              <p className="text-gray-600">
                Compete with peers and climb the global leaderboard to showcase your skills.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why ZeroDayCoder Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Why ZeroDayCoder?</h2>
            <p className="mt-4 text-lg text-gray-600">
              Join thousands of developers who have transformed their careers with our platform
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-colors">
              <Shield className="h-10 w-10 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Interview-Ready</h3>
              <p className="text-gray-600">
                Our problems are sourced from real interviews at top tech companies. Practice with the same questions
                asked at Google, Meta, and Amazon.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-colors">
              <Star className="h-10 w-10 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Expert Solutions</h3>
              <p className="text-gray-600">
                Every problem comes with detailed explanations, multiple solution approaches, and time/space
                complexity analysis from industry experts.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-colors">
              <Code className="h-10 w-10 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Multi-Language Support</h3>
              <p className="text-gray-600">
                Code in your preferred language with support for Java, C++, and JavaScript programming languages.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to level up your coding skills?
            </h2>
            <p className="mt-6 text-lg leading-8 opacity-90">
              Join our community of passionate developers and start your journey to becoming a better coder today.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <NavLink to="/signup" className="flex items-center px-6 py-3 text-lg font-medium bg-white text-blue-600 rounded-md hover:bg-gray-100">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </NavLink>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Code className="h-6 w-6 text-blue-600" />
                <span className="font-bold text-gray-900">ZeroDayCoder</span>
              </div>
              <p className="text-sm text-gray-600">
                Empowering developers to achieve their coding goals through practice and community.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Platform</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <NavLink to="#" className="hover:text-gray-900 transition-colors">
                    Problems
                  </NavLink>
                </li>
                <li>
                  <NavLink to="#" className="hover:text-gray-900 transition-colors">
                    Contests
                  </NavLink>
                </li>
                <li>
                  <NavLink to="#" className="hover:text-gray-900 transition-colors">
                    Leaderboard
                  </NavLink>
                </li>
                <li>
                  <NavLink to="#" className="hover:text-gray-900 transition-colors">
                    Discuss
                  </NavLink>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <NavLink to="#" className="hover:text-gray-900 transition-colors">
                    About
                  </NavLink>
                </li>
                <li>
                  <NavLink to="#" className="hover:text-gray-900 transition-colors">
                    Contact
                  </NavLink>
                </li>
                <li>
                  <NavLink to="#" className="hover:text-gray-900 transition-colors">
                    Careers
                  </NavLink>
                </li>
                <li>
                  <NavLink to="#" className="hover:text-gray-900 transition-colors">
                    Blog
                  </NavLink>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <NavLink to="#" className="hover:text-gray-900 transition-colors">
                    Terms
                  </NavLink>
                </li>
                <li>
                  <NavLink to="#" className="hover:text-gray-900 transition-colors">
                    Privacy
                  </NavLink>
                </li>
                <li>
                  <NavLink to="#" className="hover:text-gray-900 transition-colors">
                    Cookies
                  </NavLink>
                </li>
                <li>
                  <NavLink to="#" className="hover:text-gray-900 transition-colors">
                    License
                  </NavLink>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-gray-600">
            <p>&copy; 2025 ZeroDayCoder. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;