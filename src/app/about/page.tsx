import React from 'react';

export default function AboutPage() {
  return (
    <main className="bg-white py-10">
      <section className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-[var(--ahs-primary)] mb-6 text-center">
          About AHS Pakistan
        </h1>
        
        <div className="max-w-4xl mx-auto">
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Our Story
            </h2>
            <p className="text-gray-600 leading-relaxed">
              AHS Pakistan is a leading freight forwarding company that has been serving 
              clients with excellence since our inception. We pride ourselves on providing 
              reliable, cost-effective, and innovative shipping solutions to businesses of 
              all sizes. Our commitment to customer satisfaction and operational excellence 
              has made us a trusted partner in the logistics industry.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Our Mission
            </h2>
            <p className="text-gray-600 leading-relaxed">
              To revolutionize freight forwarding in Pakistan by leveraging cutting-edge 
              technology and AI-powered solutions, ensuring our clients receive the most 
              efficient, transparent, and competitive shipping services available.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Our Services
            </h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Ocean Freight Forwarding</li>
              <li>AI-Powered Rate Quotations</li>
              <li>Container Booking and Management</li>
              <li>Documentation Services</li>
              <li>Customs Clearance</li>
              <li>24/7 Customer Support</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Why Choose AHS Pakistan?
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">AI-Powered Efficiency</h3>
                <p className="text-gray-600">
                  Get instant rate quotations and booking confirmations through our 
                  advanced AI assistant.
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">Competitive Rates</h3>
                <p className="text-gray-600">
                  Access the best shipping rates from multiple carriers through our 
                  extensive network.
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">Reliability</h3>
                <p className="text-gray-600">
                  Track your shipments in real-time and enjoy peace of mind with our 
                  proven track record.
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">Expert Support</h3>
                <p className="text-gray-600">
                  Our experienced team is available 24/7 to assist with all your 
                  freight forwarding needs.
                </p>
              </div>
            </div>
          </section>

          <section className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Get in Touch
            </h2>
            <p className="text-gray-600 mb-6">
              Ready to streamline your shipping operations? Contact us today!
            </p>
            <button className="bg-[var(--ahs-primary)] text-white py-3 px-6 rounded-lg shadow-md hover:bg-[var(--ahs-primary-dark)] transition-all">
              Contact Our Team
            </button>
          </section>
        </div>
      </section>
    </main>
  );
}
