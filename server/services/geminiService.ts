import { GoogleGenerativeAI, GenerativeModel, GenerationConfig } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();


// Initialize the Gemini API
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error('GEMINI_API_KEY environment variable is not set');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);

// Enhanced coding-specific system prompt with domain-specific instructions
const SYSTEM_PROMPT = {
  role: "user",
  parts: [{
    text: `You are CodeAssist AI, an advanced domain-specific coding assistant built using state-of-the-art LLM technology. You are a specialized assistant optimized for coding tasks with the following capabilities and behaviors:

## Core Programming Capabilities
1. Help with coding tasks across multiple languages:
   - Python, JavaScript, TypeScript, Java, C++, Rust, Go, PHP, Ruby, and more
   - Debugging errors and fixing bugs in existing code
   - Explaining programming concepts with clear examples
   - Optimizing code for performance, readability, and maintainability
   - Implementing best practices specific to each language and framework

2. When generating code examples:
   - Use clear, informative comments to explain complex logic
   - Provide detailed explanations of the approach and algorithms used
   - Present complete, functional solutions that are ready to implement
   - Format code with proper indentation and styling conventions
   - Apply modern patterns and idioms appropriate to the language
   - Include error handling and edge cases where appropriate

3. For file uploads and document analysis:
   - Analyze uploaded code files to identify bugs, inefficiencies, and security issues
   - Extract key information from technical PDFs and documentation
   - Process code repositories to understand structure and dependencies
   - Offer contextual explanations based on uploaded content
   - Respond to specific questions about the uploaded materials

4. For error messages and debugging:
   - Analyze error messages with precision to identify root causes
   - Provide specific, targeted fixes with explanation of why they work
   - Offer step-by-step debugging instructions with testing strategies
   - Explain common pitfalls and how to avoid them in the future
   - Suggest better coding patterns to prevent similar errors

## Specialized Capabilities
1. Framework-specific assistance:
   - React, Angular, Vue.js for frontend development
   - Express, Django, Flask, Spring Boot for backend development
   - TensorFlow, PyTorch for machine learning applications
   - React Native, Flutter for mobile development

2. Database and data structure optimization:
   - SQL query optimization and database schema design
   - NoSQL database usage patterns
   - Efficient data structure selection and implementation
   - Memory optimization strategies

3. DevOps and deployment guidance:
   - Docker containerization
   - CI/CD pipeline setup
   - Cloud deployment strategies
   - Performance monitoring solutions

4. Security best practices:
   - Identifying common vulnerabilities
   - Secure coding patterns
   - Authentication and authorization implementations
   - Data protection strategies

## Interaction Style
- Be precise and technically accurate in all explanations
- Provide step-by-step guidance for complex tasks
- Use clear examples to illustrate concepts
- Acknowledge limitations when you're unsure, rather than providing incorrect information
- Maintain a helpful, patient, and educational tone

Remember that your primary purpose is to help users become better programmers by providing accurate, helpful coding assistance and educational explanations.`
  }]
};

// Configure different models for different code complexity
const CODE_MODELS = {
  gemini: {
    modelName: 'gemini-1.5-pro',
    temperature: 0.2, // Lower temperature for more deterministic code responses
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 8192,
  },
};

type ModelType = keyof typeof CODE_MODELS;

export class GeminiService {
  private model: GenerativeModel;
  private chat: any;
  private history: any[] = [];
  private settings: {
    temperature: number;
    maxOutputTokens: number;
  } = {
    temperature: 0.2,
    maxOutputTokens: 8192
  };
  
  constructor(modelType: ModelType = 'gemini') {
    const config = CODE_MODELS[modelType];
    
    // Create the model with the configuration
    this.model = genAI.getGenerativeModel({
      model: config.modelName,
      generationConfig: {
        temperature: config.temperature,
        topK: config.topK,
        topP: config.topP,
        maxOutputTokens: config.maxOutputTokens,
      } as GenerationConfig,
    });
    
    // Start a chat session with the initial system prompt
    this.initializeChat();
  }
  
  private initializeChat() {
    this.chat = this.model.startChat({
      history: [SYSTEM_PROMPT],
      generationConfig: {
        temperature: this.settings.temperature,
        maxOutputTokens: this.settings.maxOutputTokens,
      }
    });
  }
  
  // Update model settings
  public updateSettings(settings: Partial<typeof this.settings>) {
    this.settings = { ...this.settings, ...settings };
    
    // Reinitialize chat with new settings
    this.chat = this.model.startChat({
      history: [SYSTEM_PROMPT, ...this.history],
      generationConfig: {
        temperature: this.settings.temperature,
        maxOutputTokens: this.settings.maxOutputTokens,
      }
    });
  }
  
  // Load chat history for existing session
  public loadHistory(history: any[]) {
    this.history = history;
    this.initializeChat();
    
    // Add history after system prompt
    for (const message of history) {
      if (message.role === 'user' || message.role === 'model') {
        this.chat.history.push(message);
      }
    }
  }
  
  // Handle large inputs by chunking if necessary
  private preprocessLargeMessage(message: string): string {
    // If message is very large, add a note to process it in chunks
    const MAX_SIZE = 30000; // characters
    
    if (message.length > MAX_SIZE) {
      console.log(`Large message detected (${message.length} chars), processing...`);
      // For large file uploads, add a note to process it properly
      if (message.includes("I'm uploading the following content for analysis")) {
        return message.substring(0, MAX_SIZE) + 
          "\n\n[Note: This is a large file upload that has been truncated. I'll focus on analyzing the visible portion.]";
      }
      return message.substring(0, MAX_SIZE) + 
        "\n\n[Message truncated due to size limitations]";
    }
    
    return message;
  }
  
  // Send a message to the model and get the response
  public async sendMessage(message: string): Promise<string> {
    try {
      // Preprocess large messages if needed
      const processedMessage = this.preprocessLargeMessage(message);
      
      const userMessage = { role: 'user', parts: [{ text: processedMessage }] };
      
      const result = await this.chat.sendMessage(processedMessage);
      const response = result.response;
      const responseText = response.text();
      
      // Save message history
      this.history.push(userMessage);
      this.history.push({ role: 'model', parts: [{ text: responseText }] });
      
      return responseText;
    } catch (error) {
      console.error('Error sending message to Gemini:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
      }
      
      // Handle specific error cases
      if (error instanceof Error && error.message.includes('RESOURCE_EXHAUSTED')) {
        return "I'm sorry, but the request was too large for me to process. Please try sending a smaller portion of text or breaking your question into multiple smaller messages.";
      }
      
      return "I'm sorry, I encountered an error processing your request. Please try again or rephrase your question. If you're uploading a file, try with a smaller file or only the most relevant portion.";
    }
  }
  
  // Get the current conversation history
  public getHistory() {
    return this.history;
  }
  
  // Reset the conversation
  public resetChat() {
    this.history = [];
    this.initializeChat();
  }
}

// Export a singleton instance
export const geminiService = new GeminiService();