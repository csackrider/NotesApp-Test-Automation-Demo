import { expect, Locator, Page, type Response } from "@playwright/test";

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
     * Waits for the json-server POST that creates a note and returns the new note id.
     */
    private waitForCreateNoteResponse(): Promise<Response> {
        return this.page.waitForResponse((res) => {
            if (res.request().method() !== "POST" || !res.ok()) return false;
            try {
                const u = new URL(res.url());
                const hostOk = u.hostname === "localhost" || u.hostname === "127.0.0.1";
                const pathOk = u.pathname === "/notes" || u.pathname === "/notes/";
                return hostOk && u.port === "3004" && pathOk;
            } catch {
                return false;
            }
        });
    }

    /**
     * Adds a new note by filling in the title and text fields and submitting the form.
     * @param {string} title - The title of the note to be added.
     * @param {string} notetext - The text of the note to be added.
     * @returns The server-assigned note id (matches `view_${id}`, `edit_${id}`, `delete_${id}` on the list).
     */
    async addNote(title: string, notetext: string): Promise<string> {
        const responsePromise = this.waitForCreateNoteResponse();
        await this.notetitle.fill(title);
        await this.notetext.fill(notetext);
        await this.submitButton.click();
        const response = await responsePromise;
        const body = (await response.json()) as { id?: string | number };
        if (body.id === undefined || body.id === null) {
            throw new Error("POST /notes response missing id");
        }
        return String(body.id);
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
