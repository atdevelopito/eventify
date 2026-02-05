import { HelmetProvider, Helmet } from "react-helmet-async";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Shield, Cookie, Scale } from "lucide-react";
import { Link } from "react-router-dom";

const Legal = () => {
  const legalPages = [
    {
      title: "Privacy Policy",
      description: "Learn how we collect, use, and protect your personal information.",
      icon: Shield,
      link: "/privacy",
      lastUpdated: "January 1, 2026"
    },
    {
      title: "Terms of Service",
      description: "Read the terms and conditions that govern your use of our platform.",
      icon: FileText,
      link: "/terms",
      lastUpdated: "January 1, 2026"
    },
    {
      title: "Cookie Policy",
      description: "Understand how we use cookies and similar technologies.",
      icon: Cookie,
      link: "/cookies",
      lastUpdated: "January 1, 2026"
    }
  ];

  return (
    <HelmetProvider>
      <Helmet>
        <title>Legal | Event Platform</title>
        <meta name="description" content="Access our legal documents including Privacy Policy, Terms of Service, and Cookie Policy." />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 pt-32 pb-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Scale className="h-16 w-16 mx-auto mb-4 text-primary" />
              <h1 className="text-4xl font-bold mb-4">Legal Information</h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                We believe in transparency. Here you'll find all the legal documents that govern your use of our platform.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {legalPages.map((page, index) => (
                <Link key={index} to={page.link}>
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <page.icon className="h-10 w-10 mb-2 text-primary" />
                      <CardTitle>{page.title}</CardTitle>
                      <CardDescription>{page.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground">
                        Last updated: {page.lastUpdated}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            <div className="bg-muted rounded-lg p-8">
              <h2 className="text-2xl font-semibold mb-4">Our Commitment</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  At our core, we are committed to protecting your privacy and ensuring a safe,
                  transparent experience on our platform. We regularly review and update our policies
                  to reflect changes in law and best practices.
                </p>
                <p>
                  If you have any questions about our legal documents or practices, please don't
                  hesitate to contact our legal team at legal@eventplatform.com.
                </p>
              </div>
            </div>

            <div className="mt-8 p-6 border rounded-lg">
              <h3 className="font-semibold mb-2">Compliance & Certifications</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• GDPR Compliant - European Data Protection</li>
                <li>• PCI DSS - Payment Card Industry Data Security Standard</li>
                <li>• SOC 2 Type II - Security & Availability</li>
              </ul>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </HelmetProvider>
  );
};

export default Legal;
