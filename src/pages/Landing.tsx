import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  Target,
  Trophy,
  Users,
  Brain,
  Clock,
  BarChart3,
  Zap,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Daily Learning",
    description:
      "Question of the Day and Concept of the Day ensure disciplined daily mathematics learning.",
  },
  {
    icon: Target,
    title: "Structured Practice",
    description:
      "Topic-wise practice, PYQs, and model test papers with instant feedback and solutions.",
  },
  {
    icon: BarChart3,
    title: "Progress Tracking",
    description:
      "Detailed analytics showing your strengths, weaknesses, and improvement over time.",
  },
  {
    icon: Trophy,
    title: "Competitive Tests",
    description:
      "Weekly and bi-weekly tests to benchmark yourself against your peers.",
  },
];

const stats = [
  { value: "Class 11–12", label: "Curriculum Focus" },
  { value: "Daily", label: "Learning Flow" },
  { value: "Concept + Practice", label: "Balanced Approach" },
  { value: "Exam-Oriented", label: "Preparation" },
];

export default function Landing() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 gradient-primary opacity-90 pointer-events-none" />
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-float pointer-events-none" />
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-float delay-200 pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-white/10 rounded-full blur-xl animate-float delay-400 pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10 pt-20">
          <div className="max-w-4xl mx-auto text-center text-primary-foreground">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm mb-8 animate-fade-in">
              <Zap className="w-4 h-4" />
              <span className="text-sm font-medium">
                Complete Mathematics Platform • Class 11 & 12
              </span>
            </div>

            <h1 className="font-display text-5xl md:text-7xl font-bold mb-6 animate-fade-in delay-100">
              Master Mathematics
              <br />
              <span className="text-white/90">
                A Complete Learning Platform for Class 11 & 12
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-white/80 mb-10 max-w-2xl mx-auto animate-fade-in delay-200">
              A complete mathematics learning ecosystem for Class 11 & 12 students —
concepts, daily questions, practice, PYQs, model tests, and analytics.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in delay-300">
              <Link to="/register">
                <Button
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 font-semibold px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  Start Learning Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-transparent border border-white text-white hover:bg-white hover:text-primary px-8 py-6 text-lg rounded-xl transition-all"
                >
                  Sign In
                </Button>
              </Link>
            </div>

           
          </div>
        </div>

        {/* Wave Bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="hsl(var(--background))"
            />
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="text-center animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <p className="text-4xl md:text-5xl font-display font-bold text-gradient mb-2">
                  {stat.value}
                </p>
                <p className="text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Everything You Need to
              <span className="text-gradient"> Excel</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our platform is designed with students in mind, providing all the
              tools you need to master mathematics.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="bg-card rounded-2xl p-8 shadow-lg card-hover animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center mb-6">
                  <feature.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
              How It <span className="text-gradient">Works</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get started in minutes and begin your journey to math excellence.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: "01",
                title: "Create Account",
                desc: "Sign up with your details and select your class.",
              },
              {
                step: "02",
                title: "Start Practicing",
                desc: "Attempt daily questions and topic-wise quizzes.",
              },
              {
                step: "03",
                title: "Track Progress",
                desc: "Monitor your performance and improve continuously.",
              },
            ].map((item, index) => (
              <div
                key={item.step}
                className="text-center animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-display font-bold text-primary-foreground">
                    {item.step}
                  </span>
                </div>
                <h3 className="font-display text-xl font-semibold mb-2">
                  {item.title}
                </h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 gradient-primary" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center text-primary-foreground">
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
              Ready to Ace Your Math Exams?
            </h2>
            <p className="text-xl text-white/80 mb-10">
              Join thousands of students who are already improving their math
              skills with our platform.
            </p>
            <Link to="/register">
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-white/90 font-semibold px-10 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                Get Started for Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
