from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        # Navigate to the login page
        page.goto("http://localhost:5173/")

        # Register a new user
        page.click("text=Sign Up")
        page.fill("input[name='username']", "testuser")
        page.fill("input[name='password']", "password")
        page.fill("input[name='confirmPassword']", "password")
        page.click("text=Sign Up")

        # Log in with the new user
        page.wait_for_selector("text=Login")
        page.fill("input[name='username']", "testuser")
        page.fill("input[name='password']", "password")
        page.click("text=Login")

        # Create a room
        page.wait_for_selector("input[name='roomId']")
        page.fill("input[name='roomId']", "testroom")
        page.click("text=Create Room")

        # Verify that the icon is present and take a screenshot
        page.wait_for_url("**/chat")
        expect(page.locator("button[title='Search Users'] svg")).to_be_visible()
        page.screenshot(path="/app/frontend/frontend-chat/jules-scratch/verification/verification.png")

    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)