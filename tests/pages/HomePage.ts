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
     * Deletes a note with the specified title.
     * @param {string} noteTitle - The title of the note to be deleted.
     * @returns {Promise<void>} A promise that resolves when the operation is complete.
     */
    async deleteNote(noteTitle: string): Promise<void> {
        await this.page.click("tr:has(td:text('" + noteTitle + "')) a");
    }

    /**
     * Edits a note with the specified title and updates its text.
     * Navigates to the "Edit Note" page, performs the edit, and verifies the changes.
     * @param {string} noteTitle - The title of the note to be edited.
     * @param {string} noteText - The new text to update the note with.
     * @returns {Promise<void>} A promise that resolves when the operation is complete.
     */
    async editNote(noteTitle: string, noteText: string): Promise<void> {
        // Navigate to the Edit Note page
        await this.page.locator("tr:has(td:text('" + noteTitle + "'))").locator("td:has(a:text('Edit'))").click();
        await expect(this.page.locator("h2")).toHaveText("Edit Note");

        // Perform the edit operation
        let editpage = new EditNotePage(this.page);
        await editpage.editNote(noteTitle, noteText);

        // View the updated note and verify the changes
        await this.page.locator("tr:has(td:text('" + noteTitle + "'))").locator("td:has(a:text('View'))").click();
        await expect(this.page.locator('#noteDescription')).toHaveText(noteText);
    }

    async goToEditNote(noteTitle: string): Promise<void> {
        await this.page.locator("tr:has(td:text('" + noteTitle + "'))").locator("td:has(a:text('Edit'))").click();
        await expect(this.page.locator("h2")).toHaveText("Edit Note");
    }
}
