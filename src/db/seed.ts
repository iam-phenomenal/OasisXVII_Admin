import { Pool, neonConfig } from "@neondatabase/serverless";
import { hashSync } from "bcryptjs";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "./schema";
import type { PaymentMethodConfig } from "./schema";
import ws from "ws";

function getEnv(key: string): string {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required env var: ${key}`);
  }

  return value;
}

neonConfig.webSocketConstructor = ws;

const pool = new Pool({
  connectionString: getEnv("DATABASE_URL_UNPOOLED"),
  max: 1,
});

const db = drizzle({ client: pool, schema });

const PRODUCT_SEED: schema.NewProduct[] = [
  {
    id: "oas-01",
    slug: "monolith-hoodie-v01",
    name: "MONOLITH HOODIE V.01",
    tagline: "Midnight Black / Heavyweight",
    description:
      "The Monolith Hoodie V.01 is a heavyweight staple built for those who move in silence. Oversized silhouette, drop shoulders, and a clean minimal aesthetic.",
    price: "45000",
    currency: "NGN",
    category: "tops",
    badge: "New Drop",
    status: "active",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCw4BbeWVDx2Yd5eqEZTodd7klydHlRdKvsGoErfPNfs5GB1mSqIPH7-xBqPI8aJeFgk8a2enrPlA3KzoEipd5af9POYjAN2m22Vgxer3gTILomoSr16xaBa30BVIV5J4t0bz0z2pRwxbW9EHijq0ehzcfxathfcxG4He8dOo3WkospvAo_jYU4Tf_oP5mKJFCGg4UB2VTFmSHo8_oM8KHq7BVVBmtshwVGoqRw7f6pwDtGRVQKCO9YB6EApjuTCsrRao5NYMmkcA",
    ],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: ["Midnight Black"],
    specs: {
      Weight: "380GSM",
      Fit: "Oversized",
      Material: "100% Cotton",
      Care: "Cold wash",
    },
    relatedProductIds: ["oas-02", "oas-09", "oas-10"],
  },
  {
    id: "oas-02",
    slug: "void-tee",
    name: "VOID TEE",
    tagline: "Chalk White / Box Fit",
    description:
      "The Void Tee strips everything back to the essential. Box fit, heavyweight cotton, zero excess.",
    price: "18500",
    currency: "NGN",
    category: "tops",
    badge: null,
    status: "active",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDTKQ2_Z33ExEBs5b7p8izRsRA0EnURr3P7Ic7-im9uvt3FzIo00XPHlNBNeuhgE7Gbbmeot7GBiwT5yNzwKRkHCPsHbH_yxG1J-bXm86EC4XKGkx5IvJeer09P4v041jS7ZoOWx7pok2RJ65ouhLtwYKrw0eVZ_EatnDSU6CS_YoJcXXW1H-RqmXJysTmJ3iM5j7Mj-6CedrUV9dHAk33-68rPRnFEaqfkTw1vUPGU1ReIPEywypbL0OH3tn-Nf7PETeLVIvQV3A",
    ],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: ["Chalk White"],
    specs: {
      Weight: "220GSM",
      Fit: "Box Fit",
      Material: "100% Cotton",
      Care: "Cold wash",
    },
    relatedProductIds: ["oas-01", "oas-09", "oas-12"],
  },
  {
    id: "oas-03",
    slug: "neo-shell-jacket",
    name: "NEO-SHELL JACKET",
    tagline: "Onyx / Water Resistant",
    description:
      "The Neo-Shell Jacket is engineered for the city and beyond. Water-resistant nylon shell, mesh lining, and YKK zips throughout.",
    price: "82000",
    currency: "NGN",
    category: "tops",
    badge: "Limited",
    status: "active",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB2raYZzerU8FJKj7HSFMfD__k78vEbh0HF6S7Kej9sfMpSJFNwNJ_k_6jdkAYrQ6s0Hfg406_K4SK4cggEAxp8pTRnH2umwL-OdGtBJVj-b-yBrCRgN1A_i9lH3FOtSMUUiehDcqwuU6SY54JKagolSMJ_K7FTNhuiiw5oZLwFWeCxtaUmGaCqjgsfNK6NCbY9uVizLOYqQAWPxB72OS1Jig5WFRSFnoR0srxej0UfD-fFpDBDy68SNO-CcLvODb9H1zfu1AuIFg",
    ],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: ["Onyx"],
    specs: {
      Fabric: "Nylon Shell",
      Lining: "Mesh",
      Closure: "YKK Zip",
      Feature: "Water Resistant",
    },
    relatedProductIds: ["oas-04", "oas-06", "oas-11"],
  },
  {
    id: "oas-04",
    slug: "utility-cargo",
    name: "UTILITY CARGO",
    tagline: "Anthracite / Multi-pocket",
    description:
      "Eight-pocket utility cargo in ripstop nylon. Relaxed fit with drawstring waist and belt loops.",
    price: "32000",
    currency: "NGN",
    category: "bottoms",
    badge: null,
    status: "active",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB9ddsckBMIfDaznQ95xpFz06kSKYuTGR3JyCr68tsad9tVyAZKK_8LgI94GLoNYIvm85T2zDra16M_poAjUHjvNINMtvxC1UTwzRvZ9ayLMFlgwpJgu8BK9cL9kLoea4GQsglVFMa6Ec14xYhiENJSs3dEIiQyXh-rwqXoIMEihWgq5RTxPeoVtMdDhTMuJ-bYRW8SctE4QMWMkS8H8XnK--DkYvBi-eeCHGpX-JbAsEX754bCSJakeLjt_cZF586nm0QQOdCrjQ",
    ],
    sizes: ["28", "30", "32", "34", "36"],
    colors: ["Anthracite"],
    specs: {
      Material: "Ripstop Nylon",
      Fit: "Relaxed",
      Pockets: "8",
      Closure: "Drawstring + Belt",
    },
    relatedProductIds: ["oas-03", "oas-11", "oas-06"],
  },
  {
    id: "oas-05",
    slug: "gallery-beanie",
    name: "GALLERY BEANIE",
    tagline: "Shadow Grey / Merino",
    description:
      "Slouch-fit merino wool beanie. Lightweight, warm, and soft against the skin.",
    price: "12500",
    currency: "NGN",
    category: "accessories",
    badge: null,
    status: "active",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC9EkSpIGSiSSJXWi-FU8UwR2kyMl_ooOl0jnw0l55NGps4KoWdjt8y0l5bZ9JLkWwPg4eRypK-3XpyNW2PzjPkhmpywyRwwJd_JaCpIy9GdIw0LDnnzUFcAvmIDRqUCreYnRKXWI_Q8wjEcR0SbjPbZkzPxdCX-st1us3VmBwVS4RkKFhgAKkHqeBKfOWYJykYbtszyDy3I7yO4RyA7-Xy01k3_SDhEJWdjRpFwN1j6s2XzE68j1DqeG_-kl5DnKsb8M8OjFInoA",
    ],
    sizes: ["One Size"],
    colors: ["Shadow Grey"],
    specs: {
      Material: "100% Merino Wool",
      Fit: "Slouch",
      Care: "Hand wash cold",
    },
    relatedProductIds: ["oas-07", "oas-06", "oas-03"],
  },
  {
    id: "oas-06",
    slug: "silk-form-shirt",
    name: "SILK FORM SHIRT",
    tagline: "Deep Obsidian / Slim Fit",
    description:
      "100% silk slim-fit shirt with gunmetal buttons. Dry clean only.",
    price: "55000",
    currency: "NGN",
    category: "tops",
    badge: null,
    status: "active",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDPbgj2RpxF02FzLVAAHJKGREXQWKhySVXNZt76Rfo-DIbcC6PRcJkJKIXBAeYxn8_NLVOSgJ9kL75N7zMW70OjfK7cjKhBJ2A41hBTjHjJLAAraszkus5PfcoMd3WqThbart2oYK6CzIn6vuJlOAgulUz32NVTl8fITb5Ny1yImLQzKN_d-N7zQh3ov7nJJa0N75e4oeBcZRx9HP20qCLKedFAi-TuIKy54JYlgr2M3CJU469nO5tUgZBWBpqdgYmqFIZfXqs7LQ",
    ],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: ["Deep Obsidian"],
    specs: {
      Material: "100% Silk",
      Fit: "Slim",
      Buttons: "Gunmetal",
      Care: "Dry clean",
    },
    relatedProductIds: ["oas-03", "oas-01", "oas-04"],
  },
  {
    id: "oas-07",
    slug: "core-backpack",
    name: "CORE BACKPACK",
    tagline: "Matte Leather / 20L",
    description:
      "Full-grain leather 20L backpack with padded laptop sleeve up to 16 in. Built to carry the essentials without compromise.",
    price: "95000",
    currency: "NGN",
    category: "accessories",
    badge: "New Drop",
    status: "active",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC29k-9NVUojAdNhcn42ns6zicwyXLPZHl3OOsu2HLJSRHANeqnfjWg7mG-5v0wRs_2XUiEbPqfTfJH4wTtidE_gtFCwayKwX6E7yzlWozDigVIlzC6jGCBCkCVWhP5ayQ4KWRciZJnIiBqB4a9RSAmHkn8yBS3e4qZ_eZmK9kV9r-3F1QL3I4Y4Qi8k5igjYn64oz4QkVIJ6EfM5IcyPNTcULx3F8EneMQ0tND0jQfeYykzwz2geNzsEWXL7xZmC_SrC3NU34ABw",
    ],
    sizes: ["One Size"],
    colors: ["Matte Black"],
    specs: {
      Material: "Full-grain Leather",
      Volume: "20L",
      Laptop: "Up to 16 in.",
      Strap: "Padded",
    },
    relatedProductIds: ["oas-05", "oas-08", "oas-03"],
  },
  {
    id: "oas-08",
    slug: "oasisxvii-runner-01",
    name: "OasisXVII RUNNER 01",
    tagline: "Electric Orange",
    description:
      "The OasisXVII Runner 01 in Electric Orange. Mesh upper with TPU overlays, foam sole, and flat waxed laces.",
    price: "65000",
    currency: "NGN",
    category: "footwear",
    badge: "Sold Out",
    status: "active",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDJZsO85esERMeWVlwnT-2ZpBsKCzj3NLMmqZFZPg28mGwrJSx76g0v4wDVxEPZodKyiSvAmdC11kKI3B5vUEf810ruKYThlnq6mkP4ThcLDx9M6XSIDKds0_fHIH5zcpgWC1B2VRGrit5lElXL84E41mETuXub94ORQqTD6xqvKwBlci-grnFgnKvYlYkLIFXVKIpjR-TW1hwnaebBIYIs6zJAh9Xg2OiiM6FcPsDJko4Vsa01SiwFJYjwACT8vIjVIcFXrC5tgw",
    ],
    sizes: ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11"],
    colors: ["Electric Orange"],
    specs: {
      Upper: "Mesh + TPU",
      Sole: "Foam",
      Lacing: "Flat waxed",
    },
    relatedProductIds: ["oas-07", "oas-04", "oas-01"],
  },
  {
    id: "oas-09",
    slug: "heavy-core-tee",
    name: "HEAVY CORE TEE",
    tagline: "Midnight / 300GSM Cotton",
    description:
      "300GSM oversized tee in Midnight colorway. The heavy core of any rotation.",
    price: "22000",
    currency: "NGN",
    category: "tops",
    badge: null,
    status: "active",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD9ddsckBMIfDaznQ95xpFz06kSKYuTGR3JyCr68tsad9tVyAZKK_8LgI94GLoNYIvm85T2zDra16M_poAjUHjvNINMtvxC1UTwzRvZ9ayLMFlgwpJgu8BK9cL9kLoea4GQsglVFMa6Ec14xYhiENJSs3dEIiQyXh-rwqXoIMEihWgq5RTxPeoVtMdDhTMuJ-bYRW8SctE4QMWMkS8H8XnK--DkYvBi-eeCHGpX-JbAsEX754bCSJakeLjt_cZF586nm0QQOdCrjQ",
    ],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: ["Midnight"],
    specs: {
      Weight: "300GSM",
      Fit: "Oversized",
      Material: "100% Cotton",
      Care: "Cold wash",
    },
    relatedProductIds: ["oas-02", "oas-01", "oas-12"],
  },
  {
    id: "oas-10",
    slug: "oas-05-heavy-hoodie",
    name: "OAS-05 HEAVY HOODIE",
    tagline: "Vanta Black / Heavyweight Cotton",
    description:
      "380GSM heavyweight hoodie in Vanta Black. Oversized fit with screen-printed graphics.",
    price: "185",
    currency: "USD",
    category: "tops",
    badge: null,
    status: "active",
    images: [
      "https://lh3.googleusercontent.com/aida/ADBb0ujjXwpo7PnsDggY_IKqQzjcwTLArYKpqyuVnW5VDQiUDNI8DmyNQyKmMhN2O7cV-A12ORgZUH2q_VlcdCCv7djuivbTc-C1xDlx84_XrWtnhf-3-w3_Xuw-iVY4mhADlGh0szMFrDB3H9q8tFpUkx4k9NakXpzLJaLn7d__P5lwW9pHkcubEXQ926vclBVnJSQBAOnqtHnHnnH0cK8No7XTA7ikUnBMoXrPIflOoPwZE7CsrjfEUMfisCr0UC_pQXdSoK4YVQUnXA",
    ],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: ["Vanta Black"],
    specs: {
      Weight: "380GSM",
      Fit: "Oversized",
      Material: "100% Cotton",
      Print: "Screen print",
    },
    relatedProductIds: ["oas-01", "oas-09", "oas-12"],
  },
  {
    id: "oas-11",
    slug: "utility-pant-02",
    name: "UTILITY PANT 02",
    tagline: "Graphite Grey / Ripstop Nylon",
    description:
      "Six-pocket utility pant in ripstop nylon with adjustable waist. Relaxed fit built for movement.",
    price: "210",
    currency: "USD",
    category: "bottoms",
    badge: null,
    status: "active",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC7AQ4DAS_lLFVGw2wNSDcPU0-dJAJszQbRKRO9T2VS_Ev35FIHehwz4MRAH2LiGgZ4Y6KUjV0ckHKeJt6RwcCE3HzdRLAfn_wDkDRhNm0APd7-E8Jy-rkD81JLGDQCOWPUHTiY5XKCF81C0Wnvi4ED9eyEJ4_Nptw_P3zxMcvXaBHqWX6f2pkiObtr_ASRtuNKjyBaYSLRW0aw9i-Y2IqcTfHpm-dcCwFucQOSBAlSJ42zribmfbNlzBqrWH5xwCRxTZ0Ei3tbqQ",
    ],
    sizes: ["28", "30", "32", "34", "36"],
    colors: ["Graphite Grey"],
    specs: {
      Material: "Ripstop Nylon",
      Fit: "Relaxed",
      Pockets: "6",
      Waist: "Adjustable",
    },
    relatedProductIds: ["oas-04", "oas-03", "oas-06"],
  },
  {
    id: "oas-12",
    slug: "oasis-mascot-tee",
    name: "OASIS MASCOT TEE",
    tagline: "Ghost White / 300GSM Jersey",
    description:
      "300GSM oversized tee featuring the OasisXVII mascot in embroidered detail. Ghost White jersey.",
    price: "75",
    currency: "USD",
    category: "tops",
    badge: "Limited",
    status: "active",
    images: [
      "https://lh3.googleusercontent.com/aida/ADBb0uiqA91EQ2Nvs66lSgGuVeC9PHhMX3Vuq1HKmvvCxt1EsqDzcAE_D_6y6pP13qLk-h9OFHjdPqUJmd0V9qzxUHA8x_Vw67qvIIjPkXBXNnqQ6JX6QekZ6yfPVZHvj4b0WLJ9I2zUjZxBGO3AMtW1isg3MBAN9WS03eyxilffN-hrG6VpXENxco7IwljvLdH0_F3c8UnuxCPe4GmAV58hgUMGx8-fq-o-3uryIA1_rtwmwaRbpk_1kucI1DQDXfo8U8xgmAKRO4txig",
    ],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: ["Ghost White"],
    specs: {
      Weight: "300GSM",
      Fit: "Oversized",
      Material: "100% Cotton",
      Print: "Embroidered",
    },
    relatedProductIds: ["oas-09", "oas-02", "oas-01"],
  },
];

const HERO_IMAGES = PRODUCT_SEED.slice(0, 5).flatMap((product) => {
  const firstImage = product.images?.[0];

  return firstImage ? [firstImage] : [];
});

const DEFAULT_PAYMENT_METHODS: PaymentMethodConfig[] = [
  {
    id: "paystack",
    enabled: true,
    label: "Paystack",
    description: "Pay securely with Mastercard, Visa, or Verve.",
  },
  {
    id: "moniepoint",
    enabled: true,
    label: "Moniepoint - Bank Transfer",
    description:
      "Transfer to our Moniepoint account. Send proof of payment after checkout.",
  },
  {
    id: "zenith",
    enabled: true,
    label: "Zenith Bank - Bank Transfer",
    description:
      "Transfer to our Zenith Bank account. Send proof of payment after checkout.",
  },
];

async function main() {
  console.log("Seeding database...");

  const existingProducts = await db.query.products.findMany();

  if (existingProducts.length > 0) {
    console.log(
      `  products: skipped (${existingProducts.length} rows already exist)`,
    );
  } else {
    await db.insert(schema.products).values(PRODUCT_SEED);
    console.log(`  products: inserted ${PRODUCT_SEED.length} rows`);
  }

  const existingSettings = await db.query.settings.findFirst({
    where: (settings, { eq }) => eq(settings.id, "global"),
  });

  if (existingSettings) {
    console.log("  settings: skipped (global row already exists)");
  } else {
    await db.insert(schema.settings).values({
      id: "global",
      heroImages: HERO_IMAGES,
      heroHeadline: null,
      heroSubheading: null,
      paymentMethods: DEFAULT_PAYMENT_METHODS,
      logisticsFeeNgn: "4500",
      dutyTaxNgn: "11062",
    });
    console.log("  settings: inserted global row");
  }

  const adminEmail = getEnv("SEED_ADMIN_EMAIL");
  const adminPassword = getEnv("SEED_ADMIN_PASSWORD");

  const existingAdmin = await db.query.adminUsers.findFirst({
    where: (adminUsers, { eq }) => eq(adminUsers.email, adminEmail),
  });

  if (existingAdmin) {
    console.log(`  admin_users: skipped (${adminEmail} already exists)`);
  } else {
    const passwordHash = hashSync(adminPassword, 12);
    await db
      .insert(schema.adminUsers)
      .values({ email: adminEmail, passwordHash });
    console.log(`  admin_users: inserted ${adminEmail}`);
  }

  console.log("Done.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
