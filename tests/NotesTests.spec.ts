import { test, expect } from "@playwright/test";
import { HomePage } from "./pages/HomePage";
import { AddNotePage } from "./pages/AddNotePage";
import { reSeedData } from "./utils/Utils";
import { EditNotePage } from "./pages/EditNotePage";

test.describe.configure({ mode: "serial" });

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
    await expect(page.locator(`#notetitle_${noteId} > div`)).toHaveText("AutomatedTest");
    await homepage.expectTimestampById(noteId, /^Created: .+/);
});

test("verify add note required fields", async ({ page }) => {
    const homepage = new HomePage(page);
    await homepage.goToAddNote();

    const addnotepage = new AddNotePage(page);
    await addnotepage.verifyRequiredFields();
});

test("verify add note character count", async ({ page }) => {
    const homepage = new HomePage(page);
    await homepage.goToAddNote();

    const addnotepage = new AddNotePage(page);
    await addnotepage.expectCharacterCount("0 characters");

    await addnotepage.notetext.fill("Line 1\nLine 2");
    await addnotepage.expectCharacterCount("13 characters");
});

test("verify deleting a note", async ({ page }) => {
    const homepage = new HomePage(page);
    await homepage.goToAddNote();

    const addnotepage = new AddNotePage(page);
    const noteId = await addnotepage.addNote("NoteToDelete", "Some text here");
    await expect(page.locator(`#notetitle_${noteId} > div`)).toBeVisible({ timeout: 3000 });
    await homepage.deleteNoteById(noteId);
    await expect(page.locator(`#notetitle_${noteId}`)).toHaveCount(0);
});

test("verify editing a note", async ({ page }) => {
    const homepage = new HomePage(page);
    await homepage.goToAddNote();

    const addnotepage = new AddNotePage(page);
    const noteId = await addnotepage.addNote("NoteToEdit", "Some text here");
    await expect(page.locator(`#notetitle_${noteId} > div`)).toBeVisible({ timeout: 3000 });
    await homepage.goToEditNoteById(noteId);
    const editnotepage = new EditNotePage(page);
    await editnotepage.editNote("NoteToEdit", "updated text for a test");
    await expect(page.locator("h2")).toHaveText("List of Notes");
    await homepage.expectTimestampById(noteId, /^Last edited: .+/);
    await page.locator(`#view_${noteId}`).click();
    await expect(page.locator("#noteDescription")).toHaveText("updated text for a test");
});

test("verify edit note required fields", async ({ page }) => {
    const homepage = new HomePage(page);
    await homepage.goToAddNote();

    const addnotepage = new AddNotePage(page);
    const noteId = await addnotepage.addNote("EditNoteRequiredFields", "Some text here");
    await expect(page.locator(`#notetitle_${noteId} > div`)).toBeVisible({ timeout: 3000 });

    await homepage.goToEditNoteById(noteId);
    const editnotepage = new EditNotePage(page);
    await editnotepage.verifyRequiredFields();
});

test("verify edit note character count", async ({ page }) => {
    const homepage = new HomePage(page);
    await homepage.goToAddNote();

    const addnotepage = new AddNotePage(page);
    const initialText = "Seed text";
    const noteId = await addnotepage.addNote("EditCharacterCount", initialText);
    await expect(page.locator(`#notetitle_${noteId} > div`)).toBeVisible({ timeout: 3000 });

    await homepage.goToEditNoteById(noteId);
    const editnotepage = new EditNotePage(page);

    await editnotepage.expectCharacterCount("9 characters");
    await editnotepage.notetext.fill("Updated value");
    await editnotepage.expectCharacterCount("13 characters");
});

test("verify seeded note shows created timestamp", async ({ page }) => {
    const homepage = new HomePage(page);
    await expect(page.locator("#notetitle_1 > div")).toHaveText("Test note");
    await homepage.expectTimestampById("1", /^Created: .+/);
});
