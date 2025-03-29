import React from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Github, Linkedin, Instagram, Code, Sparkles, Brain, Cpu, ArrowRight } from 'lucide-react';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-b from-background to-background/80 dark:from-background dark:to-background/90">
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center space-x-2"
        >
          <Code className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-500 text-transparent bg-clip-text">
            CodeAssist AI
          </h1>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Link href="/chat">
            <Button className="bg-primary hover:bg-primary/90">
              Launch App
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </header>
      
      <main className="container mx-auto px-4 py-12">
        <section className="flex flex-col md:flex-row items-center justify-between gap-12 py-16">
          <motion.div 
            className="flex-1"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
              Your <span className="bg-gradient-to-r from-primary to-purple-500 text-transparent bg-clip-text">Intelligent</span> Coding Assistant
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-md">
              Powered by Google's Gemini, CodeAssist AI provides intelligent coding solutions, debugging help, and expert guidance for developers.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/chat">
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  Start Coding Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <a href="https://github.com/HarshMishra-Git/AI-Code_Companion" target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline">
                  <Github className="mr-2 h-4 w-4" />
                  GitHub Repo
                </Button>
              </a>
            </div>
          </motion.div>
          
          <motion.div 
            className="flex-1 relative"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative w-full max-w-lg mx-auto">
              <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-primary to-purple-500 opacity-75 blur-xl"></div>
              <div className="relative bg-background rounded-xl shadow-xl overflow-hidden p-6 border border-muted">
                <div className="flex items-center mb-4">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="mx-auto text-xs text-muted-foreground">
                    code_assistant.js
                  </div>
                </div>
                <pre className="text-sm bg-muted p-4 rounded-md overflow-x-auto">
                  <code className="text-foreground font-mono">
{`function createAssistant() {
  return {
    help: (problem) => {
      return AI.solve(problem);
    },
    debug: (code) => {
      return AI.fixErrors(code);
    },
    explain: (concept) => {
      return AI.teachClearly(concept);
    }
  };
}

// Your intelligent coding companion
const codeAssist = createAssistant();`}
                  </code>
                </pre>
              </div>
            </div>
            
            <motion.div 
              className="absolute -z-10 w-72 h-72 bg-primary/30 rounded-full blur-3xl opacity-30 -top-10 -right-10"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.4, 0.3]
              }}
              transition={{ 
                duration: 8, 
                repeat: Infinity,
                repeatType: "reverse" 
              }}
            />
          </motion.div>
        </section>
        
        <motion.section 
          className="py-16"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Code className="h-10 w-10 text-primary" />,
                title: "Multi-Language Support",
                description: "Write, debug, and optimize code in Python, JavaScript, Java, C++, and more programming languages."
              },
              {
                icon: <Brain className="h-10 w-10 text-primary" />,
                title: "Advanced Problem Solving",
                description: "Get step-by-step solutions for complex coding challenges with detailed explanations."
              },
              {
                icon: <Sparkles className="h-10 w-10 text-primary" />,
                title: "Smart Code Generation",
                description: "Generate optimized, well-commented code snippets following modern best practices."
              },
              {
                icon: <Cpu className="h-10 w-10 text-primary" />,
                title: "Powered by Google Gemini",
                description: "Leveraging Google's most advanced AI model for accurate and helpful coding assistance."
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                className="bg-card rounded-xl p-6 shadow-lg border border-border hover:border-primary/50 transition-all hover:shadow-xl"
              >
                <div className="bg-primary/10 p-3 rounded-lg w-fit mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>
        
        <motion.section 
          className="py-16"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <div className="bg-card rounded-xl p-8 shadow-lg border border-border max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">Ready to Boost Your Coding?</h2>
            <p className="text-center text-muted-foreground mb-8">
              Start using CodeAssist AI today and transform your development workflow
            </p>
            <div className="flex justify-center">
              <Link href="/chat">
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  Get Started Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </motion.section>
      </main>
      
      <footer className="bg-card border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center space-x-2 mb-4">
                <Code className="h-6 w-6 text-primary" />
                <h3 className="text-xl font-bold">CodeAssist AI</h3>
              </div>
              <p className="text-muted-foreground text-sm max-w-md">
                An intelligent coding assistant powered by Google's Gemini AI, 
                designed to help developers write better code faster.
              </p>
            </div>
            
            <div className="flex flex-col items-center md:items-end">
              <p className="text-sm text-muted-foreground mb-4">
                Connect with the developer
              </p>
              <div className="flex space-x-4">
                {[
                  { icon: <Github className="h-5 w-5" />, url: "https://github.com/HarshMishra-Git/" },
                  { icon: <Linkedin className="h-5 w-5" />, url: "https://www.linkedin.com/in/harsh-mishra-56406925b/" },
                  { icon: <Instagram className="h-5 w-5" />, url: "https://instagram.com/harsh.__.1202/" }
                ].map((social, index) => (
                  <a 
                    key={index}
                    href={social.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-background border border-border hover:border-primary p-2 rounded-full transition-colors"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
          
          <div className="border-t border-border mt-8 pt-8 text-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} CodeAssist AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;