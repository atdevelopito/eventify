import { HelmetProvider, Helmet } from "react-helmet-async";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const Cookies = () => {
  const cookieTypes = [
    {
      name: "Essential Cookies",
      purpose: "Required for the website to function properly",
      duration: "Session / 1 year",
      examples: "Authentication, security, preferences"
    },
    {
      name: "Analytics Cookies",
      purpose: "Help us understand how visitors interact with our website",
      duration: "2 years",
      examples: "Google Analytics, page views, user behavior"
    },
    {
      name: "Functional Cookies",
      purpose: "Enable enhanced functionality and personalization",
      duration: "1 year",
      examples: "Language preferences, location settings"
    },
    {
      name: "Marketing Cookies",
      purpose: "Track visitors across websites to display relevant ads",
      duration: "90 days - 2 years",
      examples: "Social media pixels, advertising platforms"
    }
  ];

  return (
    <HelmetProvider>
      <Helmet>
        <title>Cookie Policy | Event Platform</title>
        <meta name="description" content="Learn about how we use cookies and similar technologies on our event platform." />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 pt-32 pb-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-2">Cookie Policy</h1>
            <p className="text-muted-foreground mb-8">Last updated: January 1, 2026</p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">What Are Cookies?</h2>
              <p className="text-muted-foreground mb-4">
                Cookies are small text files that are placed on your computer or mobile device when you visit a website.
                They are widely used to make websites work more efficiently and provide information to website owners.
              </p>
              <p className="text-muted-foreground">
                Cookies help us remember your preferences, understand how you use our website, and improve your experience.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">How We Use Cookies</h2>
              <p className="text-muted-foreground mb-4">We use cookies for the following purposes:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>Authentication:</strong> To keep you logged in as you navigate between pages</li>
                <li><strong>Security:</strong> To protect your account and detect suspicious activity</li>
                <li><strong>Preferences:</strong> To remember your settings and preferences</li>
                <li><strong>Analytics:</strong> To understand how visitors use our website</li>
                <li><strong>Performance:</strong> To optimize website speed and functionality</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Types of Cookies We Use</h2>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cookie Type</TableHead>
                      <TableHead>Purpose</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Examples</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cookieTypes.map((cookie, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{cookie.name}</TableCell>
                        <TableCell>{cookie.purpose}</TableCell>
                        <TableCell>{cookie.duration}</TableCell>
                        <TableCell>{cookie.examples}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Third-Party Cookies</h2>
              <p className="text-muted-foreground mb-4">
                Some cookies are placed by third-party services that appear on our pages. We do not control these cookies.
                Third-party providers include:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>Google Analytics:</strong> Website analytics and user behavior tracking</li>
                <li><strong>Payment Providers:</strong> Secure payment processing</li>
                <li><strong>Social Media:</strong> Share buttons and embedded content</li>
                <li><strong>Maps Services:</strong> Location and mapping functionality</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Managing Cookies</h2>
              <p className="text-muted-foreground mb-4">
                You can control and manage cookies in several ways:
              </p>
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold mb-2">Browser Settings</h3>
                  <p className="text-sm text-muted-foreground">
                    Most browsers allow you to view, delete, and block cookies. Note that blocking all cookies may
                    affect the functionality of this and other websites.
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold mb-2">Cookie Preferences</h3>
                  <p className="text-sm text-muted-foreground">
                    When you first visit our website, you can set your cookie preferences through our cookie banner.
                    You can change these preferences at any time through your account settings.
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold mb-2">Opt-Out Links</h3>
                  <p className="text-sm text-muted-foreground">
                    For analytics cookies, you can opt out using tools like the
                    <a href="https://tools.google.com/dlpage/gaoptout" className="text-primary hover:underline ml-1" target="_blank" rel="noopener noreferrer">
                      Google Analytics Opt-out Browser Add-on
                    </a>.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Updates to This Policy</h2>
              <p className="text-muted-foreground mb-4">
                We may update this Cookie Policy from time to time to reflect changes in our practices or for legal reasons.
                We encourage you to review this page periodically for the latest information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
              <p className="text-muted-foreground">
                If you have questions about our use of cookies, please contact us at:<br /><br />
                Email: privacy@eventplatform.com<br />
                Address: 123 Event Street, Tech City, TC 12345
              </p>
            </section>

            <div className="mt-8 p-6 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                For more information about your privacy rights and how we handle your data, please see our
                <a href="/privacy" className="text-primary hover:underline ml-1">Privacy Policy</a>.
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </HelmetProvider>
  );
};

export default Cookies;
