import time
from playwright.sync_api import sync_playwright, expect

def run_verification():
    # Add a delay to allow the Vite dev server to reload after file creation.
    time.sleep(5)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the app
        page.goto("http://localhost:5173/")

        # Wait for the main heading to appear, which indicates the app is loaded.
        main_heading = page.get_by_role("heading", name="Canadian Elite Academy")
        expect(main_heading).to_be_visible(timeout=10000)

        # On the login page, find the "Read the Build Blog" button and click it.
        view_blog_button = page.get_by_role("button", name="Read the Build Blog")
        expect(view_blog_button).to_be_visible()
        view_blog_button.click()

        # Now on the blog page, find the new post's title.
        post_title = page.get_by_role("heading", name="Making The Cut 2025")
        expect(post_title).to_be_visible()

        # Find the table with participants to ensure the body is rendered.
        participant_table = page.get_by_role("table")
        expect(participant_table).to_be_visible()

        # Take a screenshot
        screenshot_path = "jules-scratch/verification/making-the-cut-post.png"
        page.screenshot(path=screenshot_path)

        browser.close()
        print(f"Screenshot saved to {screenshot_path}")

if __name__ == "__main__":
    run_verification()
