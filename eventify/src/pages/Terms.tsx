import { HelmetProvider, Helmet } from "react-helmet-async";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const Terms = () => {
  return (
    <HelmetProvider>
      <Helmet>
        <title>Terms of Service | Event Platform</title>
        <meta name="description" content="Read our Terms of Service to understand the rules and guidelines for using our event platform." />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 pt-32 pb-12">
          <div className="max-w-4xl mx-auto prose prose-neutral dark:prose-invert">
            <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
            <p className="text-muted-foreground mb-8">Last updated: January 1, 2026</p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground mb-4">
                By accessing and using this Event Platform, you accept and agree to be bound by the terms and provisions
                of this agreement. If you do not agree to these terms, please do not use our services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
              <p className="text-muted-foreground mb-4">
                Our platform provides event discovery, creation, and management services. Users can browse events,
                register as attendees, create and manage their own events, and connect with other users.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>You must be at least 18 years old to create an account</li>
                <li>You are responsible for maintaining the confidentiality of your account</li>
                <li>You agree to provide accurate and complete information</li>
                <li>You are responsible for all activities under your account</li>
                <li>You must notify us immediately of any unauthorized use</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. Event Organizer Responsibilities</h2>
              <p className="text-muted-foreground mb-4">If you create events on our platform, you agree to:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Provide accurate event information</li>
                <li>Comply with all applicable laws and regulations</li>
                <li>Obtain necessary permits and licenses for your event</li>
                <li>Handle attendee data in accordance with privacy laws</li>
                <li>Honor your refund policy as stated on the event page</li>
                <li>Not use our platform for illegal or prohibited activities</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. Attendee Responsibilities</h2>
              <p className="text-muted-foreground mb-4">As an event attendee, you agree to:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Provide accurate registration information</li>
                <li>Comply with event rules and guidelines</li>
                <li>Behave respectfully toward organizers and other attendees</li>
                <li>Understand that refund policies are set by event organizers</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">6. Prohibited Content</h2>
              <p className="text-muted-foreground mb-4">You may not post or promote events that:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Are illegal or promote illegal activities</li>
                <li>Are fraudulent, misleading, or deceptive</li>
                <li>Infringe on intellectual property rights</li>
                <li>Contain hate speech, harassment, or discrimination</li>
                <li>Promote violence or harmful activities</li>
                <li>Contain adult content without proper age restrictions</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">7. Payments and Fees</h2>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Ticket prices are set by event organizers</li>
                <li>Service fees may apply to ticket purchases</li>
                <li>All payments are processed through secure third-party providers</li>
                <li>Organizer payouts are subject to our payout schedule</li>
                <li>We reserve the right to withhold payouts in case of disputes or violations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">8. Cancellations and Refunds</h2>
              <p className="text-muted-foreground mb-4">
                Refund policies are set by individual event organizers. We facilitate refund processing but
                are not responsible for organizer refund decisions. If an event is cancelled by the organizer,
                attendees are typically entitled to a full refund.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">9. Intellectual Property</h2>
              <p className="text-muted-foreground mb-4">
                All content on this platform, including logos, designs, and software, is owned by us or our licensors.
                You retain ownership of content you upload but grant us a license to use it for platform operations.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">10. Limitation of Liability</h2>
              <p className="text-muted-foreground mb-4">
                We provide this platform "as is" without warranties of any kind. We are not liable for any
                indirect, incidental, or consequential damages arising from your use of our services.
                We are not responsible for the actions of event organizers or attendees.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">11. Termination</h2>
              <p className="text-muted-foreground mb-4">
                We reserve the right to suspend or terminate your account at any time for violations of these terms
                or for any other reason at our discretion. You may also close your account at any time.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">12. Changes to Terms</h2>
              <p className="text-muted-foreground mb-4">
                We may modify these terms at any time. We will notify users of significant changes via email
                or platform notification. Continued use of the platform after changes constitutes acceptance.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">13. Contact Information</h2>
              <p className="text-muted-foreground">
                For questions about these Terms of Service, please contact us at:<br /><br />
                Email: legal@eventplatform.com<br />
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

export default Terms;
