import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - Super Tools',
  description: 'Privacy policy for Super Tools AI productivity suite.',
  openGraph: {
    title: 'Privacy Policy - Super Tools',
    description: 'How we protect your data and privacy.',
    url: 'https://supertoolz.xyz/privacy',
  },
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="mb-8">
          <a href="/" className="text-blue-400 hover:text-blue-300 transition-colors">
            ← Back to Super Tools
          </a>
        </div>
        
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        
        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">Last Updated: {new Date().toLocaleDateString()}</h2>
            <p className="text-gray-300 leading-relaxed">
              Super Tools ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and protect your information when you use our AI productivity tools.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">Information We Collect</h2>
            
            <h3 className="text-xl font-medium mb-3 text-white">1. Information You Provide</h3>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Receipt images and expense data (QuickReceipt)</li>
              <li>Voice recordings and task information (VoiceTask)</li>
              <li>Writing samples and text content (PersonaSync)</li>
              <li>Pantry photos and ingredient lists (Kitchen Commander)</li>
              <li>Arguments and debate topics (Argument Settler)</li>
              <li>Email address (for payment processing only)</li>
            </ul>

            <h3 className="text-xl font-medium mb-3 mt-6 text-white">2. Automatically Collected Information</h3>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Usage analytics and tool interaction data</li>
              <li>Browser type and operating system</li>
              <li>IP address (anonymized)</li>
              <li>Cookies and similar technologies</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">How We Use Your Information</h2>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li><strong>To provide our services:</strong> Process your data through AI models to deliver productivity features</li>
              <li><strong>To improve our services:</strong> Analyze usage patterns to enhance user experience</li>
              <li><strong>For payment processing:</strong> Process payments for the desktop app via Stripe</li>
              <li><strong>For security:</strong> Monitor for fraud and abuse</li>
              <li><strong>For analytics:</strong> Understand how our tools are used (anonymized data only)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">Data Processing and AI</h2>
            <p className="text-gray-300 leading-relaxed">
              Your data is processed by OpenAI's GPT-4 API to provide AI functionality. OpenAI does not use your data for training their models, and we do not store your inputs longer than necessary to provide the service. All data is transmitted securely using industry-standard encryption.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">Data Storage and Security</h2>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>All data is encrypted in transit using HTTPS/TLS</li>
              <li>Payment information is handled by Stripe - we never store credit card details</li>
              <li>User data is stored securely on Vercel's infrastructure</li>
              <li>We implement appropriate security measures to protect your information</li>
              <li>Data is retained only as long as necessary to provide our services</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">Third-Party Services</h2>
            <p className="text-gray-300 leading-relaxed">
              We use the following third-party services:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li><strong>OpenAI:</strong> For AI processing and model inference</li>
              <li><strong>Stripe:</strong> For secure payment processing</li>
              <li><strong>Vercel:</strong> For hosting and infrastructure</li>
              <li><strong>Google Analytics:</strong> For anonymous usage analytics (optional)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">Your Rights</h2>
            <p className="text-gray-300 leading-relaxed">
              You have the right to:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Access your personal data</li>
              <li>Request deletion of your data</li>
              <li>Opt out of analytics tracking</li>
              <li>Request a copy of your data</li>
              <li>Correct inaccurate information</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-4">
              To exercise these rights, contact us at support@supertoolz.xyz
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">Chrome Extension Privacy</h2>
            <p className="text-gray-300 leading-relaxed">
              The Chrome extension operates entirely in your browser and does not collect personal information. It only stores usage data locally on your device and may send anonymous usage statistics to help us improve the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">Children's Privacy</h2>
            <p className="text-gray-300 leading-relaxed">
              Our services are not intended for children under 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected such information, we will delete it immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">International Users</h2>
            <p className="text-gray-300 leading-relaxed">
              Super Tools is operated from the United States. If you are using our services from outside the United States, please be aware that your information may be transferred to and processed in the United States.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">Changes to This Policy</h2>
            <p className="text-gray-300 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">Contact Us</h2>
            <p className="text-gray-300 leading-relaxed">
              If you have any questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="bg-gray-900 p-4 rounded-lg mt-4">
              <p className="text-gray-300"><strong>Email:</strong> support@supertoolz.xyz</p>
              <p className="text-gray-300"><strong>Website:</strong> https://supertoolz.xyz</p>
              <p className="text-gray-300"><strong>GitHub:</strong> https://github.com/eXclipsea/super-tools-dashboard</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
