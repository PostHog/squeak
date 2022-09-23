-- CreateTable
CREATE TABLE "Roadmap" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organization_id" TEXT NOT NULL,
    "teamId" BIGINT NOT NULL,
    "complete" BOOLEAN NOT NULL DEFAULT false,
    "github_issues" TEXT[],
    "description" TEXT,
    "title" TEXT NOT NULL,
    "date_completed" TIMESTAMPTZ(6),
    "projected_completion_date" TIMESTAMPTZ(6),
    "quarter_completed" INTEGER,
    "projected_completion_quarter" INTEGER,
    "category" TEXT NOT NULL,

    CONSTRAINT "Roadmap_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Roadmap" ADD CONSTRAINT "Roadmap_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "squeak_teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
