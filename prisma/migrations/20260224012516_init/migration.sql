/*
  Warnings:

  - Added the required column `gender` to the `TestSession` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TestSession" ADD COLUMN     "gender" TEXT NOT NULL;
