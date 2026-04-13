import {expect, Locator, Page} from "@playwright/test";
import {EditNotePage} from "./EditNotePage";

/**
 * Represents the Home Page in the application.
 * Provides methods to interact with and test the functionality of the page.
 */
export class HomePage {
    readonly page: Page;
    readonly header: Locator;
    readonly homelink: Locator;
    readonly addnotelink: Locator;

    /**
     * Initializes a new instance of the HomePage class.
     * @param {Page} page - The Playwright Page object representing the browser page.
     */
    constructor(page: Page) {
        this.page = page;
        this.header = page.locator('.App > .topnav');
        this.homelink = page.locator("#home");
        this.addnotelink = page.locator("#add");
    }

    /**
     * Navigates to the "Add Note" page by clicking the corresponding link.
     * Verifies that the navigation was successful by checking the page header.
     * @returns {Promise<void>} A promise that resolves when the operation is complete.
     */
    async goToAddNote(): Promise<void> {
        await this.addnotelink.click();
        await expect(this.page.locator('h2')).toHaveText("Add Note");
    }

    /**
     * Deletes the note created in the test using the list row delete link id (`delete_${noteId}`).
     */
    async deleteNoteById(noteId: string): Promise<void> {
        await this.page.locator(`#delete_${noteId}`).click();
    }

    /**
     * Edits a note by id, then opens view for that id and checks the description body.
     * @param noteId - Server id; matches `edit_${noteId}` / `view_${noteId}` in the list.
     * @param title - Title to submit on the edit form (usually unchanged from creation).
     * @param noteText - New note body text.
     */
    async editNoteById(noteId: string, title: string, noteText: string): Promise<void> {
        await this.page.locator(`#edit_${noteId}`).click();
        await expect(this.page.locator("h2")).toHaveText("Edit Note");

        const editpage = new EditNotePage(this.page);
        await editpage.editNote(title, noteText);

        await this.page.locator(`#view_${noteId}`).click();
        await expect(this.page.locator("#noteDescription")).toHaveText(noteText);
    }

    async goToEditNoteById(noteId: string): Promise<void> {
        await this.page.locator(`#edit_${noteId}`).click();
        await expect(this.page.locator("h2")).toHaveText("Edit Note");
    }
}
