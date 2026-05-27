import { defineConfig } from "drizzle-kit";

export default defineConfig({
	dialect: "postgresql",
	dbCredentials: {
		url: process.env.DATABASE_URL ?? "",
	},
	entities: {
		roles: {
			provider: "supabase",
		},
	},
	out: "./drizzle/migrations",
	schema: "./src/lib/db/schema.ts",
	strict: true,
	verbose: true,
});
