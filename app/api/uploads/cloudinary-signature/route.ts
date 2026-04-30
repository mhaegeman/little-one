import { NextResponse } from "next/server";
import { getCloudinary } from "@/lib/integrations/cloudinary";
import { createClient } from "@/lib/db/supabase/server";

export async function POST() {
  const supabase = await createClient();

  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured" }, { status: 503 });
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cloudinary = getCloudinary();

  if (!cloudinary) {
    return NextResponse.json({ error: "Cloudinary is not configured" }, { status: 503 });
  }

  const timestamp = Math.round(Date.now() / 1000);
  const folder = "lille-liv/journal";
  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp,
      folder
    },
    process.env.CLOUDINARY_API_SECRET!
  );

  return NextResponse.json({
    timestamp,
    folder,
    signature,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY
  });
}
