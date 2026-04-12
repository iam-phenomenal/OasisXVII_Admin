CREATE TYPE "public"."badge" AS ENUM('New Drop', 'Limited', 'Sold Out');--> statement-breakpoint
CREATE TYPE "public"."category" AS ENUM('tops', 'bottoms', 'accessories', 'footwear');--> statement-breakpoint
CREATE TYPE "public"."currency" AS ENUM('NGN', 'USD');--> statement-breakpoint
CREATE TYPE "public"."product_status" AS ENUM('active', 'draft', 'archived');--> statement-breakpoint
CREATE TABLE "admin_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admin_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"tagline" text NOT NULL,
	"description" text NOT NULL,
	"price" numeric(12, 2) NOT NULL,
	"currency" "currency" NOT NULL,
	"category" "category" NOT NULL,
	"badge" "badge",
	"status" "product_status" DEFAULT 'active' NOT NULL,
	"images" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"sizes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"colors" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"specs" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"related_product_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "products_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" text PRIMARY KEY NOT NULL,
	"hero_images" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"hero_headline" text,
	"hero_subheading" text,
	"payment_methods" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"logistics_fee_ngn" numeric(12, 2) DEFAULT '0' NOT NULL,
	"duty_tax_ngn" numeric(12, 2) DEFAULT '0' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
