from playwright.sync_api import sync_playwright, expect
import time

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        page.goto("http://localhost:5173/")

        # Wait for the page to load - checking for the first login button
        expect(page.get_by_role("button", name="Login").first).to_be_visible()

        # Click the button to switch to the Sign Up form
        page.get_by_role("button", name="Sign Up").first.click()

        # Fill out the registration form
        # Using a unique username to avoid conflicts from previous runs
        username = f"testuser_{int(time.time())}"
        page.fill("input[name='username']", username)
        page.fill("input[name='password']", "password123")
        page.fill("input[name='confirmPassword']", "password123")

        # Click the submit button for registration (it's the second "Sign Up" button)
        page.get_by_role("button", name="Sign Up").nth(1).click()

        # Wait for the success toast message for registration
        expect(page.locator("text=Registered successfully! Please login.")).to_be_visible(timeout=15000)

        # The form should now be on the Login page
        # Login with the new user
        page.fill("input[name='username']", username)
        page.fill("input[name='password']", "password123")

        # Click the login submit button (it's the second "Login" button)
        page.get_by_role("button", name="Login").nth(1).click()

        # Wait for the success toast message for login
        expect(page.locator("text=Logged in successfully!")).to_be_visible(timeout=15000)

        # After successful login, the view should change. Let's wait for the new view.
        expect(page.get_by_role("heading", name=f"Welcome, {username}")).to_be_visible()

        # Take a screenshot of the successful login
        page.screenshot(path="frontend/frontend-chat/jules-scratch/verification/verification.png")

    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)