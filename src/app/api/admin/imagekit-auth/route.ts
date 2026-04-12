import ImageKit from "imagekit";
import { NextResponse } from "next/server";

import { auth } from "@/auth";

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY ?? "",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY ?? "",
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT ?? "",
});

function hasImageKitConfig() {
  return Boolean(
    process.env.IMAGEKIT_PUBLIC_KEY &&
    process.env.IMAGEKIT_PRIVATE_KEY &&
    process.env.IMAGEKIT_URL_ENDPOINT,
  );
}

export async function GET() {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasImageKitConfig()) {
    return NextResponse.json(
      { error: "Image uploads are not configured." },
      { status: 500 },
    );
  }

  const authParams = imagekit.getAuthenticationParameters();

  return NextResponse.json({
    ...authParams,
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  });
}
