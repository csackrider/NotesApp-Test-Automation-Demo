import {expect, Locator, Page} from "@playwright/test";

/**
 * Represents the Add Note Page in the application.
 * Provides methods to interact with and test the functionality of the page.
 */
export class AddNotePage {
    readonly page: Page;
    readonly header: Locator;
    readonly homelink: Locator;
    readonly addnotelink: Locator;
    readonly notetitle: Locator;
    readonly notetext: Locator;
    readonly submitButton: Locator;

    /**
     * Initializes a new instance of the AddNotePage class.
     * @param {Page} page - The Playwright Page object representing the browser page.
     */
    constructor(page: Page) {
        this.page = page;
        this.header = page.locator('.App > .topnav');
        this.homelink = page.locator("#home");
        this.addnotelink = page.locator("#add");
        this.notetitle = page.locator("#notetitle");
        this.notetext = page.locator("#notetext");
        this.submitButton = page.locator("#submit");
    }

    /**
     * Adds a new note by filling in the title and text fields and submitting the form.
     * @param {string} title - The title of the note to be added.
     * @param {string} notetext - The text of the note to be added.
     * @returns {Promise<void>} A promise that resolves when the operation is complete.
     */
    async addNote(title: string, notetext: string): Promise<void> {
        await this.notetitle.fill(title);
        await this.notetext.fill(notetext);
        await this.submitButton.click();
    }

    /**
     * Verifies that the required fields validation works as expected.
     * Ensures that the title field is required and validates correctly.
     * @returns {Promise<void>} A promise that resolves when the validation checks are complete.
     */
    async verifyRequiredFields(): Promise<void> {
        // Attempt to submit the form without filling required fields
        await this.submitButton.click();
        await this.page.waitForTimeout(1000);

        // Check if the title field is invalid
        let isValid = await this.notetitle.evaluate((element) => {
            const input = element as HTMLInputElement;
            return input.checkValidity();
        });
        expect(isValid).toBeFalsy();

        // Fill the title field and check if it becomes valid
        await this.notetitle.fill("test");
        isValid = await this.notetitle.evaluate((element) => {
            const input = element as HTMLInputElement;
            return input.checkValidity();
        });
        expect(isValid).toBeTruthy();
    }
}
