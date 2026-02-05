import { HelmetProvider, Helmet } from "react-helmet-async";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Blog = () => {
  const blogPosts = [
    {
      id: 1,
      title: "10 Tips for Planning a Successful Event",
      excerpt: "Learn the essential strategies that top event planners use to create memorable experiences for their attendees.",
      category: "Event Planning",
      author: "Sarah Johnson",
      date: "January 15, 2026",
      image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800",
      readTime: "5 min read"
    },
    {
      id: 2,
      title: "The Future of Virtual Events in 2026",
      excerpt: "Explore how hybrid and virtual events are reshaping the industry and what it means for organizers and attendees.",
      category: "Industry Trends",
      author: "Michael Chen",
      date: "January 12, 2026",
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
      readTime: "7 min read"
    },
    {
      id: 3,
      title: "How to Increase Event Attendance",
      excerpt: "Discover proven marketing strategies to boost your event registrations and create buzz around your upcoming events.",
      category: "Marketing",
      author: "Emily Rodriguez",
      date: "January 8, 2026",
      image: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800",
      readTime: "6 min read"
    },
    {
      id: 4,
      title: "Sustainable Event Management Practices",
      excerpt: "Learn how to reduce your event's environmental impact while still delivering an amazing experience.",
      category: "Sustainability",
      author: "David Kim",
      date: "January 5, 2026",
      image: "https://images.unsplash.com/photo-1559827291-72ee739d0d9a?w=800",
      readTime: "4 min read"
    },
    {
      id: 5,
      title: "Building Community Through Events",
      excerpt: "How to create lasting connections and build a loyal community around your events and brand.",
      category: "Community",
      author: "Jessica Thompson",
      date: "January 2, 2026",
      image: "https://images.unsplash.com/photo-1529543544277-750e390fbce9?w=800",
      readTime: "5 min read"
    },
    {
      id: 6,
      title: "Event Technology Trends to Watch",
      excerpt: "From AI-powered networking to immersive experiences, explore the tech shaping the future of events.",
      category: "Technology",
      author: "Alex Martinez",
      date: "December 28, 2025",
      image: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800",
      readTime: "8 min read"
    }
  ];

  return (
    <HelmetProvider>
      <Helmet>
        <title>Blog | Event Platform</title>
        <meta name="description" content="Read the latest insights, tips, and trends in event management and planning." />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl font-bold text-center mb-4">Blog</h1>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              Insights, tips, and stories from the world of event management
            </p>

            {/* Featured Post */}
            <Card className="mb-12 overflow-hidden">
              <div className="md:flex">
                <div className="md:w-1/2">
                  <img 
                    src={blogPosts[0].image} 
                    alt={blogPosts[0].title}
                    className="w-full h-64 md:h-full object-cover"
                  />
                </div>
                <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-center">
                  <Badge className="w-fit mb-4">{blogPosts[0].category}</Badge>
                  <h2 className="text-2xl md:text-3xl font-bold mb-4">{blogPosts[0].title}</h2>
                  <p className="text-muted-foreground mb-6">{blogPosts[0].excerpt}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                    <span className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {blogPosts[0].author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {blogPosts[0].date}
                    </span>
                  </div>
                  <Link to="#" className="text-primary font-semibold flex items-center gap-2 hover:gap-3 transition-all">
                    Read More <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </Card>

            {/* Blog Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogPosts.slice(1).map((post) => (
                <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-48 object-cover"
                  />
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary">{post.category}</Badge>
                      <span className="text-xs text-muted-foreground">{post.readTime}</span>
                    </div>
                    <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{post.excerpt}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {post.author}
                      </span>
                      <span>{post.date}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </HelmetProvider>
  );
};

export default Blog;
