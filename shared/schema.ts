import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Base user schema from template
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Chat message schema
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  content: text("content").notNull(),
  role: text("role").notNull(), // 'user' or 'assistant'
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

// Model configuration schema
export const modelConfigs = pgTable("model_configs", {
  id: serial("id").primaryKey(),
  modelName: text("model_name").notNull(),
  baseModel: text("base_model").notNull(), // codellama, starcoder, wizardcoder, mistral
  fineTuningMethod: text("fine_tuning_method").notNull(), // qlora, full, sft
  deploymentPlatform: text("deployment_platform").notNull(), // huggingface, modal, local
  parameters: jsonb("parameters").notNull(), // temperature, max_length, etc.
  isActive: boolean("is_active").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Create insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  sessionId: true,
  content: true,
  role: true,
});

export const insertModelConfigSchema = createInsertSchema(modelConfigs).pick({
  modelName: true,
  baseModel: true,
  fineTuningMethod: true,
  deploymentPlatform: true,
  parameters: true,
  isActive: true,
});

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

export type InsertModelConfig = z.infer<typeof insertModelConfigSchema>;
export type ModelConfig = typeof modelConfigs.$inferSelect;
