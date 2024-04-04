import { Hono } from "https://deno.land/x/hono@v4.2.1/mod.ts";
import { bearerAuth } from "https://deno.land/x/hono@v4.2.1/middleware/bearer-auth/index.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.0";

const app = new Hono();

const supabaseUri = Deno.env.get("SUPABASE_URI");
const supabaseKey = Deno.env.get("SUPABASE_KEY");
const authToken = Deno.env.get("AUTH_TOKEN");

if (!supabaseUri || !supabaseKey || !authToken) {
  throw new Error(
    "SUPABASE_URI or SUPABASE_KEY or AUTH_TOKEN environment variables are undefined.",
  );
}

app.use("/*", bearerAuth({ token: authToken }));

const supabase = createClient(supabaseUri, supabaseKey);

app.post("/record/steps", async (context) => {
  const { steps, startDate } = await context.req.json();
  const hourlyDate = new Date(startDate);
  hourlyDate.setMinutes(0, 0, 0);
  await supabase.from("health_steps").upsert({
    date: hourlyDate,
    steps,
  });
  return context.text("OK");
});

Deno.serve(app.fetch);
