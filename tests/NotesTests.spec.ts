import { test, expect } from "@playwright/test";
import { HomePage } from "./pages/HomePage";
import { AddNotePage } from "./pages/AddNotePage";
import { reSeedData } from "./utils/Utils";
import { EditNotePage } from "./pages/EditNotePage";

test.afterAll(async () => {
    await reSeedData();
});

test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000/");
});

test("verify adding a note", async ({ page }) => {
    const homepage = new HomePage(page);
    await homepage.goToAddNote();

    const addnotepage = new AddNotePage(page);
    const noteId = await addnotepage.addNote("AutomatedTest", "Some text here");

    await expect(page.locator("h2")).toHaveText("List of Notes");
    await expect(page.locator(`#notetitle_${noteId}`)).toHaveText("AutomatedTest");
});

test("verify add note required fields", async ({ page }) => {
    const homepage = new HomePage(page);
    await homepage.goToAddNote();

    const addnotepage = new AddNotePage(page);
    await addnotepage.verifyRequiredFields();
});

test("verify deleting a note", async ({ page }) => {
    const homepage = new HomePage(page);
    await homepage.goToAddNote();

    const addnotepage = new AddNotePage(page);
    const noteId = await addnotepage.addNote("NoteToDelete", "Some text here");
    await expect(page.locator(`#notetitle_${noteId}`)).toBeVisible({ timeout: 3000 });
    await homepage.deleteNoteById(noteId);
    await expect(page.locator(`#notetitle_${noteId}`)).toHaveCount(0);
});

test("verify editing a note", async ({ page }) => {
    const homepage = new HomePage(page);
    await homepage.goToAddNote();

    const addnotepage = new AddNotePage(page);
    const noteId = await addnotepage.addNote("NoteToEdit", "Some text here");
    await expect(page.locator(`#notetitle_${noteId}`)).toBeVisible({ timeout: 3000 });
    await homepage.editNoteById(noteId, "NoteToEdit", "updated text for a test");
});

test("verify edit note required fields", async ({ page }) => {
    const homepage = new HomePage(page);
    await homepage.goToAddNote();

    const addnotepage = new AddNotePage(page);
    const noteId = await addnotepage.addNote("EditNoteRequiredFields", "Some text here");
    await expect(page.locator(`#notetitle_${noteId}`)).toBeVisible({ timeout: 3000 });

    await homepage.goToEditNoteById(noteId);
    const editnotepage = new EditNotePage(page);
    await editnotepage.verifyRequiredFields();
});
