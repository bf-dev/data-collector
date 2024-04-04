import { Hono } from "https://deno.land/x/hono@v3.4.1/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.0";

const app = new Hono();

const supabaseUri = Deno.env.get("SUPABASE_URI");
const supabaseKey = Deno.env.get("SUPABASE_KEY");

if (!supabaseUri || !supabaseKey) {
  throw new Error(
    "SUPABASE_URI or SUPABASE_KEY environment variables are undefined.",
  );
}

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
