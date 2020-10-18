const AUTH_COOKIE_NAME: string = 'ocr-auth';
const UPLOADED_IMAGE_DIRECTORY: string = 'uploaded';
const THUMBNAIL_DIRECTORY: string = 'thumbnail';

const DATABASE_INITIALIZE_QUERY = `
    CREATE TABLE IF NOT EXISTS public."BlacklistedJwts" (
        jwtid text NOT NULL,
        exp bigint NOT NULL
    );
    CREATE TABLE IF NOT EXISTS public."Images" (
        "imageId" text NOT NULL,
        "imageUrl" text NOT NULL,
        "thumbnailUrl" text NOT NULL,
        "uploadedBy" text NOT NULL,
        "uploadedDate" bigint NOT NULL,
        status text
    );
    CREATE TABLE IF NOT EXISTS public."TextRegions" (
        "regionId" text NOT NULL,
        "imageId" text NOT NULL,
        region text NOT NULL,
        label text,
        status text NOT NULL,
        "uploadedBy" text NOT NULL,
        "labeledBy" text,
        "verifiedBy" text
    );
    CREATE TABLE IF NOT EXISTS public."Users" (
        username text NOT NULL,
        password text NOT NULL,
        "displayName" text NOT NULL,
        "canUpload" boolean NOT NULL,
        "canLabel" boolean NOT NULL,
        "canVerify" boolean NOT NULL,
        "canManageUsers" boolean NOT NULL,
        "canExport" boolean DEFAULT false NOT NULL
    );
    ALTER TABLE public."TextRegions" DROP CONSTRAINT IF EXISTS "TextRegions_pkey" CASCADE;
    ALTER TABLE ONLY public."TextRegions"
        ADD CONSTRAINT "TextRegions_pkey" PRIMARY KEY ("regionId");
    ALTER TABLE public."Images" DROP CONSTRAINT IF EXISTS "Images_pkey" CASCADE;
    ALTER TABLE ONLY public."Images"
        ADD CONSTRAINT "Images_pkey" PRIMARY KEY ("imageId");
    ALTER TABLE public."Users" DROP CONSTRAINT IF EXISTS "Users_pkey" CASCADE;
    ALTER TABLE ONLY public."Users"
        ADD CONSTRAINT "Users_pkey" PRIMARY KEY (username);
    CREATE UNIQUE INDEX IF NOT EXISTS "IMAGES_ID_INDEX" ON public."Images" USING btree ("imageId");
    CREATE INDEX IF NOT EXISTS "IMAGES_UPLOADED_BY_INDEX" ON public."Images" USING btree ("uploadedBy", "uploadedDate" DESC NULLS LAST);
    CREATE INDEX IF NOT EXISTS "TEXT_REGIONS_IMAGE_ID_INDEX" ON public."TextRegions" USING hash ("imageId");
    CREATE INDEX IF NOT EXISTS "TEXT_REGIONS_REGION_ID_INDEX" ON public."TextRegions" USING btree ("regionId", "uploadedBy", "labeledBy", "verifiedBy", status);
    CREATE INDEX IF NOT EXISTS "TOKEN_ID_INDEX" ON public."BlacklistedJwts" USING hash (jwtid);
    CREATE UNIQUE INDEX IF NOT EXISTS "USERS_USERNAME_INDEX" ON public."Users" USING btree (username);
    ALTER TABLE public."Images" DROP CONSTRAINT IF EXISTS "IMAGE_UPLOADED_BY";
    ALTER TABLE ONLY public."Images"
        ADD CONSTRAINT "IMAGE_UPLOADED_BY" FOREIGN KEY ("uploadedBy") REFERENCES public."Users"(username) ON DELETE CASCADE;
    ALTER TABLE public."TextRegions" DROP CONSTRAINT IF EXISTS "IMAGE_ID";
    ALTER TABLE ONLY public."TextRegions"
        ADD CONSTRAINT "IMAGE_ID" FOREIGN KEY ("imageId") REFERENCES public."Images"("imageId") ON DELETE CASCADE;
    ALTER TABLE public."TextRegions" DROP CONSTRAINT IF EXISTS "LABELED_BY";
    ALTER TABLE ONLY public."TextRegions"
        ADD CONSTRAINT "LABELED_BY" FOREIGN KEY ("labeledBy") REFERENCES public."Users"(username);
    ALTER TABLE public."TextRegions" DROP CONSTRAINT IF EXISTS "UPLOADED_BY";
    ALTER TABLE ONLY public."TextRegions"
        ADD CONSTRAINT "UPLOADED_BY" FOREIGN KEY ("uploadedBy") REFERENCES public."Users"(username) ON DELETE CASCADE;
    ALTER TABLE public."TextRegions" DROP CONSTRAINT IF EXISTS "VERIFIED_BY";
    ALTER TABLE ONLY public."TextRegions"
        ADD CONSTRAINT "VERIFIED_BY" FOREIGN KEY ("verifiedBy") REFERENCES public."Users"(username);
`;

export { AUTH_COOKIE_NAME, UPLOADED_IMAGE_DIRECTORY, THUMBNAIL_DIRECTORY, DATABASE_INITIALIZE_QUERY };