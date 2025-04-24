import {test, expect} from '@playwright/test';
import {HomePage} from "./pages/HomePage";
import {AddNotePage} from "./pages/AddNotePage";
import {reSeedData} from "./utils/Utils"
import {EditNotePage} from "./pages/EditNotePage";

test.afterAll(async () => {
    await reSeedData();
});

test.beforeEach(async ({page}) => {
    await page.goto('http://localhost:3000/');
});

test('verify adding a note', async ({page}) => {
    let homepage = new HomePage(page);
    await homepage.goToAddNote();

    let addnotepage = new AddNotePage(page);
    await addnotepage.addNote("AutomatedTest", "Some text here");

    //verify the user is returned to the note test page
    await expect(page.locator("h2")).toHaveText("List of Notes");
    //verify the note was added
    await page.waitForTimeout(500); //give it a fraction of a second to fully load. playwright is too fast sometimes
    let newNotes = page.locator('tr:has-text("AutomatedTest")');
    expect(await newNotes.count()).toBeGreaterThan(0); //greater than 0 due to duplicates when tests run in parallel

});

test('verify add note required fields', async ({page}) => {
    let homepage = new HomePage(page);
    await homepage.goToAddNote();

    let addnotepage = new AddNotePage(page);
    await addnotepage.verifyRequiredFields();

});

test('verify deleting a note', async ({page}) => {
    let homepage = new HomePage(page);
    await homepage.goToAddNote();

    let addnotepage = new AddNotePage(page);
    await addnotepage.addNote("NoteToDelete", "Some text here");
    await expect(page.locator("td:text-is('NoteToDelete')")).toBeVisible({timeout: 3000});
    await homepage.deleteNote("NoteToDelete");
    await expect(page.locator("td:text-is('NoteToDelete')")).not.toBeVisible({timeout: 3000});

});

test('verify editing a note', async ({page}) => {
    let homepage = new HomePage(page);
    await homepage.goToAddNote();

    let addnotepage = new AddNotePage(page);
    await addnotepage.addNote("NoteToEdit", "Some text here");
    await expect(page.locator("td:text-is('NoteToEdit')")).toBeVisible({timeout: 3000});
    await homepage.editNote("NoteToEdit", "updated text for a test");
    await expect(page.locator("td:text-is('NoteToDelete')")).not.toBeVisible({timeout: 3000});

});

test('verify edit note required fields', async ({page}) => {
    let homepage = new HomePage(page);
    await homepage.goToAddNote();

    let addnotepage = new AddNotePage(page);
    await addnotepage.addNote("EditNoteRequiredFields", "Some text here");
    await expect(page.locator("td:text-is('EditNoteRequiredFields')")).toBeVisible({timeout: 3000});

    await homepage.goToEditNote("EditNoteRequiredFields");
    let editnotepage = new EditNotePage(page);
    await editnotepage.verifyRequiredFields();

});

