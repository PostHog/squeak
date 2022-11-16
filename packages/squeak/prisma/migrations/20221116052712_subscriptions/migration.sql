-- CreateTable
CREATE TABLE "_ProfileToRoadmap" (
    "A" UUID NOT NULL,
    "B" BIGINT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ProfileToRoadmap_AB_unique" ON "_ProfileToRoadmap"("A", "B");

-- CreateIndex
CREATE INDEX "_ProfileToRoadmap_B_index" ON "_ProfileToRoadmap"("B");

-- AddForeignKey
ALTER TABLE "_ProfileToRoadmap" ADD CONSTRAINT "_ProfileToRoadmap_A_fkey" FOREIGN KEY ("A") REFERENCES "squeak_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProfileToRoadmap" ADD CONSTRAINT "_ProfileToRoadmap_B_fkey" FOREIGN KEY ("B") REFERENCES "squeak_roadmaps"("id") ON DELETE CASCADE ON UPDATE CASCADE;
