import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service - Super Tools',
  description: 'Terms of service for Super Tools AI productivity suite.',
  openGraph: {
    title: 'Terms of Service - Super Tools',
    description: 'Terms and conditions for using Super Tools.',
    url: 'https://supertoolz.xyz/terms',
  },
};

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="mb-8">
          <a href="/" className="text-blue-400 hover:text-blue-300 transition-colors">
            ← Back to Super Tools
          </a>
        </div>
        
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        
        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">Last Updated: {new Date().toLocaleDateString()}</h2>
            <p className="text-gray-300 leading-relaxed">
              These Terms of Service ("Terms") govern your use of Super Tools, our AI productivity suite, and related services ("Services") provided by Super Tools ("we," "our," or "us").
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">Acceptance of Terms</h2>
            <p className="text-gray-300 leading-relaxed">
              By accessing or using our Services, you agree to be bound by these Terms. If you disagree with any part of these terms, then you may not access the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">Description of Service</h2>
            <p className="text-gray-300 leading-relaxed">
              Super Tools provides five AI-powered productivity tools:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li><strong>QuickReceipt:</strong> AI-powered receipt scanning and expense tracking</li>
              <li><strong>Kitchen Commander:</strong> Smart inventory management and recipe suggestions</li>
              <li><strong>PersonaSync:</strong> AI writing assistant that learns your style</li>
              <li><strong>VoiceTask:</strong> Voice-to-text task organization</li>
              <li><strong>Argument Settler:</strong> AI-powered fact checking and debate resolution</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">User Accounts</h2>
            <p className="text-gray-300 leading-relaxed">
              You may be required to create an account to access certain features. You are responsible for:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized use</li>
              <li>Providing accurate and current information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">Payment Terms</h2>
            <p className="text-gray-300 leading-relaxed">
              The web version of Super Tools is free to use. We offer a premium desktop application for a one-time payment of $2.99.
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Payments are processed securely through Stripe</li>
              <li>All sales are final - no refunds for digital downloads</li>
              <li>We reserve the right to change pricing with 30 days notice</li>
              <li>Your payment information is never stored on our servers</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">Acceptable Use</h2>
            <p className="text-gray-300 leading-relaxed">
              You agree to use our Services only for lawful purposes and in accordance with these Terms. You agree not to:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Use the Services for any illegal or unauthorized purpose</li>
              <li>Violate any laws in your jurisdiction</li>
              <li>Transmit malicious code or harmful content</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Use the Services to harass, abuse, or harm others</li>
              <li>Reverse engineer or attempt to extract our source code</li>
              <li>Use the Services for commercial purposes without permission</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">AI-Generated Content</h2>
            <p className="text-gray-300 leading-relaxed">
              Our Services use artificial intelligence to generate content and recommendations. You acknowledge that:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>AI-generated content may not always be accurate</li>
              <li>You are responsible for verifying important information</li>
              <li>We are not liable for decisions made based on AI recommendations</li>
              <li>AI output should not be considered professional advice</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">Intellectual Property</h2>
            <p className="text-gray-300 leading-relaxed">
              The Service and its original content, features and functionality are and will remain the exclusive property of Super Tools and its licensors. You may not:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Copy, modify, or distribute our proprietary code</li>
              <li>Use our trademarks without permission</li>
              <li>Claim ownership of any Super Tools intellectual property</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-4">
              You retain ownership of any content you input into our Services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">Privacy</h2>
            <p className="text-gray-300 leading-relaxed">
              Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, to understand our practices.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">Disclaimers</h2>
            <p className="text-gray-300 leading-relaxed">
              Our Services are provided on an "AS IS" and "AS AVAILABLE" basis. We make no representations or warranties of any kind, express or implied, including:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>No warranty of accuracy or reliability of AI-generated content</li>
              <li>No warranty of uninterrupted or error-free operation</li>
              <li>No warranty that the Services will meet your requirements</li>
              <li>No warranty regarding the security of data transmission</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">Limitation of Liability</h2>
            <p className="text-gray-300 leading-relaxed">
              In no event shall Super Tools, our directors, employees, partners, agents, suppliers, or affiliates be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the Services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">Termination</h2>
            <p className="text-gray-300 leading-relaxed">
              We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">Governing Law</h2>
            <p className="text-gray-300 leading-relaxed">
              These Terms shall be interpreted and governed by the laws of the United States, without regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">Changes to Terms</h2>
            <p className="text-gray-300 leading-relaxed">
              We reserve the right to modify these Terms at any time. If we make material changes, we will notify you by email or by posting a notice on our website prior to the effective date of the changes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">Contact Information</h2>
            <p className="text-gray-300 leading-relaxed">
              If you have any questions about these Terms, please contact us:
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
