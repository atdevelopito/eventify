import { HelmetProvider, Helmet } from "react-helmet-async";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const Privacy = () => {
  return (
    <HelmetProvider>
      <Helmet>
        <title>Privacy Policy | Event Platform</title>
        <meta name="description" content="Read our privacy policy to understand how we collect, use, and protect your personal information." />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 pt-32 pb-12">
          <div className="max-w-4xl mx-auto prose prose-neutral dark:prose-invert">
            <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
            <p className="text-muted-foreground mb-8">Last updated: January 1, 2026</p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
              <p className="text-muted-foreground mb-4">
                Welcome to our Event Platform. We respect your privacy and are committed to protecting your personal data.
                This privacy policy will inform you about how we look after your personal data when you visit our website
                and tell you about your privacy rights and how the law protects you.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
              <p className="text-muted-foreground mb-4">We may collect, use, store and transfer different kinds of personal data about you:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>Identity Data:</strong> first name, last name, username or similar identifier</li>
                <li><strong>Contact Data:</strong> email address, telephone numbers, billing address</li>
                <li><strong>Transaction Data:</strong> details about payments and purchases</li>
                <li><strong>Technical Data:</strong> IP address, browser type, device information</li>
                <li><strong>Usage Data:</strong> information about how you use our website and services</li>
                <li><strong>Marketing Data:</strong> your preferences for receiving marketing communications</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
              <p className="text-muted-foreground mb-4">We use your personal data for the following purposes:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>To register you as a new user</li>
                <li>To process and manage your event registrations</li>
                <li>To manage payments and refunds</li>
                <li>To communicate with you about events and services</li>
                <li>To improve our website and services</li>
                <li>To send you marketing communications (with your consent)</li>
                <li>To detect and prevent fraud</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. Data Sharing</h2>
              <p className="text-muted-foreground mb-4">
                We may share your personal data with:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>Event Organizers:</strong> When you register for an event, we share necessary information with the organizer</li>
                <li><strong>Service Providers:</strong> Third parties who provide services on our behalf (payment processing, analytics)</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
              <p className="text-muted-foreground mb-4">
                We have implemented appropriate security measures to prevent your personal data from being accidentally lost,
                used, or accessed in an unauthorized way. We limit access to your personal data to those employees and
                partners who have a business need to know.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">6. Your Rights</h2>
              <p className="text-muted-foreground mb-4">Under certain circumstances, you have rights under data protection laws including:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Request access to your personal data</li>
                <li>Request correction of your personal data</li>
                <li>Request erasure of your personal data</li>
                <li>Object to processing of your personal data</li>
                <li>Request restriction of processing</li>
                <li>Request transfer of your personal data</li>
                <li>Right to withdraw consent</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">7. Cookies</h2>
              <p className="text-muted-foreground mb-4">
                We use cookies and similar tracking technologies to track activity on our website and store certain information.
                For more information, please see our <a href="/cookies" className="text-primary hover:underline">Cookie Policy</a>.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">8. Contact Us</h2>
              <p className="text-muted-foreground mb-4">
                If you have any questions about this privacy policy or our privacy practices, please contact us at:
              </p>
              <p className="text-muted-foreground">
                Email: privacy@eventplatform.com<br />
                Address: 123 Event Street, Tech City, TC 12345
              </p>
            </section>
          </div>
        </main>
        <Footer />
      </div>
    </HelmetProvider>
  );
};

export default Privacy;
