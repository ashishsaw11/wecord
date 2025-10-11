from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:5173/")
        page.get_by_label("Your Username").fill("testuser")
        page.get_by_label("Password").fill("password")
        page.get_by_role("button", name="Login").click()
        page.get_by_label("Room ID / New Room ID").fill("testroom")
        page.get_by_role("button", name="Join or Create Room").click()
        page.screenshot(path="jules-scratch/verification/verification.png")
        browser.close()

if __name__ == "__main__":
    run()
